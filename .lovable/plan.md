

## Gamification System Complete Rework

### Problem
The current gamification XP tracking is inaccurate -- showing random breakdowns (e.g., everything under "projects"), wrong point values, and no assignment XP awarding. Badges are based on configurable criteria in `gamification_badges` table which is fragile. The system needs to be simplified with fixed, deterministic rules.

---

### New XP Rules (Fixed, No Longer Configurable)

| Activity | XP | Details |
|---|---|---|
| Project assigned (per project) | 100 | Each member gets 100 XP when added to a project. No extra for team leader. |
| Project achievement/award | 200 | Each team member gets 200 XP per award on their project. |
| Daily login streak | 1 | 1 XP per day logged in. No streak milestone bonuses. |
| Assessment completed/attended | 50 | For completing/submitting an assessment. |
| Assessment 100% score | 100 | Instead of 50, get 100 XP for perfect score. |
| Assignment completed/attended | 50 | For submitting an assignment. |
| Assignment 100% score | 100 | Instead of 50, get 100 XP for perfect score. |

Remove all other XP types: `session_attendance`, `level_completion`, `course_completion`, `assessment_pass`, `streak_milestone`.

---

### New Badge Rules (Fixed, Deterministic -- No XP Awarded for Earning Badges)

| Badge Category | Thresholds | Based On |
|---|---|---|
| Project badges | 1, 5, 10, 15, 20 projects | Count of projects the student is a member of |
| Achievement/Award badges | 1, 5, 10, 20 awards | Count of project awards across all projects |
| Assessment badges | 5, 10, 15, 20 completed | Count of completed assessments |
| Assignment badges | 5, 10, 15, 20 completed | Count of completed assignments |

No badges for streaks. No XP reward for earning a badge.

---

### Technical Changes

#### 1. `src/services/gamification-db.service.ts` -- Core Rework

**XP Awarding Helpers** -- Replace all existing helpers with new fixed-point versions:
- `awardProjectMembershipXP`: Change from existing 100 XP (keep as-is, already correct)
- `awardProjectAwardXP`: Change from 150 to **200 XP**
- `awardAssessmentXP`: Replace current logic (10 + 25 + 25) with: **50 XP** for completion, **100 XP** if 100% score (not additive -- 100 replaces 50)
- Add `awardAssignmentXP`: **50 XP** for submission, **100 XP** if 100% score
- `updateStreak`: Change from 2 XP to **1 XP** per day. Remove milestone bonuses entirely (remove `awardStreakMilestoneBonus`).
- Remove `awardSessionAttendanceXP`, `awardLevelCompletionXP`, course completion XP.

**Badge System** -- Replace `checkAndAwardBadges` with deterministic logic:
- Instead of reading configurable `gamification_badges` table criteria, hardcode the badge checks:
  - Count projects from `project_members` table directly
  - Count awards from `project_achievements` where type = 'award'
  - Count completed assessments from `assessment_attempts`
  - Count completed assignments from `assignment_submissions`
- Use `gamification_badges` table only for storing badge definitions (name, icon, description)
- Seed the required badges if they don't exist
- No XP awarded when earning a badge

**Add `recalculateAllXPAndBadges` method:**
1. Delete all rows from `student_xp_transactions`
2. Delete all rows from `student_badges`
3. Delete all rows from `student_streaks`
4. For each student (from `profiles` where position contains 'student'):
   a. Count projects from `project_members` -> award 100 XP each
   b. Count project awards from `project_achievements` -> award 200 XP each to all members
   c. Count completed assessments from `assessment_attempts` -> 50 XP or 100 XP if percentage = 100
   d. Count completed assignments from `assignment_submissions` (graded) -> 50 XP or 100 XP if marks = total
   e. Recalculate badges based on counts
5. Daily login streaks reset to 0 (fresh start as specified)

**Update `getStudentXPBreakdown`** -- Adjust breakdown categories to:
- `projects` (project_membership)
- `achievements` (project_award)
- `assessments` (assessment_completion, assessment_perfect_score)
- `assignments` (assignment_submission, assignment_perfect_score)
- `daily_login` (daily_streak)

#### 2. `src/pages/student/Dashboard.tsx` -- Update Breakdown Display

Update `points_breakdown` to show the new 5 categories:
- Projects (from project membership XP)
- Achievements (from project awards XP)
- Assessments
- Assignments
- Daily Login

Remove references to "sessions", "courses", "levels" breakdowns.

#### 3. `src/pages/student/Gamification.tsx` -- Update Breakdown Display

Same breakdown update as Dashboard. Update the XP breakdown chart/display to reflect new categories. Update badge progress to use new deterministic counts (project count, assessment count, etc.) instead of XP transaction counts.

#### 4. `src/pages/super-admin/CEOAnalyticsDashboard.tsx` -- Add Recalculate Button

Add a "Recalculate All XP and Badges" button in the Gamification Stats card. On click:
- Show confirmation dialog warning this will reset all XP and badges
- Call `gamificationDbService.recalculateAllXPAndBadges()`
- Show progress/loading state
- Toast on completion

#### 5. `src/pages/management/Dashboard.tsx` -- Update Gamification Metrics

Update the gamification metrics section to show proper breakdown matching the new categories.

#### 6. `src/services/assessment.service.ts` -- Update Assessment XP Call

Change the `awardAssessmentXP` call to use new point values (50 base, 100 for perfect).

#### 7. Assignment XP Integration

Find where assignment submissions are graded/completed and add `gamificationDbService.awardAssignmentXP(...)` call. This is currently missing entirely.

#### 8. `src/hooks/useClassCourseAssignments.ts` -- Remove Level/Course Completion XP

Remove the gamification XP awarding on level/course completion (lines ~618-663) since those XP types are being removed. Keep the certificate issuance logic.

#### 9. `src/types/gamification.ts` -- Update Types

Update `XPRule` activity types and `StudentPerformance.points_breakdown` to match new categories:
```
points_breakdown: {
  projects: number;
  achievements: number;
  assessments: number;
  assignments: number;
  daily_login: number;
}
```

#### 10. Badge Seed Data

Create or update `gamification_badges` rows for the fixed set of 18 badges:
- "1 Project", "5 Projects", "10 Projects", "15 Projects", "20 Projects"
- "1 Achievement", "5 Achievements", "10 Achievements", "20 Achievements"
- "5 Assessments", "10 Assessments", "15 Assessments", "20 Assessments"
- "5 Assignments", "10 Assignments", "15 Assignments", "20 Assignments"

This seeding will happen in the recalculate function or as a database migration.

---

### Summary of What Gets Removed
- Session attendance XP
- Level completion XP
- Course completion XP
- Assessment pass XP (separate from completion)
- Streak milestone bonuses (7/30/100 day)
- Configurable XP rules table usage
- Streak badges
- Points-based badges

### Summary of What Gets Added
- Assignment XP awarding (was completely missing)
- Fixed deterministic badge system
- Recalculate button in CEO portal
- Proper XP breakdown display across all portals

