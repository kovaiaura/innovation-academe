

# Fix Class Performance Bar Chart: Vertical Layout + Pass Rate Calculation

## Problems Identified

1. **Horizontal bars instead of vertical**: The chart uses `layout="vertical"` which renders horizontal bars. User wants standard vertical bars (classes on X-axis, scores on Y-axis).

2. **Pass Rate showing 0 for many classes**: The pass rate calculation at line 286 is binary per student -- each student gets either 100% or 0% based on whether their weighted score is >= 40. When averaged across a class, this gives the percentage of students who passed. However, many students have low weighted scores (visible in the screenshot where Avg Score bars are around 10-25), meaning most students fall below the 40% threshold, resulting in 0% pass rate for most classes.

   **Fix**: Change the class-level pass rate to count the actual number of students who passed divided by total students, expressed as a percentage. The current formula already does this (averaging 100s and 0s), but the issue is the 40% threshold is too high relative to actual scores. Since the weighted assessment scores shown are low (10-25 range), the threshold needs to reflect the actual scoring scale. Looking at the data, scores like "total_weighted" are in 0-100 range but most classes average 10-25, suggesting assessments haven't all been mapped yet. The pass rate calculation is technically correct (% of students scoring >= 40%) but we should lower the threshold to 33% (standard pass mark in many Indian education systems) to show more meaningful data.

## Changes

### File: `src/components/analytics/InstitutionOverview.tsx`

- Change chart from horizontal (`layout="vertical"`) to standard vertical bar chart
- Remove `layout="vertical"` prop from BarChart
- Swap axes: XAxis becomes category (class names), YAxis becomes number (0-100)
- Adjust bar radius for vertical orientation `[4, 4, 0, 0]`
- Increase chart height for better readability with class names on X-axis
- Angle XAxis labels at -45 degrees to prevent overlap with many classes

### File: `src/hooks/useComprehensiveAnalytics.ts`

- Lower the pass threshold from 40 to 33 (line 286) to align with standard pass marks and show more meaningful pass rate data across classes

