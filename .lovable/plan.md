

# Add "Top Sheet" Tab to Invoice Management

## Overview
A new third tab called **Top Sheet** that provides a consolidated financial overview combining both sales and purchase invoices into a single ledger-style view, with summary cards at the top and a combined table below. Includes month-wise filtering and CSV export.

---

## What You'll Get

### Summary Cards (top section)
Six cards showing filtered totals:
- **Total Sales** -- sum of all sales invoice amounts
- **Total Received** -- sum of payments received on sales
- **Overdue** -- unpaid sales past due date
- **Total Purchases** -- sum of all purchase invoice amounts
- **Settled Amount** -- sum of settled (paid) purchases
- **Profit** -- Total Received minus Settled Purchases

### Combined Ledger Table
All sales and purchase invoices merged into one time-sorted table:

| Column | Description |
|--------|-------------|
| Sl.No | Auto-numbered row index |
| Date | Invoice date |
| Invoice No | Invoice number |
| Supplier/Customer Name | Vendor name (purchase) or customer name (sales) |
| Credit | Amount received from clients (sales invoices that are paid) |
| Debit | Amount paid to vendors (purchase invoices that are settled) |
| GST | Total GST amount |
| SGST Value | SGST amount |
| CGST Value | CGST amount |
| TDS Deducted | TDS amount |
| Handled By | Who handled this entry |
| Remark | Any notes |

- Sorted by date (newest first by default)
- Column header click to toggle sort order (date, amount, name)
- Sales entries show amount in **Credit** column, Debit shows "--"
- Purchase entries show amount in **Debit** column, Credit shows "--"

### Month Filter
The existing date filter (All Time / This Month / This Quarter / This Year / Custom) already applies to all tabs -- the Top Sheet will use the same shared `dateRange` state.

### Export
A dedicated "Export Top Sheet" button that downloads the combined ledger table as a CSV file with all visible columns.

---

## Technical Plan

### 1. Create TopSheetTab component
**New file: `src/components/invoice/TopSheetTab.tsx`**
- Props: `salesInvoices`, `purchaseInvoices`, `payments`, `loading`
- Computes summary stats (total sales, received, overdue, total purchases, settled, profit)
- Merges sales + purchases into a single array, sorted by `invoice_date` descending
- Renders 6 summary cards in a grid
- Renders combined table with sortable columns (click header to sort by date/name/amount)
- Each row determines Credit vs Debit based on `invoice_type`
- "Export CSV" button at top-right of table section
- Uses `papaparse` (already installed) or manual CSV generation via existing `downloadCSV` utility

### 2. Add export function for top sheet
**Modified file: `src/services/invoice-export.service.ts`**
- Add `exportTopSheetCSV(salesInvoices, purchaseInvoices)` function
- Generates CSV with columns: Sl.No, Date, Invoice No, Name, Credit, Debit, GST, SGST, CGST, TDS Deducted, Handled By, Remark
- Reuses existing `downloadCSV` helper

### 3. Wire into InvoiceManagement page
**Modified file: `src/pages/system-admin/InvoiceManagement.tsx`**
- Add third `TabsTrigger` value "topsheet" with label "Top Sheet"
- Add `TabsContent` rendering `TopSheetTab` with `filteredInvoices`, `filteredPurchases`, `filteredPayments`
- Hide Sales/Purchase-specific action buttons when Top Sheet tab is active (only show Export)

### Files Summary

| Action | File |
|--------|------|
| Create | `src/components/invoice/TopSheetTab.tsx` -- combined ledger view with summary + table + sort + export |
| Modify | `src/services/invoice-export.service.ts` -- add `exportTopSheetCSV` function |
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- add third tab trigger + content |

No database changes needed -- this is purely a read-only reporting view using existing data.

