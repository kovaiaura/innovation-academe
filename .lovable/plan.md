# One consistent class and institute ranking

## What's wrong now
- The student dashboard ranks by XP points only. CEO/management Class Toppers rank by an "Overall" score. That's why Aadheth shows #1 on his dashboard but #3 in Class Toppers.
- Students with the same Overall score (e.g. three on 30) get #1, #2, #3 in no fixed order.
- Within the Overall score, XP is capped at 2000, so 3,700 and 15,974 XP count the same.

## What changes
Every role uses the same rank, based on the **Overall performance score** (assessments 50%, assignments 20%, projects 20%, XP 10%):
- Student dashboard: "Class rank" and "Institute rank" (e.g. "#3 of 26").
- CEO / management / officer analytics: Class Toppers, Institute Toppers, all-students list.
- Management dashboard Leaderboard section (Overall and Class cards).

Rules:
- Ties are broken in this order: assessment score, then assignments, then total XP, then name. A rank changes only when the scores really differ.
- XP is scored relative to the top student in the institute rather than capped, so a student with more XP gets more credit.
- Only active students in the institute are ranked. The class rank uses the student's current class.
- Ranks follow the academic year picked in the selector, so they match the analytics page.

## Technical details
- New `src/utils/studentRanking.ts`: `computeOverallScore`, `rankStudents` (sort with tie-breaks, competition ranks), plus tests in `src/utils/studentRanking.test.ts`.
- `useComprehensiveAnalytics.ts`: use the shared util for class and institution ranks and for XP normalization.
- New `getStudentRanks(institutionId, classId, studentUserId)` that reuses the analytics data path. The student `Dashboard.tsx` and `DashboardAchievements` show class and institute rank from it, replacing the XP-only `findIndex`.
- `LeaderboardSection.tsx`: get its rows from the shared ranking instead of the XP-only `getLeaderboard`.
- Record the rule in AGENTS.md: all student rankings come from the shared ranking util.
