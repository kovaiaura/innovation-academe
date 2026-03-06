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
  // Try custom API key from system_configurations first, fall back to env secret
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[attendance-reminder] Function invoked at", new Date().toISOString());

    // 1. Fetch reminder settings
    const { data: settingsData } = await supabase
      .from("leave_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "reminder_enabled_officer",
        "reminder_enabled_staff",
        "reminder_minutes_before",
      ]);

    const reminderSettings: Record<string, any> = {};
    settingsData?.forEach((row: any) => {
      reminderSettings[row.setting_key] = row.setting_value;
    });

    const enabledOfficer =
      reminderSettings.reminder_enabled_officer === true ||
      reminderSettings.reminder_enabled_officer === "true";
    const enabledStaff =
      reminderSettings.reminder_enabled_staff === true ||
      reminderSettings.reminder_enabled_staff === "true";
    const minutesBefore = Number(reminderSettings.reminder_minutes_before) || 5;

    console.log("[attendance-reminder] Settings:", { enabledOfficer, enabledStaff, minutesBefore });

    if (!enabledOfficer && !enabledStaff) {
      console.log("[attendance-reminder] Both reminders disabled, exiting.");
      return new Response(
        JSON.stringify({ message: "Reminders disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get current time in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentMinutesOfDay = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();

    // Target time = current time + minutesBefore (with 2-minute window for cron jitter)
    const targetMinutesMin = currentMinutesOfDay + minutesBefore - 1;
    const targetMinutesMax = currentMinutesOfDay + minutesBefore + 1;

    const todayStr = istNow.toISOString().split("T")[0];

    console.log("[attendance-reminder] IST time:", `${istNow.getUTCHours()}:${istNow.getUTCMinutes()}`, 
      "Target window:", targetMinutesMin, "-", targetMinutesMax);

    // 3. Fetch templates
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

    // 5. Process staff reminders (profile-based times)
    if (enabledStaff) {
      const { data: staffProfiles } = await supabase
        .from("profiles")
        .select("id, name, email, check_in_time, check_out_time, enable_notifications")
        .not("email", "is", null)
        .not("check_in_time", "is", null);

      console.log("[attendance-reminder] Staff profiles found:", staffProfiles?.length || 0);

      if (staffProfiles) {
        for (const profile of staffProfiles) {
          if (!profile.email) continue;
          // Skip if individual notifications disabled
          if (profile.enable_notifications === false) continue;

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
    }

    // 6. Process officer reminders (institution-based times)
    if (enabledOfficer) {
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

          const { data: officers } = await supabase
            .from("officers")
            .select("id, user_id, name, email")
            .contains("assigned_institutions", [inst.id]);

          if (!officers) continue;

          // For each officer, check individual enable_notifications
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
