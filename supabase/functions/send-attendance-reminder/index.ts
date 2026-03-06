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
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
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
  } catch (e) {
    console.log('No custom Resend API key found, using default');
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

  // If any approved leave is full_day, they're on leave. Half-day leaves still need reminders.
  return leaves.some((l: any) => l.leave_duration !== 'half_day');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[attendance-reminder] Function invoked at", new Date().toISOString());

    // 1. Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentMinutesOfDay = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();
    const todayStr = istNow.toISOString().split("T")[0];
    const dayOfWeek = istNow.getUTCDay(); // 0=Sun, 6=Sat

    // 2. Weekend check — skip all
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log("[attendance-reminder] Weekend, skipping all reminders.");
      return new Response(
        JSON.stringify({ message: "Weekend - no reminders" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Company holiday check — skip all
    const { data: companyHolidays } = await supabase
      .from("company_holidays")
      .select("id")
      .lte("date", todayStr)
      .or(`end_date.gte.${todayStr},end_date.is.null,date.eq.${todayStr}`);

    // Filter: today must be between date and end_date (or date == today if no end_date)
    const isCompanyHoliday = companyHolidays?.some((h: any) => true) || false;
    // More precise check
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

    // 4. Fetch reminder settings (only minutes_before now)
    const { data: settingsData } = await supabase
      .from("leave_settings")
      .select("setting_key, setting_value")
      .eq("setting_key", "reminder_minutes_before");

    const minutesBefore = Number(settingsData?.[0]?.setting_value) || 5;

    const targetMinutesMin = currentMinutesOfDay + minutesBefore - 1;
    const targetMinutesMax = currentMinutesOfDay + minutesBefore + 1;

    console.log("[attendance-reminder] IST time:", `${istNow.getUTCHours()}:${istNow.getUTCMinutes()}`,
      "Minutes before:", minutesBefore, "Target window:", targetMinutesMin, "-", targetMinutesMax);

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

    // 6. Process staff reminders (profile-based times)
    const { data: staffProfiles } = await supabase
      .from("profiles")
      .select("id, name, email, check_in_time, check_out_time, enable_notifications")
      .not("email", "is", null)
      .not("check_in_time", "is", null);

    console.log("[attendance-reminder] Staff profiles found:", staffProfiles?.length || 0);

    if (staffProfiles) {
      for (const profile of staffProfiles) {
        if (!profile.email) continue;
        if (profile.enable_notifications === false) continue;

        // Check if on approved full-day leave
        if (await isOnLeaveToday(supabase, profile.id, todayStr)) {
          console.log(`[attendance-reminder] Skipping ${profile.email} - on leave`);
          continue;
        }

        const types: string[] = [];
        if (profile.check_in_time) {
          const ciMin = timeToMinutes(profile.check_in_time);
          if (ciMin >= targetMinutesMin && ciMin <= targetMinutesMax) types.push("Check-in");
        }
        if (profile.check_out_time) {
          const coMin = timeToMinutes(profile.check_out_time);
          if (coMin >= targetMinutesMin && coMin <= targetMinutesMax) types.push("Check-out");
        }

        for (const type of types) {
          const timeStr = type === "Check-in" ? profile.check_in_time : profile.check_out_time;
          const vars = {
            name: profile.name || "Employee",
            type,
            type_action: type === "Check-in" ? "check in" : "check out",
            time: timeStr || "",
            date: todayStr,
          };

          try {
            const subject = applyTemplate(template.subject, vars);
            const body = applyTemplate(template.body, vars);
            await sendEmail(profile.email, subject, body, emailSettings, supabase);
            emailsSent++;
            console.log(`[attendance-reminder] Sent ${type} reminder to ${profile.email}`);
          } catch (err) {
            console.error(`[attendance-reminder] Failed to send to ${profile.email}:`, err);
          }
        }
      }
    }

    // 7. Process officer reminders (institution-based times)
    const { data: institutions } = await supabase
      .from("institutions")
      .select("id, settings");

    console.log("[attendance-reminder] Institutions found:", institutions?.length || 0);

    if (institutions) {
      for (const inst of institutions) {
        const s = inst.settings as Record<string, any> | null;
        if (!s) continue;

        const types: string[] = [];
        if (s.check_in_time) {
          const ciMin = timeToMinutes(s.check_in_time);
          if (ciMin >= targetMinutesMin && ciMin <= targetMinutesMax) types.push("Check-in");
        }
        if (s.check_out_time) {
          const coMin = timeToMinutes(s.check_out_time);
          if (coMin >= targetMinutesMin && coMin <= targetMinutesMax) types.push("Check-out");
        }

        if (types.length === 0) continue;

        // Check institution holiday for this institution
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
          console.log(`[attendance-reminder] Institution ${inst.id} holiday today, skipping officers.`);
          continue;
        }

        // Also check calendar_day_types for institution holidays
        const { data: calendarHoliday } = await supabase
          .from("calendar_day_types")
          .select("id")
          .eq("institution_id", inst.id)
          .eq("date", todayStr)
          .eq("day_type", "holiday");

        if (calendarHoliday && calendarHoliday.length > 0) {
          console.log(`[attendance-reminder] Institution ${inst.id} calendar holiday, skipping officers.`);
          continue;
        }

        const { data: officers } = await supabase
          .from("officers")
          .select("id, user_id, name, email")
          .contains("assigned_institutions", [inst.id]);

        if (!officers) continue;

        for (const officer of officers) {
          if (!officer.email) continue;

          // Check individual notification setting
          if (officer.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("enable_notifications")
              .eq("id", officer.user_id)
              .single();
            if (profile?.enable_notifications === false) continue;

            // Check if officer is on approved full-day leave
            if (await isOnLeaveToday(supabase, officer.user_id, todayStr)) {
              console.log(`[attendance-reminder] Skipping officer ${officer.email} - on leave`);
              continue;
            }
          }

          for (const type of types) {
            const timeStr = type === "Check-in" ? s.check_in_time : s.check_out_time;
            const vars = {
              name: officer.name || "Officer",
              type,
              type_action: type === "Check-in" ? "check in" : "check out",
              time: timeStr || "",
              date: todayStr,
            };

            try {
              const subject = applyTemplate(template.subject, vars);
              const body = applyTemplate(template.body, vars);
              await sendEmail(officer.email, subject, body, emailSettings, supabase);
              emailsSent++;
              console.log(`[attendance-reminder] Sent ${type} reminder to ${officer.email}`);
            } catch (err) {
              console.error(`[attendance-reminder] Failed to send to ${officer.email}:`, err);
            }
          }
        }
      }
    }

    console.log(`[attendance-reminder] Done. Emails sent: ${emailsSent}`);

    return new Response(
      JSON.stringify({ success: true, emails_sent: emailsSent }),
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
