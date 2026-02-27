

# Split into Two Class Comparison Bar Charts

## Change

Replace the single bar chart with two side-by-side charts in a `grid md:grid-cols-2` layout:

### Chart 1: "Projects & Awards by Class"
- Bars: `Avg Projects` (from `cls.avg_projects`) and `Avg Badges` (from `cls.avg_badges`)
- Colors: blue for projects, purple for badges
- Y-axis auto-scaled (no fixed 0-100 domain, since these are counts not percentages)

### Chart 2: "Assessment Performance by Class"
- Bars: `Assessment Avg` (from `cls.assessment_avg`) and `Assignment Avg` (from `cls.assignment_avg`)
- Colors: green for assessment avg, orange for assignment avg
- Y-axis domain 0-100 (percentages)

Both charts keep the same styling: vertical bars, angled X-axis labels, consistent tooltip theme.

### File to Modify

**`src/components/analytics/InstitutionOverview.tsx`**
- Replace the single `classComparisonData` with two data arrays (`projectsAwardsData` and `assessmentData`)
- Replace the single Card with two Cards in a grid
- Each card gets its own title, description, and bar chart

No backend or hook changes needed -- all required data fields already exist in the `ClassPerformance` interface.

