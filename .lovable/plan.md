
# Fix Report PDF Logo to Use Settings from CEO Report Configuration

## Problem
The Activity Report PDF always shows the default bundled logo (`src/assets/logo.png`) because none of the 4 places that generate the PDF pass the `reportSettings` prop. The logo configured in Settings > Reports (stored in `company_profiles.report_logo_url`) is never fetched or used.

## Solution
Create a shared hook to fetch report settings from `company_profiles`, then pass those settings to `ActivityReportPDF` in all 4 locations that generate PDFs.

---

## Changes

### 1. Create a reusable hook: `src/hooks/useReportSettings.ts`
- Fetches `report_logo_url`, `report_logo_width`, `report_logo_height` from `company_profiles` where `is_default = true`
- Returns the settings object compatible with the `ReportSettings` interface in `ActivityReportPDF`
- Uses `@tanstack/react-query` for caching

### 2. Update all 4 PDF generation locations to fetch and pass report settings

Each file will:
- Import and call `useReportSettings()`
- Pass the fetched settings as `reportSettings` prop to `<ActivityReportPDF>`

**Files to modify:**

| File | Usage |
|------|-------|
| `src/pages/system-admin/ReportsManagement.tsx` | System admin report download |
| `src/pages/management/Reports.tsx` | Management report download |
| `src/pages/institution/Reports.tsx` | Institution report download |
| `src/components/reports/ViewReportDialog.tsx` | View/download/print dialog |

### 3. No changes needed to `ActivityReportPDF.tsx`
It already accepts `reportSettings` and falls back to the default logo when not provided. Once we pass the settings, it will use the configured logo automatically.

---

## Technical Details

### Hook implementation (`useReportSettings.ts`)
```text
- Query: SELECT report_logo_url, report_logo_width, report_logo_height 
         FROM company_profiles WHERE is_default = true
- Returns: { report_logo_url, report_logo_width, report_logo_height }
- Cached via react-query key: ['report-settings']
```

### Prop passing pattern
```text
// In each file:
const { data: reportSettings } = useReportSettings();

// When generating PDF:
<ActivityReportPDF report={report} reportSettings={reportSettings} />
```

### For `ViewReportDialog.tsx`
Since it's a component (not a page), the `reportSettings` will be passed as a new prop from its parent callers. Alternatively, the hook can be called directly inside the dialog component.

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/hooks/useReportSettings.ts` |
| Modify | `src/pages/system-admin/ReportsManagement.tsx` |
| Modify | `src/pages/management/Reports.tsx` |
| Modify | `src/pages/institution/Reports.tsx` |
| Modify | `src/components/reports/ViewReportDialog.tsx` |
