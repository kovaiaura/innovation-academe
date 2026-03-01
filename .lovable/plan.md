

# Add Purchases Tab to Invoice Management

## Overview
Add a "Purchases" tab alongside the existing "Sales" invoices in the Invoice Management page, using a Tabs component. The existing purchase infrastructure (table columns, components) already exists -- we just need to wire it into the main page with simplified fields matching your requirements.

## What You'll Get

**Two-tab layout:**
- **Sales** tab (default) -- current invoice list + summary cards
- **Purchases** tab -- simplified purchase bill tracker

**Purchases tab columns:**
- Supplier Name
- Invoice Number (vendor's bill number)
- Amount
- GST (rate/amount shown)
- TDS Deducted (Yes/No badge)
- Status (Settled / Pending)
- Handled By
- Remark
- Bill attachment (view/download link)

**The same date filter** will apply to both tabs.

**"Add Purchase" button** appears when on the Purchases tab (reuses existing `CreatePurchaseInvoiceDialog` with minor additions for "handled by" and "remark" fields).

---

## Technical Plan

### 1. Add "handled_by" and "remark" columns to invoices table
**Database migration** -- two new nullable text columns on the `invoices` table:
- `handled_by TEXT` -- who handled this purchase
- `remark TEXT` -- any remark/note

### 2. Update Invoice type
**File: `src/types/invoice.ts`**
- Add `handled_by?: string` and `remark?: string` to the `Invoice` interface
- Add same fields to `CreateInvoiceInput`

### 3. Restructure InvoiceManagement page with Tabs
**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Wrap content in `<Tabs defaultValue="sales">` with two `TabsTrigger`: "Sales" and "Purchases"
- Sales tab: current summary cards + invoice list (unchanged)
- Purchases tab: purchase summary (total purchases, settled, pending) + simplified purchase list
- Action buttons change based on active tab (Create Invoice vs Add Purchase)
- Date filter shared across both tabs

### 4. Create simplified PurchasesTab component
**New file: `src/components/invoice/PurchasesTab.tsx`**
- Accepts filtered purchase invoices as prop
- Table with columns: Supplier Name, Invoice #, Amount, GST, TDS Deducted, Status, Handled By, Remark, Actions
- Status shown as simple badge: "Settled" (green) or "Pending" (yellow)
- TDS shown as "Yes"/"No" badge
- Bill attachment shown as clickable icon/link
- Row actions: View Bill, Delete

### 5. Update CreatePurchaseInvoiceDialog
**File: `src/components/invoice/CreatePurchaseInvoiceDialog.tsx`**
- Add "Handled By" text input
- Add "Remark" textarea
- Add "TDS Deducted" yes/no toggle
- Include these fields in the save call

### 6. Update invoice service
**File: `src/services/invoice.service.ts`**
- Include `handled_by` and `remark` in `createPurchaseInvoice` function

### Files Summary

| Action | File |
|--------|------|
| DB Migration | Add `handled_by`, `remark` columns to `invoices` |
| Modify | `src/types/invoice.ts` -- add new fields |
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- add Tabs layout |
| Create | `src/components/invoice/PurchasesTab.tsx` -- simplified purchase list |
| Modify | `src/components/invoice/CreatePurchaseInvoiceDialog.tsx` -- add handled_by, remark, TDS toggle |
| Modify | `src/services/invoice.service.ts` -- include new fields in purchase create |
