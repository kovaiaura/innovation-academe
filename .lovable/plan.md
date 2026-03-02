
# Fix Credit Column to Reflect Actual Payment Status

## Problem
The Top Sheet currently shows ALL sales invoice amounts in the **Credit** column, even if the invoice has only been sent and no payment has been received. This misrepresents cash flow -- ₹64,900 appears as "received" when it's actually just an invoice sent.

## Solution
Only populate the **Credit** column for sales invoices where payment has actually been received (status is `paid`). For unpaid/sent invoices, display a label like "Invoice Sent" in the Credit column instead of the amount.

Similarly, update the **summary cards** so that "Total Received" only counts payments actually received (already correct via `payments` array), and ensure the ledger totals row only sums actual credits.

## Changes

### File: `src/components/invoice/TopSheetTab.tsx`

**1. Add status to LedgerEntry interface**
- Add `status: string` field to track invoice status

**2. Update sales entry mapping (lines 61-77)**
- Set `credit` to `inv.total_amount` only when `inv.status === 'paid'`; otherwise set to `0`
- Store `status: inv.status` for display logic

**3. Update Credit cell rendering (lines 215-217)**
- When `entry.type === 'sales'` and `entry.credit === 0`: show a muted label like "Invoice Sent" (or "Overdue" if overdue)
- When `entry.credit > 0`: show the amount as before

**4. Update Debit cell similarly for purchases**
- When `entry.type === 'purchase'` and `entry.debit === 0` (not yet settled): show "Pending"
- When settled: show the amount

### File: `src/services/invoice-export.service.ts`
- Update the CSV export to reflect the same logic -- show "Invoice Sent" / "Pending" text instead of amounts for unpaid entries

## Summary
This ensures the Top Sheet accurately reflects actual money movement: Credit only appears when payment is received, and Debit only when a purchase is settled. Unpaid entries are clearly labeled with their current status.
