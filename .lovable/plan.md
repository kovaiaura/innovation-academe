# Upload PDF reports (CEO) and view/download (Management)

## What you get
- **CEO → Reports Management:** a new "Upload Report PDF" button next to "Create Report". It opens a form with:
  - School (pick from institutions)
  - Report month and year
  - Date of report submission
  - PDF file (up to 25 MB)
  - Option to publish now, so the school can see it straight away
- Uploaded reports appear in the same list with an "Uploaded PDF" tag, and can be viewed, downloaded, published/unpublished or deleted.
- **Management → Monthly Reports:** published uploaded reports show up with View (opens in the PDF viewer) and Download buttons. Generated reports keep working as before.

## Technical details
- Migration: add `uploaded_pdf_path text` to `reports`; `report_type` gets value `'uploaded'`. Existing required fields (`trainers`, `activities`, `client_name`) filled with defaults (`[]`, institution name).
- Create private storage bucket `activity-reports`; storage RLS: CEO/system_admin can upload/delete; management can read files under their own `institution_id/` folder (path `{institution_id}/{uuid}.pdf`). Files served via short-lived signed URLs.
- `report.service.ts`: `uploadPdfReport()`, `getReportPdfSignedUrl()`, delete removes the file.
- New `UploadReportPdfDialog.tsx`; update `ReportsManagement.tsx` list/actions and `institution/Reports.tsx` (+ management Reports page) to branch on `report_type === 'uploaded'`, using fetch-to-blob download.
- Types: extend `Report` with `'uploaded'` and `uploaded_pdf_path`.
