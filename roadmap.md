# Roadmap

- [x] Refresh student Projects as compact selectable cards; verified sample desktop/phone layouts, full details, keyboard selection, closing and focus return. Project queries and other roles' default layouts are unchanged; build passes.
- [ ] Verify student Projects with a real signed-in student (blocked: no app account matches the requesting user, so a preview session could not be minted).

- [x] Redesign Course Outcomes for every role with learning completion, assessment evidence, scoped year filtering, and phone-friendly course drill-downs. Verified fixture-backed service integration, filters, sorting, tenant-aware learning links, desktop/phone layouts, and calculation tests; build passes.
- [ ] Verify Course Outcomes with real signed-in student and staff accounts (blocked: the requesting user has no matching app account, so a preview session could not be minted).

- [x] Simplify the student dashboard to earned badges and own class rank; hide its year selector while preserving other pages. Verified sample badge/rank layouts and empty states at wide/narrow widths; build passes.

- [x] Refresh only the student dashboard with playful achievements and two course previews; check wide/narrow layouts and tenant-aware links with sample data.
- [ ] Verify the refreshed dashboard and course navigation with a real signed-in student (blocked: no student preview session available; the requesting account has no matching app user).

- [x] Stream large course PDFs through fresh signed URLs in every course viewer.
- [ ] Verify the stored 12 MB course PDF renders in the signed-in viewer (blocked until a preview user session is available).
- [x] Apply the institute-wide academic year selection across academic, analytics, event, project, award, and dashboard data.
- [x] Configure current and previous academic-year labels and start/end dates per institute; apply selected periods to year-sensitive analytics, activity views, and marking tools.

- [x] Quick bulk marking reads all existing marks (no repeat offers); officer Courses tab shows % and marked sessions; level/course certificates auto-issue from templates with the real completion date (also from CEO Recalculate Progress).
- [ ] Verify certificate issuing with a real signed-in officer and student (blocked: no preview session for the requesting user).
