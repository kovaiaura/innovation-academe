

## Fill the Empty Space in Daily Attendance Card

The Daily Attendance card is shorter than the adjacent "Projects Pending" and "My Tasks" cards (which have `min-h-[320px]`), creating visible empty space. The fix is to add a **"This Week" attendance summary** below the buttons -- a compact row of 6 day-dots (Mon-Sat) showing check-in status for the current week.

---

### What gets added

A small "This Week" section at the bottom of the card showing:
- 6 circles (Mon-Sat), each colored:
  - **Green** = checked in that day
  - **Gray/muted** = no attendance record
  - **Current day** = highlighted ring
- Day labels below each dot (M, T, W, T, F, S)

This gives the officer a quick visual of their weekly attendance pattern and fills the empty space naturally.

---

### Technical Details

**File:** `src/components/officer/OfficerCheckInCard.tsx`

1. Add a query to fetch this week's attendance records from `officer_attendance` table (Mon-Sat of current week), using the existing supabase client
2. Add a "This Week" row below the buttons section with 6 small dot indicators
3. Each dot checks if there's an attendance record for that day

**File:** `src/pages/officer/Dashboard.tsx`

Add `min-h-[320px]` to the `OfficerCheckInCard` wrapper div to match sibling cards, ensuring consistent grid row height even if the weekly dots don't fully fill the space.

### Changes Summary

| File | Change |
|---|---|
| `src/components/officer/OfficerCheckInCard.tsx` | Add weekly attendance dots section + fetch week's attendance data |
| `src/pages/officer/Dashboard.tsx` | Wrap attendance card with consistent min-height |

