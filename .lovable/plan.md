

## Fix Blank Payslip PDF Download

### Root Cause

The current `window.print()` approach fails because the print CSS rule `body > *:not(#payslip-print-root)` hides everything -- but there is no element with id `payslip-print-root`. The actual payslip content lives inside `#payslip-print-area`, which is nested inside a Radix dialog portal. This mismatch causes the entire page (including the payslip) to be hidden during print, resulting in a blank PDF.

Additionally, `window.print()` inherently adds browser headers (date/time) and footers (URL), which the user does not want.

### Solution

Replace `window.print()` entirely with a proper PDF generation approach using `html2canvas` and `jsPDF`. This will:

- Capture the payslip element as an image and embed it into a real downloadable PDF file
- Eliminate all browser header/footer/URL issues completely
- Produce a clean, professional PDF with no clickable links
- Trigger a direct file download instead of opening the print dialog

### Technical Details

**Install dependencies:** `html2canvas` and `jspdf`

**File: `src/components/payroll/PayslipDialog.tsx`**

1. Remove the `printStyles` CSS block entirely (no longer needed)
2. Remove the `<style>` tag injection
3. Replace the `handleDownload` function:
   - Use `html2canvas` to render `#payslip-print-area` as a high-resolution canvas (scale: 2)
   - Convert the canvas to a JPEG image
   - Create a `jsPDF` instance with A4 dimensions
   - Add the image to fill the page width with correct aspect ratio
   - Save as `Payslip_{EmployeeName}_{Month}.pdf`
4. Remove all `print:` Tailwind utility classes and `print-hidden` class names (no longer relevant)

| File | Change |
|---|---|
| `src/components/payroll/PayslipDialog.tsx` | Replace `window.print()` with `html2canvas` + `jsPDF` for real PDF generation; remove all print CSS |

