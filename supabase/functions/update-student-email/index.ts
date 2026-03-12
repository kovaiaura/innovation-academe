import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_id, new_email } = await req.json();

    if (!student_id || !new_email) {
      return new Response(
        JSON.stringify({ error: "student_id and new_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Look up student to get user_id and current email
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id, user_id, email")
      .eq("id", student_id)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Student not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!student.user_id) {
      return new Response(
        JSON.stringify({ error: "Student has no linked auth account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. If email is the same, skip
    if (student.email === new_email) {
      return new Response(
        JSON.stringify({ success: true, message: "Email unchanged" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Update auth user email
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      student.user_id,
      { email: new_email, email_confirm: true }
    );

    if (authError) {
      console.error("[update-student-email] Auth update failed:", authError);
      return new Response(
        JSON.stringify({ error: `Failed to update login email: ${authError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Update profiles table email
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ email: new_email })
      .eq("id", student.user_id);

    if (profileError) {
      console.error("[update-student-email] Profile update failed:", profileError);
      // Auth email already changed, log but continue
    }

    // 5. Update students table email
    const { error: studentUpdateError } = await supabaseAdmin
      .from("students")
      .update({ email: new_email })
      .eq("id", student_id);

    if (studentUpdateError) {
      console.error("[update-student-email] Student update failed:", studentUpdateError);
    }

    console.log(`[update-student-email] Successfully updated email for student ${student_id} to ${new_email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[update-student-email] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
