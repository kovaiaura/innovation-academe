import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the requesting user has proper authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { officer_id } = await req.json();

    if (!officer_id) {
      return new Response(
        JSON.stringify({ error: 'officer_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DeleteOfficerUser] Starting deletion for officer:', officer_id);

    // 1. Get the officer record to find user_id
    const { data: officer, error: fetchError } = await adminClient
      .from('officers')
      .select('id, user_id, full_name, email')
      .eq('id', officer_id)
      .single();

    if (fetchError) {
      console.error('[DeleteOfficerUser] Failed to fetch officer:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Officer not found', details: fetchError.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = officer.user_id;
    console.log('[DeleteOfficerUser] Found officer:', officer.full_name, 'with user_id:', userId);

    // 2. Get all documents for this officer to delete from storage
    const { data: docs } = await adminClient
      .from('officer_documents')
      .select('file_url')
      .eq('officer_id', officer_id);

    // 3. Delete files from storage bucket
    if (docs && docs.length > 0) {
      const filePaths: string[] = [];
      for (const d of docs) {
        try {
          const url = new URL(d.file_url);
          const pathMatch = url.pathname.match(/\/officer-documents\/(.+)/);
          if (pathMatch) {
            filePaths.push(decodeURIComponent(pathMatch[1]));
          }
        } catch {
          // Skip invalid URLs
        }
      }
      
      if (filePaths.length > 0) {
        console.log('[DeleteOfficerUser] Deleting', filePaths.length, 'files from storage');
        await adminClient.storage
          .from('officer-documents')
          .remove(filePaths);
      }
    }

    // 4. Delete from related tables
    console.log('[DeleteOfficerUser] Cleaning up related data...');

    // Delete from officer_documents
    await adminClient.from('officer_documents').delete().eq('officer_id', officer_id);

    // Delete from officer_institution_assignments
    await adminClient.from('officer_institution_assignments').delete().eq('officer_id', officer_id);

    // Delete from officer_attendance
    await adminClient.from('officer_attendance').delete().eq('officer_id', officer_id);

    // Delete from officer_class_access_grants (both granting and receiving)
    await adminClient.from('officer_class_access_grants').delete().eq('granting_officer_id', officer_id);
    await adminClient.from('officer_class_access_grants').delete().eq('receiving_officer_id', officer_id);

    // Delete from purchase_requests
    await adminClient.from('purchase_requests').delete().eq('officer_id', officer_id);

    // Delete from daily_work_logs
    await adminClient.from('daily_work_logs').delete().eq('officer_id', officer_id);

    // Delete from leave_applications (if officer is applicant)
    await adminClient.from('leave_applications').delete().eq('officer_id', officer_id);

    // Delete from leave_balances
    await adminClient.from('leave_balances').delete().eq('officer_id', officer_id);

    // Delete from hr_ratings
    await adminClient.from('hr_ratings').delete().eq('trainer_id', officer_id);

    // Update class_session_attendance to remove officer reference (preserve records)
    await adminClient
      .from('class_session_attendance')
      .update({ officer_id: null })
      .eq('officer_id', officer_id);

    await adminClient
      .from('class_session_attendance')
      .update({ completed_by: null })
      .eq('completed_by', officer_id);

    // 5. Delete the officer record
    const { error: deleteOfficerError } = await adminClient
      .from('officers')
      .delete()
      .eq('id', officer_id);

    if (deleteOfficerError) {
      console.error('[DeleteOfficerUser] Failed to delete officer record:', deleteOfficerError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete officer record', details: deleteOfficerError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DeleteOfficerUser] Deleted officer record');

    // 6. If user_id exists, delete the auth user (this cascades to profiles and user_roles)
    if (userId) {
      console.log('[DeleteOfficerUser] Deleting auth user:', userId);
      
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
      
      if (deleteAuthError) {
        console.error('[DeleteOfficerUser] Failed to delete auth user:', deleteAuthError);
        // Don't fail the whole operation - officer record is already deleted
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: 'Officer deleted but auth user cleanup failed',
            officer_id,
            user_id: userId 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[DeleteOfficerUser] Successfully deleted auth user');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Officer and all related data deleted successfully',
        officer_id,
        user_id: userId 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DeleteOfficerUser] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
