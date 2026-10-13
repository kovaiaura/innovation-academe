# Fix blank Vercel site and auto-sort activities by academic year

## 1. Blank page on Vercel
The live site crashes on start with an unnamed error. The current code wraps the year setting inside the page router, but an earlier version (likely the one Vercel built) had it outside, which crashes every page.

Steps:
- Build the production version locally and open it in a headless browser to reproduce the crash and read the real error message.
- Fix the cause. Also make the year setting crash-proof: if it's used outside the expected place, it falls back to safe defaults instead of throwing a white screen.
- Add a top-level error screen so any future crash shows a "Something went wrong — reload" message instead of a blank page.
- Confirm the production build loads the login page without errors, then you redeploy on Vercel from the latest commit.

## 2. Auto-sort activities into the configured academic year
When an institute's current/previous year dates are saved, every activity should automatically fall into the right year:
- Projects (created date), assessments incl. FA1/FA2/Final (start date), assignments (start date), internal marks, events, awards, attendance, XP.
- Check every list and report screen (CEO, management, officer, student) uses the selected year's date range, including any missed spots (pending review findings will be applied).
- FA1/FA2/Final and internal marks: tie each mark to the year of its assessment date rather than a fixed year label, so they move automatically when the dates change.
- Within each year, lists sort newest first by activity date.
- Saving new dates refreshes all screens immediately.

## Technical details
- `AcademicYearContext`: `useAcademicYear` returns a default value instead of throwing; provider keeps `useLocation` inside `BrowserRouter`.
- Add an `ErrorBoundary` around the app in `App.tsx`.
- Verify with `vite build` + `vite preview` and Playwright.
- Fetch the completed date-filter review subagent result and fix listed files; make `useInternalMarks` / `useClassAssessmentMapping` derive year from `selectedRange` where marks are date-based.
- Invalidate all year-keyed queries on settings save.
