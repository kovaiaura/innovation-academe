

# Fix: Edit Invoice Not Pre-filling Line Items and GST Rates

## Root Cause

When the "Edit" button is clicked, the invoice object comes from `useGlobalInvoiceSummary`, which fetches invoices using `select('*')` -- this only retrieves invoice table columns. **Line items are stored in a separate `invoice_line_items` table** and are never fetched in this hook. So `editInvoice.line_items` is `undefined`, causing:

1. **Empty line items** -- the dialog sees no line items and shows a blank default row
2. **GST rates showing 0%** -- the `cgst_rate`/`sgst_rate`/`igst_rate` fields on the invoice record may actually be correct, but the "Custom" preset appears because all rates are 0 when the invoice was saved without explicit rates

## Fix

### File: `src/components/invoice/CreateInvoiceDialog.tsx`

When entering edit mode, fetch the complete invoice (with line items) from the database using the existing `fetchInvoiceById` service function, instead of relying on the incomplete invoice object from the list.

**Changes:**
- Import `fetchInvoiceById` from invoice service
- In the `useEffect` that handles `editInvoice`, call `fetchInvoiceById(editInvoice.id)` to get the full invoice with line items
- Use the fetched data (which includes `line_items`) to populate the form
- Show a brief loading state while fetching

This ensures all fields -- line items, GST rates, customer details, notes -- are correctly populated when editing.

### File: `src/hooks/useGlobalInvoiceSummary.ts` (minor)

No changes needed here since the fix is at the dialog level. The summary hook intentionally skips line items for performance (it only needs totals for the dashboard).

## Technical Detail

```text
Current flow (broken):
  InvoiceList -> handleEdit(invoice_without_line_items) -> Dialog shows empty items

Fixed flow:
  InvoiceList -> handleEdit(invoice) -> Dialog calls fetchInvoiceById(id) -> Gets full invoice with line_items -> Pre-fills correctly
```

Only one file is modified: `CreateInvoiceDialog.tsx`.

