# Fix slow officer Courses tab and missing student certificates

## What's going wrong

**Student Certificates page:** your screenshots show the certificate list request failing with "canceling statement due to statement timeout". The page asks for every certificate *plus* the full template picture. Templates are saved as a picture embedded in the record (about 300 KB+ each), so this request is heavy. On your live database it is also missing the speed indexes, so it times out and the page shows "No Certificates Yet", even when certificates exist.

**Certificates not being created:** the new certificate service and its database rule have to be on your live backend. If the old certificate function is still deployed there, "Recalculate Progress" will run but issue nothing. Step 1 below confirms this before anything else changes.

**Officer → class → Courses tab:** the new card reads modules, sessions, content and every student mark one after another, in many small requests. On your live database, without indexes on these tables, this is slow. When any request fails, the page swallows the error and shows "No courses assigned", which is misleading.

## Fixes

1. **Check first.** Open the live certificate function logs and test it with one class, to confirm whether it's the old version, or whether it fails on templates or IDs. Then fix whatever it shows.
2. **Certificates page loads fast.** Load the certificate list without template pictures. Fetch each template picture once, only when a certificate is opened, previewed or downloaded. The same change goes into the resume page's certificate list.
3. **Courses tab loads fast.**
   - Show the course cards right away using a small first request.
   - Load progress (percent, levels done, ticks) in the background, with a small "calculating" marker on each card.
   - Run the reads side by side instead of one after another, and ask only for the columns needed.
   - If something fails, show "Couldn't load courses, Retry" instead of "No courses assigned".
4. **Certificates actually get issued.**
   - Recalculate Progress shows how many certificates were issued. If none could be issued, it says why: "no template", "no level fully completed", or "function out of date".
   - Templates in the "level" category are used for levels, including your "Level Completion" template.
   - Officers see a clear notice when marking issues certificates, or when nothing qualifies yet.
5. **Live database script.** Add the missing speed indexes and the one-certificate-per-level rule to the ready-to-run SQL file, so they can be applied safely more than once. You run it once, then redeploy the `issue-completion-certificates` and `recalculate-course-progress` functions.

## Technical details

- `gamification-db.service.ts` `getStudentCertificates`: select `certificate_templates (id, name, category)` only. Add `getTemplateImage(id)` with an in-memory cache, used by `CertificatePreviewDialog` and download. Apply the same to `useStudentResume.ts`.
- `ClassCourseLauncher.tsx`: split into two queries, a cards query (course_class_assignments) and a progress query (`enabled` after cards). Use `Promise.all` for modules, sessions, content, marks and content completions. Narrow the selects. Handle `isError` with a retry. Keep the NA filter and the completion rule unchanged.
- `apply-on-your-own-supabase.sql`, section 6: `CREATE INDEX IF NOT EXISTS` on `student_certificates(student_id)`, `class_session_completions(class_assignment_id)`, `(class_id)`, `(student_id)`, `student_content_completions(class_assignment_id, student_id)`, `class_module_assignments(class_assignment_id)`, `class_session_assignments(class_module_assignment_id)`, and `course_content(session_id)`.
- Edge function: return a `reasons` summary (`missingTemplate`, `noCompleteLevels`, `studentsWithoutUserId`). Recalculate shows it. Verify with `curl_edge_functions` against a real class after deploy.
- No changes to marking, unlocking or grading rules.
