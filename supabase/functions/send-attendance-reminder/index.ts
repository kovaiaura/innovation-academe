import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderTemplate {
  subject: string;
  body: string;
}

interface EmailTemplateSettings {
  from_name: string;
  from_email: string;
  company_name: string;
}

const defaultTemplate: ReminderTemplate = {
  subject: "Reminder: {type} at {time}",
  body: `Dear {name},

This is a friendly reminder that your {type} time is at {time} today ({date}).

Please make sure to {type_action} on time.

Best regards,
HR Department`,
};

const defaultEmailSettings: EmailTemplateSettings = {
  from_name: "Meta Skills Academy",
  from_email: "noreply@edu.metasageacademy.com",
  company_name: "Meta Skills Academy",
};

function applyTemplate(
  template: string,
  vars: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return -1;
  const parts = timeStr.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function minutesToTimeStr(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

async function sendEmail(
  to: string,
  subject: string,
  body: string,
  settings: EmailTemplateSettings,
  supabase: any
): Promise<void> {
  let RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  try {
    const { data: config } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'resend_api_key')
      .single();

    const customKey = (config?.value as any)?.api_key;
    if (customKey) {
      RESEND_API_KEY = customKey;
    }
  } catch (_e) {
    // Use default key
  }

  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const fromAddress = `${settings.from_name} <${settings.from_email}>`;
  const htmlBody = body.replace(/\n/g, "<br>");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html: htmlBody,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Resend API error:", errorData);
    throw new Error(errorData.message || "Failed to send email");
  }
}

// Check if a user is on approved full-day leave today
async function isOnLeaveToday(supabase: any, userId: string, todayStr: string): Promise<boolean> {
  const { data: leaves } = await supabase
    .from("leave_applications")
    .select("id, leave_duration")
    .eq("applicant_id", userId)
    .eq("status", "approved")
    .lte("start_date", todayStr)
    .gte("end_date", todayStr);

  if (!leaves || leaves.length === 0) return false;
  return leaves.some((l: any) => l.leave_duration !== 'half_day');
}

// Check if already dispatched (deduplication)
async function alreadyDispatched(
  supabase: any,
  userId: string,
  reminderType: string,
  dateStr: string,
  scheduledTime: string
): Promise<boolean> {
  const { data } = await supabase
    .from("attendance_reminder_dispatch_log")
    .select("id")
    .eq("user_id", userId)
    .eq("reminder_type", reminderType)
    .eq("reminder_date", dateStr)
    .eq("scheduled_time", scheduledTime)
    .limit(1);

  return (data && data.length > 0);
}

