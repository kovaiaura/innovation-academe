import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find all in_progress attempts
    const { data: staleAttempts, error: fetchError } = await supabase
      .from("assessment_attempts")
      .select("id, assessment_id, started_at, total_points, student_id")
      .eq("status", "in_progress");

    if (fetchError) {
      throw new Error(`Failed to fetch attempts: ${fetchError.message}`);
    }

    if (!staleAttempts || staleAttempts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No stale attempts found", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get unique assessment IDs
    const assessmentIds = [
      ...new Set(staleAttempts.map((a: any) => a.assessment_id)),
    ];

    // Fetch assessment details
    const { data: assessments, error: assessError } = await supabase
      .from("assessments")
      .select("id, duration_minutes, end_time, pass_percentage")
      .in("id", assessmentIds);

    if (assessError) {
      throw new Error(`Failed to fetch assessments: ${assessError.message}`);
    }

    const assessmentMap = new Map(
      (assessments || []).map((a: any) => [a.id, a])
    );

    const now = new Date();
    let updatedCount = 0;

    for (const attempt of staleAttempts) {
      const assessment = assessmentMap.get(attempt.assessment_id);
      if (!assessment) continue;

      const startedAt = new Date(attempt.started_at);
      const expectedEnd = new Date(
        startedAt.getTime() + assessment.duration_minutes * 60 * 1000
      );
      const assessmentEnd = new Date(assessment.end_time);

      // Check if attempt has expired (duration elapsed OR assessment window closed)
      const isExpired = now > expectedEnd || now > assessmentEnd;
      if (!isExpired) continue;

      // Calculate the submission time (whichever came first)
      const submittedAt =
        expectedEnd < assessmentEnd ? expectedEnd : assessmentEnd;

      // Get answers for this attempt
      const { data: answers } = await supabase
        .from("assessment_answers")
        .select("points_earned")
        .eq("attempt_id", attempt.id);

      const score = (answers || []).reduce(
        (sum: number, a: any) => sum + (a.points_earned || 0),
        0
      );
      const totalPoints = attempt.total_points || 1;
      const percentage = (score / totalPoints) * 100;
      const passed = percentage >= (assessment.pass_percentage || 0);

      const { error: updateError } = await supabase
        .from("assessment_attempts")
        .update({
          status: "auto_submitted",
          submitted_at: submittedAt.toISOString(),
          time_taken_seconds: assessment.duration_minutes * 60,
          score,
          percentage,
          passed,
        })
        .eq("id", attempt.id);

      if (!updateError) {
        updatedCount++;
      } else {
        console.error(
          `Failed to update attempt ${attempt.id}:`,
          updateError.message
        );
      }
    }

    return new Response(
      JSON.stringify({
        message: `Auto-submitted ${updatedCount} expired attempts`,
        updated: updatedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in auto-submit-expired-assessments:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
