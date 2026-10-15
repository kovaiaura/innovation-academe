# Fix repeat quick-marking, show completion in officer Courses tab, auto-issue certificates

## 1. Quick bulk marking keeps offering 350+ sessions

**Cause:** before showing the confirmation, the card checks which sessions are already marked by asking for 100 sessions at a time. With 26 students that is about 2,600 marks per request, but the database only returns 1,000 rows per request. The rest are dropped, so most already-marked sessions look unmarked and are offered again. That's why you saw "359 to mark, 213 skipped" after everything was already marked.

**Fix:**
- Read every existing mark for the class page by page, so nothing is dropped.
- A session only counts as "to mark" when at least one student in the class still doesn't have it.
- If nothing is left, the confirmation says "Everything till Level N is already marked" and the button is disabled.

## 2. Officer → class → Courses tab: show completion and %

Today this tab only counts content views, which miss quick or bulk-marked sessions, and it hides progress.

New course card:
- A progress ring or bar with **% complete** and "X / Y sessions marked".
- A "Levels done: A / B" chip, plus a green "Completed" badge when the whole course is done.
- Each level row shows its own small progress bar and session count, with a tick when finished. It expands to list sessions with a tick or empty circle. The list scrolls properly.
- Levels named "NA" stay hidden, the same as on other screens.
- A session counts as complete when it is officer-marked for the class (from normal marking or quick marking) or all of its content is completed. This is the same rule Start Teaching and the student dashboard use.
- Marks are read page by page, so big classes are counted correctly.
- The "Start Teaching" button and the locked/unlocked behaviour stay the same.

## 3. Certificates are empty: issue them automatically from the templates

**Causes found:**
- The certificate service only checks content views. It ignores sessions marked by the officer and sessions with no content, so marked levels never qualify.
- It checks every session in the course, not only the sessions given to the class.
- It ignores the template chosen for a course or level and picks any active template.
- Quick marking would make thousands of slow certificate requests, one per session per student.

**New behaviour:**
- Once a level is fully complete for a student (every session given to the class is marked or content-complete, with "NA" levels ignored), a **Level** certificate is issued.
- Once every level given to the class is complete, a **Course** certificate is issued.
- **Template choice:** first the template set on that level, then the one set on the course, then the active template of matching category (Level Completion for levels, Course Completion for courses). If no template exists, nothing is issued, and the officer sees "No certificate template set".
- **Certificate date:** the date the level or course was actually finished. That is the latest completion date of its sessions, so it matches the date picked in quick marking or normal marking, not the day the certificate was created.
- **Runs once per marking action:** normal marking, bulk marking and quick marking each send one request for all affected students and levels when they finish. The officer sees "N certificates issued".
- **Never doubled:** a student can't get the same level or course certificate twice, even if marking is repeated.
- **Already-marked classes:** the CEO's "Recalculate Progress" button now also issues any missing certificates for that institute, so classes marked before this fix get theirs too.
- Students see these certificates on their Certificates page right away, with the date shown on the certificate.
- XP for completing a level or course is still awarded once, as it is now.

## Technical details

- `QuickBulkMarkCard.tsx`: replace `chunkedIn` for `class_session_completions` with a `.range()` pagination loop filtered by `class_id`, then compare per session against active student IDs. Add an empty-state message when `items.length === 0`.
- `ClassCourseLauncher.tsx`: paginate the module, session, completion and content reads. Treat a session as complete when the `class_session_completions` row count for its `class_assignment_id` covers all active students, or all of its content is completed. Filter out levels where `isNotApplicableTitle` is true. New presentation uses existing `Progress`, `Badge` and `Collapsible` with semantic tokens only.
- `useSessionCompletion.ts`: stop calling the certificate service per session. Expose a new `issueCertificatesForClass(classId, studentIds, moduleIds?)` that is called once at the end of single, bulk and quick marking. `QuickBulkMarkCard` and `BulkMarkCompleteTab` call it after their loop.
- `supabase/functions/issue-completion-certificates/index.ts`: rewrite to accept a batch `{ classId, studentIds?, moduleIds?, institutionId? }`. Validate input with zod and check the caller's JWT (officer, management, CEO or system admin). Server-side work:
  - load the class course assignments, allocated module and session assignments (paginated), `class_session_completions` and content completions;
  - work out, per student and level, whether it is complete, and its completion date as the max of `completed_at`;
  - resolve the template in this order: `course_modules.certificate_template_id`, then `courses.certificate_template_id`, then the active template whose category is `level`/`module` or `course`;
  - insert into `student_certificates` with `student_id = students.user_id` and `issued_date = completion date`, using `on conflict do nothing`;
  - award XP with the existing dedupe;
  - return counts.
  Keep the old single-student payload working so `useLevelCompletionCertificate` still works.
- `recalculate-course-progress` (CEO button): after recomputing, call the same certificate logic for every class in the institute in bounded batches, and report the number of certificates issued.
- Migration: remove existing duplicates first, then add a unique index on `student_certificates (student_id, activity_type, activity_id)` where `activity_id is not null`. The duplicate cleanup is a data change, so it runs as a separate query before the migration. Add the same SQL to `apply-on-your-own-supabase.sql` for the live backend, and redeploy both functions.
- `CertificatePreviewDialog` already draws `completion_date`. Map it from `issued_date`, which now holds the real completion date. No change to how templates are drawn.
- No changes to unlocking, grading or attendance rules.
