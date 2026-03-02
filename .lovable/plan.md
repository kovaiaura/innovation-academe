

# Add Purchase Bill Status Change, Edit, and Global Country Support

## Overview
Three additions: (1) Mark purchase bills as Settled/Paid directly from the table, (2) edit existing purchase invoices, (3) expand the vendor country list to all countries worldwide.

---

## 1. Purchase Status Change (Settle/Paid)

**File: `src/components/invoice/PurchasesTab.tsx`**
- Add `onStatusChange` callback prop: `(id: string, status: InvoiceStatus) => void`
- Add a clickable status badge or dropdown per row that lets the user toggle between "Pending" and "Settled" (maps to `paid` status)
- When clicked, call `onStatusChange(purchase.id, 'paid')` for settling, or revert to `'issued'` for marking back as pending
- Use a small `DropdownMenu` on the status badge with options: "Mark as Settled" / "Mark as Pending"

**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Pass the existing `handleStatusChange` function to `PurchasesTab` as `onStatusChange`

---

## 2. Edit Purchase Invoice

**File: `src/components/invoice/PurchasesTab.tsx`**
- Add `onEdit` callback prop: `(purchase: Invoice) => void`
- Add a pencil/edit icon button in the actions column (next to delete)

**File: `src/components/invoice/CreatePurchaseInvoiceDialog.tsx`**
- Accept an optional `editPurchase?: Invoice | null` prop
- When `editPurchase` is provided, pre-fill all form fields with existing data (vendor name, amounts, GST, TDS, dates, handled_by, remark, etc.)
- On submit, call an update function instead of create
- Change dialog title to "Edit Purchase Invoice" when editing

**File: `src/services/invoice.service.ts`**
- Add `updatePurchaseInvoice(id, data)` function that updates the invoice row and its line items

**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Add state for `editingPurchase`
- Wire the edit handler: set `editingPurchase` and open the purchase dialog
- Pass `editingPurchase` to `CreatePurchaseInvoiceDialog`

---

## 3. Expand Country List to All Countries

**File: `src/constants/indianStates.ts`**
- Replace the short `COUNTRIES` array (10 items) with a comprehensive list of all ~195 countries worldwide, keeping "India" at the top for convenience

**File: `src/components/invoice/InvoiceVendorsManager.tsx`**
- When country is NOT "India", hide the Indian States dropdown and instead show a free-text State/Province input field
- This allows entering state/province names for any country

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/components/invoice/PurchasesTab.tsx` -- add status dropdown + edit button |
| Modify | `src/components/invoice/CreatePurchaseInvoiceDialog.tsx` -- support edit mode |
| Modify | `src/services/invoice.service.ts` -- add `updatePurchaseInvoice` |
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- wire edit + status change for purchases |
| Modify | `src/constants/indianStates.ts` -- expand to all countries |
| Modify | `src/components/invoice/InvoiceVendorsManager.tsx` -- conditional state input based on country |

