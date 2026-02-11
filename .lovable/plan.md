

## Multi-Fix Plan: Gamification, Dashboard, and Inventory Improvements

This plan addresses 5 separate issues across different pages.

---

### Fix 1: "Last Active" showing "less than a minute ago" for all students

**Root Cause:** In `src/services/gamification-db.service.ts` line 621, the `last_activity` field is hardcoded to `new Date().toISOString()` (current time) instead of fetching the actual last XP transaction timestamp.

**Fix:** Query the most recent `earned_at` from `student_xp_transactions` for each student. If no transactions exist, show "Never" instead of a fake timestamp.

**Files:**
- `src/services/gamification-db.service.ts` -- In `getLeaderboard()`, after building the sorted list, query the latest `earned_at` per student from `student_xp_transactions` and use that as `last_activity`. Fall back to `null` if none.
- `src/components/gamification/StudentPerformanceTable.tsx` -- Update line 120 to handle null/missing `last_activity`: show "Never" if null, otherwise use `formatDistanceToNow`.

---

### Fix 2: XP Distribution graph -- add colors and change to bar chart

**Current state:** The XP Distribution on the Gamification Overview tab uses a pie chart with CSS variable colors that appear as black/dark in the current theme.

**Fix in `src/pages/system-admin/GamificationManagement.tsx`:**
- Replace the `PieChart` with a `BarChart` using `recharts` `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid` components.
- Use distinct, vibrant color fills for each category bar (e.g., blue for Projects, green for Achievements, orange for Assessments, purple for Assignments, teal for Daily Login).
- Add a color-coded legend.

---

### Fix 3: Officer Dashboard Lab Inventory -- add search bar

**File:** `src/pages/officer/Inventory.tsx`

**Fix:** Add a search input at the top of the inventory tab (before the stats cards or between stats and table) that filters inventory items by name or description. Add a `searchTerm` state variable and filter the `inventory` array before rendering.

---

### Fix 4: CEO Dashboard -- modern graphs, colors, and student engagement graph

**File:** `src/pages/super-admin/CEOAnalyticsDashboard.tsx`

**Changes:**
1. **Institution Comparison chart:** Change to use `AreaChart` with curved lines (`type="monotone"`) and gradient fills for a modern look. Use distinct vibrant colors instead of CSS variables.
2. **Student Distribution:** Improve pie chart with better colors and labels.
3. **Add Student Engagement graph:** New card showing student login activity. Query `student_streaks` table to get `last_activity_date` data, aggregate into daily/weekly/monthly counts, and display as a curved `AreaChart` with tabs for Daily/Weekly/Monthly views.
4. **Add additional useful graphs:**
   - XP Growth Trend (line chart showing cumulative XP over time from `student_xp_transactions.earned_at`)
   - Project Activity (count of projects by status)
5. Apply modern color palette throughout all charts.

---

### Fix 5: CEO Dashboard Assessment Performance showing 0 values

**Root Cause:** The query filters by `.eq('status', 'completed')` but the actual assessment status in the database is `evaluated` (and possibly `submitted`, `auto_submitted`). So the filter returns 0 results.

**Fix in `src/pages/super-admin/CEOAnalyticsDashboard.tsx`:**
- Change the assessment attempts query from `.eq('status', 'completed')` to `.in('status', ['completed', 'evaluated', 'submitted', 'auto_submitted'])` to capture all finished attempts.

---

### Technical Summary

| File | Changes |
|---|---|
| `src/services/gamification-db.service.ts` | Fix `last_activity` to use real timestamp from latest XP transaction |
| `src/components/gamification/StudentPerformanceTable.tsx` | Handle null `last_activity` gracefully ("Never") |
| `src/pages/system-admin/GamificationManagement.tsx` | Replace XP Distribution pie chart with colored bar chart |
| `src/pages/officer/Inventory.tsx` | Add search bar to filter inventory items |
| `src/pages/super-admin/CEOAnalyticsDashboard.tsx` | Fix assessment status filter; modernize chart styling with curves/gradients; add Student Engagement and XP Growth charts |

