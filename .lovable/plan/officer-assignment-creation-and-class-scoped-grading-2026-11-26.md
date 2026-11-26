# Officer Assignment Creation and Class-Scoped Grading

## Goal
Allow officers to create assignments for classes they are assigned to, manage those assignments, and evaluate submissions without changing other roles' workflows.

## Work
- Add a clear **Create assignment** action to the Officer Assignments page and reuse the existing assignment fields and student submission experience.
- Offer only active classes in the officer's institution where the officer is scheduled as primary, secondary, or backup, or has a valid active class-access grant.
- Let officers create and manage their own assignments, choose draft or published status, set dates and marks, and review, grade, or re-grade submissions with feedback for students in those classes.
- Keep management and student assignment flows unchanged. Preserve the existing XP and badge awards when grading.
- Enforce the same institution and assigned-class boundaries in database permissions, not just in the page, so requests outside the officer's access are rejected.

## Technical details
- Reuse the assignment service and existing form/submission dialogs where safe; ensure the form records the signed-in officer as creator and cannot submit institution or class IDs outside their authorization.
- Update assignment, class-assignment, and submission permissions to enforce the officer's institution and timetable/delegated class access. Keep student visibility tied to published assignments assigned to their own class.
- Verify assigned-class options, assignment creation/publication, student visibility, submission review/grading, and denial of access to another class. Run relevant tests and check the preview build logs.
