
# Salary Invoice Cleanup, Payment Date, and Top Sheet Reordering

## Overview
Three changes: (1) Remove invoice number for salary payment entries, (2) Add a date picker for salary payment date, and (3) Add drag-and-drop or manual reordering of Top Sheet ledger rows with serial numbers updating accordingly.

---

## 1. Remove Invoice Number for Salary Entries

**File: `src/components/payroll/IndividualAttendanceTab.tsx`**
- When creating the purchase invoice for salary, remove the `invoice_number` field (or set it to an empty/null value like `SAL-<name>-<month>` without the formal invoice format)
- Actually, the DB may require `invoice_number`. Instead, set it to a simple identifier like `--` or leave it as a non-invoice-style label: e.g., `Salary/Feb 2026/Employee`
- Better approach: set `invoice_number` to `NULL` or an empty string if the schema allows it; otherwise use a simple non-formal format like `SAL-FEB2026-JEEVA`

**File: `src/components/invoice/TopSheetTab.tsx`**
- For entries where `invoiceNo` starts with `SAL/` or is empty, show `--` or "Salary" instead of the invoice number in the table

## 2. Add Salary Payment Date Picker

**File: `src/components/payroll/IndividualAttendanceTab.tsx`**
- Add a `paymentDate` state (defaults to today's date)
- In the "Mark as Paid" dialog, add a date input field labeled "Payment Date"
- When creating the invoice and salary_payments record, use this date for:
  - `invoice_date` and `due_date` on the invoice
  - `paid_at` on the salary_payments record
- This allows backdating or forward-dating salary payments

## 3. Top Sheet Row Reordering

**File: `src/components/invoice/TopSheetTab.tsx`**
- Add a `customOrder` state: `Record<string, number>` mapping entry IDs to manual positions
- Add up/down arrow buttons (or a move-to-position control) on each row
- When reordering is active, override the sort with the custom order
- Serial numbers (`Sl.No`) always reflect the current display position (already does `idx + 1`)
- Store order in component state (resets on page reload) -- simple and sufficient
- Add small up/down arrow buttons in the Sl.No column for each row
- When clicked, swap that entry with the one above/below it

---

## Technical Details

### IndividualAttendanceTab.tsx changes

**State additions:**
- `paymentDate: string` -- defaults to `new Date().toISOString().split('T')[0]`

**Dialog additions:**
- Date input between the payment type radio and the confirm button
- Label: "Payment Date"

**Invoice creation update (line ~1652-1668):**
- Remove or simplify `invoice_number` -- set to empty string or null
- Use `paymentDate` for `invoice_date` and `due_date`

**Salary payment record (line ~1673-1687):**
- Use `paymentDate` for `paid_at`

### TopSheetTab.tsx changes

**State additions:**
- `manualOrder: string[]` -- array of entry IDs in custom order (initialized from sorted entries)
- `isReordering: boolean` -- toggle for reorder mode

**UI additions:**
- "Reorder" toggle button next to "Export CSV"
- When reordering is active, show up/down arrow buttons on each row in the Sl.No column
- Clicking up swaps with previous entry; clicking down swaps with next
- Sl.No always shows current index + 1

**Invoice number display:**
- If `entry.invoiceNo` is empty, null, or starts with certain salary patterns, display `--`

### Files to modify:
| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` -- remove invoice number, add payment date picker |
| Modify | `src/components/invoice/TopSheetTab.tsx` -- add reorder controls with up/down arrows |
