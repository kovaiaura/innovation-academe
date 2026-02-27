

# Replace Dual Charts with Single Class Comparison Bar Chart

## Problem
The analytics "Institution Overview" section shows two graphs side-by-side:
1. A **Radar chart** ("Performance Overview") -- hard to read and not adding much value beyond the KPI cards above it
2. A **horizontal Bar chart** ("Class Performance Comparison") -- useful but cramped in half-width

The user wants these replaced with a single, full-width bar chart for class comparisons.

## Change

**File: `src/components/analytics/InstitutionOverview.tsx`**

- Remove the Radar chart and its data (`radarData` array, `RadarChart` imports)
- Make the Class Performance Comparison bar chart **full-width** (remove the `grid md:grid-cols-2` wrapper)
- Keep the bar chart showing "Avg Score" and "Pass Rate" per class with vertical layout
- Clean up unused imports (`RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Radar`, `TrendingUp`)

This is a single-file change affecting the shared `InstitutionOverview` component, which automatically fixes it for CEO (via `ComprehensiveAnalyticsTab`), Management, and Officer analytics pages.
