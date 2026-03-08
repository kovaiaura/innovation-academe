
# Remove Performance Analytics Tab from Management Reports

## Overview
Remove the Performance Analytics tab from the Management Reports page, keeping only the Monthly Reports content as the main view (no tabs needed).

## Changes

**File: `src/pages/management/Reports.tsx`**

1. Remove the `PerformanceAnalyticsTab` component entirely (lines 47-130)
2. Remove the `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` wrapper -- since there's only one section now, no tabs are needed
3. Render the `MonthlyReportsTab` content directly
4. Remove unused imports: `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`, `useState` (from PerformanceAnalyticsTab), `useInstitutionPerformanceMetrics`, `Badge` (if only used in analytics)
5. Update the page subtitle from "Performance analytics and reports" to just "Monthly reports"

The page will simply show the "Published Reports" list directly without any tab navigation.
