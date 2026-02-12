

## Fix Payslip Values, PDF Quality, and Add Bank Details

### Problems Identified

1. **Conveyance Allowance shows Rs.0.00**: The officer salary structure in the database stores the field as `transport_allowance` (value: 1600), but the payslip generation code reads `ss.conveyance_allowance` which doesn't exist on the stored object -- resulting in 0. This also causes Gross Earnings to be Rs.18,400 instead of Rs.20,000.

2. **PDF redirects to domain when clicked**: `window.print()` is used for PDF generation, and the browser adds a clickable URL in the footer.

3. **PDF has browser header/footer**: The print CSS doesn't suppress browser-added headers (date/time) and footers (URL, page number).

4. **Net Payable and Deductions text too light in PDF**: Colors like blue gradient don't render well in print.

5. **No bank details** shown in payslip.

6. **Header shows date/time** -- user wants only site title.

---

### Changes

#### File 1: `src/components/payroll/IndividualAttendanceTab.tsx`

**Fix conveyance field mapping (~line 1135):**
- When building payslip data, read BOTH `ss.conveyance_allowance` and `ss.transport_allowance` and use whichever has a value:
  ```
  const conveyanceAmt = ss.conveyance_allowance || ss.transport_allowance || 0;
  ```
- This ensures the 1600 value from `transport_allowance` is picked up correctly.

**Add bank details to payslip data (~line 1128-1180):**
- Before building the payslip object, fetch the employee's bank details from the `officers` table (for officers: `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch`) or from `profiles` table (for staff).
- Pass `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch` into the payslip data object.

#### File 2: `src/components/payroll/PayslipDialog.tsx`

**Add bank details section:**
- Add `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch` to the `PayslipData` interface.
- Render a "Bank Details" section between Net Pay and Attendance Summary, showing account number, bank name, IFSC, and branch.

**Fix PDF generation -- replace `window.print()` with proper print styling:**
- Add `@media print` CSS rules:
  - `@page { margin: 10mm; size: A4; }` to control page margins
  - Remove browser header/footer: `@page { @top-center { content: none; } @bottom-center { content: none; } }`
  - Hide dialog chrome, buttons, and scroll containers in print
- Remove date/time from the header, show only site title text in the print version header.

**Make Net Pay and Deductions visible in print:**
- Replace the blue-600 background on net pay with a dark bordered style that prints well (dark text on white/light background with strong border, instead of colored background that may not print).
- Ensure all text uses dark, high-contrast colors for print: black text for amounts, dark red for deductions total.

**Remove clickable links from PDF:**
- Add `text-decoration: none; color: inherit;` for all anchor tags in print media.
- The footer URL comes from the browser's print feature -- suppressed by the `@page` margin rules.

### Summary

| File | Changes |
|---|---|
| `IndividualAttendanceTab.tsx` | Fix conveyance field mapping (`transport_allowance` fallback), fetch and pass bank details |
| `PayslipDialog.tsx` | Add bank details section, fix print CSS (no header/footer/links), high-contrast colors for print, remove time from header |

