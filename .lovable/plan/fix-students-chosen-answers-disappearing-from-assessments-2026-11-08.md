# Fix: students' chosen answers disappearing from assessments

## What is happening
When anyone (CEO or officer) edits an assessment and saves, even just to fix a typo or change a date, the app deletes every question and creates them again as new ones. The database is set to remove a student's saved answers when their question is deleted. So every chosen answer for that assessment is wiped out, but the score (for example 27/30) stays.

That's why it only happens "sometimes": assessments that were never edited after students took them look fine. Assessments that were edited show "No answer" everywhere and 0% in Question Analysis, for every role.

## Fix
1. **Editing no longer deletes questions.** On save, questions that already exist are updated in place and keep their identity. New questions are added. Only questions you actually removed get deleted. Applies to the CEO/system admin and officer assessment editors.
2. **Protect answers at the database level.** Deleting a question that students have already answered is blocked, so answers can never be silently wiped again. If you remove a question that already has answers, the editor warns you and keeps it.
3. **Clearer display for already-lost data.** If an attempt has a score but no saved answers, the details window says "Answer details not available for this attempt (assessment was edited after it was taken)" instead of showing "No answer" under every question. Question Analysis shows "—" instead of a misleading 0%, and counts only attempts that still have answers.

## Limitation
Answers already wiped by past edits can't be brought back from inside the app. Scores and pass/fail results are not affected. New attempts, and old attempts that were never edited, will show correctly.

## Technical details
- `src/pages/system-admin/AssessmentManagement.tsx` and `src/pages/officer/AssessmentManagement.tsx`: replace the "delete all + addQuestions" approach with a diff. Existing DB ids → `updateQuestion`; temporary `q-…` ids → `addQuestions`; removed ids → `deleteQuestion`. Then recalculate `total_points`.
- `assessment.service.ts`: `deleteQuestion` first checks `assessment_answers` for that question and refuses if answers exist.
- Migration: change `assessment_answers_question_id_fkey` from `ON DELETE CASCADE` to `ON DELETE RESTRICT`. Also add the same change to `apply-on-your-own-supabase.sql` (written so it can be re-run safely).
- `AssessmentAnalytics.tsx` and `AssessmentAttemptsDialog.tsx` / `AssessmentResultsDialog.tsx`: empty-answers fallback message; per-question Correct % excludes attempts with no answers and shows "—" when there is no data.