// Record dispatch
async function recordDispatch(
  supabase: any,
  userId: string,
  reminderType: string,
  dateStr: string,
  scheduledTime: string
): Promise<void> {
  await supabase
    .from("attendance_reminder_dispatch_log")
    .upsert({
      user_id: userId,
      reminder_type: reminderType,
      reminder_date: dateStr,
      scheduled_time: scheduledTime,
    }, { onConflict: "user_id,reminder_type,reminder_date,scheduled_time" });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for catch-up mode from request body
    let catchupMinutes = 0;
    try {
      const body = await req.json();
      if (body?.mode === "catchup") {
        catchupMinutes = body.catchup_window || 30;
      }
    } catch (_) {
      // No body or invalid JSON - realtime mode
    }

    console.log(`[attendance-reminder] Function invoked at ${new Date().toISOString()} mode=${catchupMinutes > 0 ? 'catchup(' + catchupMinutes + 'min)' : 'realtime'}`);

    // 1. Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentMinutesOfDay = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();
    const todayStr = istNow.toISOString().split("T")[0];
    const dayOfWeek = istNow.getUTCDay(); // 0=Sun, 6=Sat

    // 2. Weekend check
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log("[attendance-reminder] Weekend, skipping all reminders.");
      return new Response(
        JSON.stringify({ message: "Weekend - no reminders" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Company holiday check
    const { data: companyHolidayCheck } = await supabase
      .from("company_holidays")
      .select("id")
      .lte("date", todayStr)
      .gte("end_date", todayStr);

    const { data: singleDayHoliday } = await supabase
      .from("company_holidays")
      .select("id")
      .eq("date", todayStr)
      .is("end_date", null);

    if ((companyHolidayCheck && companyHolidayCheck.length > 0) ||
        (singleDayHoliday && singleDayHoliday.length > 0)) {
      console.log("[attendance-reminder] Company holiday today, skipping all reminders.");
      return new Response(
        JSON.stringify({ message: "Company holiday - no reminders" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Fetch reminder settings
    const { data: settingsData } = await supabase
      .from("leave_settings")
      .select("setting_key, setting_value")
      .eq("setting_key", "reminder_minutes_before");

    const minutesBefore = Number(settingsData?.[0]?.setting_value) || 5;

    // In catch-up mode, scan a wider window; in realtime mode, ±1 minute
    const windowMin = catchupMinutes > 0
      ? currentMinutesOfDay + minutesBefore - catchupMinutes
      : currentMinutesOfDay + minutesBefore - 1;
    const windowMax = currentMinutesOfDay + minutesBefore + 1;

    console.log(`[attendance-reminder] IST: ${istNow.getUTCHours()}:${String(istNow.getUTCMinutes()).padStart(2, '0')} minutesBefore=${minutesBefore} window=${windowMin}-${windowMax} (${minutesToTimeStr(windowMin)}-${minutesToTimeStr(windowMax)})`);

    // 5. Fetch templates
    const { data: templateData } = await supabase
      .from("system_configurations")
      .select("value")
      .eq("key", "attendance_reminder_template")
      .single();

    const template: ReminderTemplate = templateData?.value
      ? { ...defaultTemplate, ...(templateData.value as any) }
      : defaultTemplate;

    const { data: emailSettingsData } = await supabase
      .from("system_configurations")
      .select("value")
      .eq("key", "email_template_settings")
      .single();

    const emailSettings: EmailTemplateSettings = emailSettingsData?.value
      ? { ...defaultEmailSettings, ...(emailSettingsData.value as any) }
      : defaultEmailSettings;

    let emailsSent = 0;
    let skippedLeave = 0;
    let skippedNotif = 0;
    let skippedWindow = 0;
    let skippedDuplicate = 0;
    let failedSend = 0;

    // 6. Process staff reminders (profile-based times)
    // Fetch student user IDs to exclude from reminders
    const { data: studentRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");
    const studentUserIds = new Set((studentRoles || []).map((r: any) => r.user_id));

    const { data: staffProfiles } = await supabase
      .from("profiles")
      .select("id, name, email, check_in_time, check_out_time, enable_notifications")
      .not("email", "is", null)
      .not("check_in_time", "is", null);

    console.log(`[attendance-reminder] Staff profiles found: ${staffProfiles?.length || 0}, excluded students: ${studentUserIds.size}`);

    if (staffProfiles) {
      for (const profile of staffProfiles) {
        // Skip students — only staff and officers should receive reminders
        if (studentUserIds.has(profile.id)) continue;
        if (!profile.email) continue;
        if (profile.enable_notifications === false) { skippedNotif++; continue; }

        if (await isOnLeaveToday(supabase, profile.id, todayStr)) {
          skippedLeave++;
          continue;
        }

        const types: { type: string; time: string }[] = [];
        if (profile.check_in_time) {
          const ciMin = timeToMinutes(profile.check_in_time);
          if (ciMin >= windowMin && ciMin <= windowMax) {
            types.push({ type: "Check-in", time: profile.check_in_time });
          } else {
            skippedWindow++;
          }
        }
        if (profile.check_out_time) {
          const coMin = timeToMinutes(profile.check_out_time);
          if (coMin >= windowMin && coMin <= windowMax) {
            types.push({ type: "Check-out", time: profile.check_out_time });
          }
        }

        for (const { type, time } of types) {
          const reminderType = type === "Check-in" ? "check-in" : "check-out";

          // Dedup check
          if (await alreadyDispatched(supabase, profile.id, reminderType, todayStr, time)) {
            skippedDuplicate++;
            continue;
          }

          const vars = {
            name: profile.name || "Employee",
            type,
            type_action: type === "Check-in" ? "check in" : "check out",
            time: time || "",
            date: todayStr,
          };

          try {
            const subject = applyTemplate(template.subject, vars);
            const body = applyTemplate(template.body, vars);
            await sendEmail(profile.email, subject, body, emailSettings, supabase);
            await recordDispatch(supabase, profile.id, reminderType, todayStr, time);
            emailsSent++;
            console.log(`[attendance-reminder] ✅ Sent ${type} reminder to ${profile.email} (staff)`);
          } catch (err) {
            failedSend++;
            console.error(`[attendance-reminder] ❌ Failed ${profile.email}:`, err);
          }
        }
      }
    }

    // 7. Process officer reminders (institution-based times)
    const { data: institutions } = await supabase
      .from("institutions")
      .select("id, settings, name");

    console.log(`[attendance-reminder] Institutions found: ${institutions?.length || 0}`);

    if (institutions) {
      for (const inst of institutions) {
        const s = inst.settings as Record<string, any> | null;
        if (!s) continue;

        const instTypes: { type: string; time: string }[] = [];
        if (s.check_in_time) {
          const ciMin = timeToMinutes(s.check_in_time);
          if (ciMin >= windowMin && ciMin <= windowMax) {
            instTypes.push({ type: "Check-in", time: s.check_in_time });
          }
        }
        if (s.check_out_time) {
          const coMin = timeToMinutes(s.check_out_time);
          if (coMin >= windowMin && coMin <= windowMax) {
            instTypes.push({ type: "Check-out", time: s.check_out_time });
          }
        }

        if (instTypes.length === 0) continue;

        // Check institution holidays
        const { data: instHolidayRange } = await supabase
          .from("institution_holidays")
          .select("id")
          .eq("institution_id", inst.id)
          .lte("date", todayStr)
          .gte("end_date", todayStr);

        const { data: instHolidaySingle } = await supabase
          .from("institution_holidays")
          .select("id")
          .eq("institution_id", inst.id)
          .eq("date", todayStr)
          .is("end_date", null);

        if ((instHolidayRange && instHolidayRange.length > 0) ||
            (instHolidaySingle && instHolidaySingle.length > 0)) {
          console.log(`[attendance-reminder] Institution ${inst.name || inst.id} holiday today, skipping.`);
          continue;
        }

        // Calendar day type check
        const { data: calendarHoliday } = await supabase
          .from("calendar_day_types")
          .select("id")
          .eq("institution_id", inst.id)
          .eq("date", todayStr)
          .eq("day_type", "holiday");

        if (calendarHoliday && calendarHoliday.length > 0) {
          console.log(`[attendance-reminder] Institution ${inst.name || inst.id} calendar holiday, skipping.`);
          continue;
        }

        // Get officers assigned to this institution (column is full_name, not name)
        const { data: officers } = await supabase
          .from("officers")
          .select("id, user_id, full_name, email")
          .contains("assigned_institutions", [inst.id]);

        if (!officers) continue;

        for (const officer of officers) {
          if (!officer.email) continue;

          // Check notification setting via profile
          if (officer.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("enable_notifications")
              .eq("id", officer.user_id)
              .single();
            if (profile?.enable_notifications === false) { skippedNotif++; continue; }

            if (await isOnLeaveToday(supabase, officer.user_id, todayStr)) {
              skippedLeave++;
              continue;
            }
          }

          for (const { type, time } of instTypes) {
            const userId = officer.user_id || officer.id;
            const reminderType = type === "Check-in" ? "check-in" : "check-out";

            if (await alreadyDispatched(supabase, userId, reminderType, todayStr, time)) {
              skippedDuplicate++;
              continue;
            }

            const vars = {
              name: officer.full_name || "Officer",
              type,
              type_action: type === "Check-in" ? "check in" : "check out",
              time: time || "",
              date: todayStr,
            };

            try {
              const subject = applyTemplate(template.subject, vars);
              const body = applyTemplate(template.body, vars);
              await sendEmail(officer.email, subject, body, emailSettings, supabase);
              await recordDispatch(supabase, userId, reminderType, todayStr, time);
              emailsSent++;
              console.log(`[attendance-reminder] ✅ Sent ${type} reminder to ${officer.email} (officer @ ${inst.name})`);
            } catch (err) {
              failedSend++;
              console.error(`[attendance-reminder] ❌ Failed ${officer.email}:`, err);
            }
          }
        }
      }
    }

    console.log(`[attendance-reminder] Done. sent=${emailsSent} skipped_leave=${skippedLeave} skipped_notif=${skippedNotif} skipped_window=${skippedWindow} skipped_dup=${skippedDuplicate} failed=${failedSend}`);

    return new Response(
      JSON.stringify({ success: true, emails_sent: emailsSent, skipped_leave: skippedLeave, skipped_notif: skippedNotif, skipped_duplicate: skippedDuplicate, failed: failedSend }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[attendance-reminder] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
