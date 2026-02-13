

## Fix Payslip PDF: Replace Screenshot with Proper Selectable PDF

### Problem
The payslip PDF is generated using `window.print()`, which creates a browser print-to-PDF. This produces a screenshot-like output where text is not selectable, browser headers/footers/URLs appear, and clicking on elements may redirect. The invoice system already uses `@react-pdf/renderer` which creates proper, clean PDFs with selectable text.

### Solution
Replace the `window.print()` approach with `@react-pdf/renderer` (already installed in the project), creating a dedicated `PayslipPDF` component -- the same approach used for invoices.

---

### Changes

#### 1. Create `src/components/payroll/pdf/PayslipPDF.tsx` (new file)

A `@react-pdf/renderer` Document component that renders the full payslip as a proper PDF with:
- Company logo + name + address header with "SALARY SLIP" title
- Employee details table (Name, ID, Designation, Institution, Bank Details)
- Side-by-side Earnings and Deductions tables with alternating row backgrounds
- Net Payable Amount section with dark navy background and white text
- Attendance Summary grid
- Footer with computer-generated notice
- All text is native PDF text (selectable, searchable, no links, no browser artifacts)
- Uses inline `StyleSheet.create()` styles matching the existing Zoho-style design
- Dark colors for Net Payable (`#1a1a2e` background) and Total Deductions (`#7b1a1a` text)

#### 2. Update `src/components/payroll/PayslipDialog.tsx`

- Import `PDFDownloadLink` from `@react-pdf/renderer` and the new `PayslipPDF` component
- Replace the `window.print()` download button with a `PDFDownloadLink` wrapper that generates a proper PDF file
- Keep the existing on-screen preview dialog as-is (it still renders the HTML version for viewing)
- The download button will generate a clean PDF file named like `Payslip_EmployeeName_Month_Year.pdf`

#### 3. Revert unnecessary print CSS in `src/index.css`

Remove the duplicate `@media print` block (the `@page { margin-top: 0; margin-bottom: 0; }` override) since we no longer rely on `window.print()` for payslips. Keep the base print styles that other features may use.

### Files Modified

| File | Change |
|---|---|
| `src/components/payroll/pdf/PayslipPDF.tsx` | New file: `@react-pdf/renderer` Document for professional payslip PDF |
| `src/components/payroll/PayslipDialog.tsx` | Replace `window.print()` with `PDFDownloadLink` using PayslipPDF |
| `src/index.css` | Clean up duplicate print CSS block |

