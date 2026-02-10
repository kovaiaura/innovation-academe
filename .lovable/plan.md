
## Revamp CEO Gamification Page

### Problem
The current `/system-admin/gamification` page has outdated UI with configurable XP rules and badge creation that no longer apply (since the system is now deterministic). The recalculate button is on the CEO Dashboard instead of here where it belongs.

### New Page Structure

**3 Tabs only:**

1. **Overview** - Summary stats and quick insights
2. **Student Performance** - Leaderboard with institution filter and student details modal  
3. **Badges** - Read-only view of the 18 fixed badges and their status

Remove: "XP Rules Configuration" section, "Create Badge" button, badge edit/delete actions, "Certificates" tab, "Leaderboards" tab (configurable leaderboard configs), Activity Feed, Streak Leaderboard, configurable badge dialog.

### Tab Details

**Tab 1: Overview**
- 4 stat cards: Total Students, Total XP Distributed, Badges Earned (count of student_badges), Active Badges (count of badge definitions)
- Recalculate All XP and Badges button (moved from CEOAnalyticsDashboard) with status indicator
- XP Distribution breakdown chart (pie chart showing XP by category: projects, achievements, assessments, assignments, daily login)
- Top 5 students by XP (quick leaderboard)

**Tab 2: Student Performance**
- Keep existing institution filter dropdown
- Keep StudentPerformanceTable with view details
- Keep StudentPerformanceModal for drilling into a student's breakdown

**Tab 3: Badges**
- Read-only table showing the 18 fixed badges: Icon, Name, Category, Criteria, Students Earned (count)
- No create/edit/delete actions since badges are deterministic
- Show how many students have earned each badge

### Technical Changes

**File: `src/pages/system-admin/GamificationManagement.tsx`** - Complete rewrite
- Remove imports: BadgeConfigDialog, XPRuleEditor, LeaderboardConfigCard, StreakLeaderboard, ActivityFeed
- Remove state: badgeDialogOpen, editingBadge, xpRules, leaderboards, activityLogs
- Remove handlers: handleSaveBadge, handleDeleteBadge, handleUpdateXPRule, handleSaveLeaderboard
- Add: recalculate button logic (moved from CEOAnalyticsDashboard)
- Add: XP breakdown pie chart using recharts
- Add: badge earned counts query
- Reduce tabs from 5 to 3: Overview, Student Performance, Badges
- Badges tab becomes read-only display

**File: `src/pages/super-admin/CEOAnalyticsDashboard.tsx`**
- Remove the Gamification Stats card with recalculate button (lines ~480-517) since it is moved to the gamification page
- Remove gamificationDbService import and recalculate state/handlers if no longer used elsewhere

**File: `src/components/gamification/GamificationStatsCards.tsx`**
- Update: Replace "Rewards Claimed" card with "Badges Earned" (query count from student_badges table)
- Keep: Total Students, Points Distributed, Active Badges
