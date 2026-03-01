

# Add Edit Invoice Feature

## Overview
Add the ability to edit existing invoices by reusing the full-screen Create Invoice dialog in "edit mode". An "Edit" option will appear in each invoice's dropdown menu.

## Changes

### 1. Add `updateInvoice` service function
**File: `src/services/invoice.service.ts`**
- New `updateInvoice(id, input)` function that:
  - Recalculates line item taxes and totals using the provided GST rates
  - Updates the invoice record in the `invoices` table
  - Deletes old line items and inserts new ones (simplest approach for line item edits)
  - Returns the updated invoice

### 2. Make CreateInvoiceDialog support edit mode
**File: `src/components/invoice/CreateInvoiceDialog.tsx`**
- Add optional `editInvoice?: Invoice` prop
- When `editInvoice` is provided:
  - Pre-populate all form fields from the existing invoice data
  - Change title to "Edit Invoice"
  - Disable invoice number auto-generation (keep the existing number, allow manual change with duplicate check excluding self)
  - On submit, call `updateInvoice()` instead of `createInvoice()`
  - Determine GST preset from existing rates
- When `editInvoice` is null/undefined, behave exactly as today (create mode)

### 3. Add Edit menu item to invoice list
**File: `src/components/invoice/InvoiceList.tsx`**
- Add `onEdit?: (invoice: Invoice) => void` prop
- Add "Edit" dropdown menu item (with Pencil icon) -- only show for draft/sent invoices (not fully paid or cancelled)

### 4. Wire up in InvoiceManagement page
**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Add `editInvoice` state and `handleEdit` handler
- Pass `onEdit={handleEdit}` to `InvoiceList`
- Pass `editInvoice` prop to `CreateInvoiceDialog`
- Reset edit state when dialog closes

## File Summary

| Action | File |
|--------|------|
| Modify | `src/services/invoice.service.ts` -- add `updateInvoice()` function |
| Modify | `src/components/invoice/CreateInvoiceDialog.tsx` -- accept `editInvoice` prop, pre-fill form |
| Modify | `src/components/invoice/InvoiceList.tsx` -- add Edit menu item |
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- wire edit flow |

No database changes required.

