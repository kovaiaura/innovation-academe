

# Improve Purchase Invoice UI + GST/TDS Fields + Vendor Management

## Overview
Three improvements: (1) Upgrade the purchase invoice form to match the sales invoice's full-screen, sectioned layout, (2) add proper GST (IGST/CGST/SGST) and TDS amount fields, (3) create a vendor saving system mirroring the existing Parties/Customers feature.

---

## 1. Create Vendor Management (mirror of Parties)

### Database
**New table: `invoice_vendors`** with identical structure to `invoice_parties`:
- `id`, `vendor_name`, `address`, `city`, `state`, `state_code`, `pincode`, `gstin`, `pan`, `contact_person`, `phone`, `email`, `country`, `created_by`, `created_at`, `updated_at`
- RLS policy: Same as `invoice_parties` -- admins only (super_admin / system_admin)

### New hook: `src/hooks/useInvoiceVendors.ts`
- Mirror of `useInvoiceParties.ts` with CRUD operations on `invoice_vendors` table
- Query key: `['invoice-vendors']`

### New component: `src/components/invoice/InvoiceVendorsManager.tsx`
- Mirror of `InvoicePartiesManager.tsx` but titled "Manage Vendors / Suppliers"
- Same form fields: name, address, city, state (with Indian states dropdown), state_code, pincode, GSTIN, PAN, contact person, phone, email, country
- Table listing with edit/delete actions
- Accessible from a "Manage Vendors" button in the Purchases tab header

---

## 2. Add TDS Amount and GST Fields to Database

**Migration** -- add `tds_deducted` (boolean, default false) column to `invoices` table. The existing `tds_amount`, `cgst_rate`, `cgst_amount`, `sgst_rate`, `sgst_amount`, `igst_rate`, `igst_amount` columns are already present and will now be utilized for purchases.

---

## 3. Redesign Purchase Invoice Form

**File: `src/components/invoice/CreatePurchaseInvoiceDialog.tsx`** -- Major rewrite

The dialog will be upgraded to match the sales invoice's full-screen layout:

### Layout changes:
- Full-screen dialog (`max-w-4xl` or similar to sales)
- Sectioned layout with clear headers and separators

### Vendor selection:
- Dropdown to select from saved vendors (from `useInvoiceVendors`)
- Auto-fills vendor name, address, GSTIN, PAN, phone when selected
- Option to type manually if vendor not saved
- "Save as Vendor" button to save current details as a new vendor

### New GST section:
- GST preset selector (same as sales invoice): GST 5%/12%/18%/28%, IGST 5%/12%/18%/28%, Custom
- When a preset is selected, auto-calculate CGST/SGST or IGST amounts based on `totalAmount`
- Display calculated amounts: CGST, SGST, or IGST values
- These values stored in the existing `cgst_rate`, `sgst_rate`, `igst_rate`, `cgst_amount`, `sgst_amount`, `igst_amount` columns

### New TDS section:
- "TDS Deducted?" toggle (yes/no)
- When "Yes" is selected, show a TDS Amount input field
- TDS amount stored in `tds_amount` column, boolean in `tds_deducted`

### Amount calculation:
- Subtotal (base amount)
- + GST amounts (CGST+SGST or IGST)
- = Gross Total
- - TDS deducted
- = Net Payable (stored as `total_amount`)

### Service update:
- `createPurchaseInvoice` in `invoice.service.ts` updated to include: `cgst_rate`, `sgst_rate`, `igst_rate`, `cgst_amount`, `sgst_amount`, `igst_amount`, `tds_deducted`, `tds_amount`

---

## 4. Wire Vendor Manager into Purchases Tab

**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Add "Manage Vendors" button next to "Add Purchase" in the Purchases tab header
- Open `InvoiceVendorsManager` dialog on click

---

## Files Summary

| Action | File |
|--------|------|
| DB Migration | Create `invoice_vendors` table + add `tds_deducted` to `invoices` |
| Create | `src/hooks/useInvoiceVendors.ts` -- CRUD hook for vendors |
| Create | `src/components/invoice/InvoiceVendorsManager.tsx` -- Vendor management dialog |
| Rewrite | `src/components/invoice/CreatePurchaseInvoiceDialog.tsx` -- Full-screen form with GST presets, TDS amount, vendor selection |
| Modify | `src/services/invoice.service.ts` -- Include GST rates/amounts + TDS in purchase creation |
| Modify | `src/types/invoice.ts` -- Add `tds_deducted` to interface |
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- Add "Manage Vendors" button |

