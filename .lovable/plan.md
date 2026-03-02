

# Remove Global Export Button and Add Party/Vendor Filters

## Overview
Two changes: (1) Remove the top-level "Export" button that appears on all tabs -- CSV export is only needed on the Top Sheet tab (which already has its own Export CSV button). (2) Add a party/vendor name filter dropdown on the Sales and Purchase tabs so users can filter invoices by a specific customer or supplier.

---

## 1. Remove Global Export Button

**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Remove the "Export" button (lines 154-156) and the `InvoiceExportDialog` component (lines 271-276)
- Remove the `exportDialogOpen` state and `InvoiceExportDialog` import
- The Top Sheet tab already has its own inline "Export CSV" button, so no export functionality is lost

## 2. Add Party Filter on Sales Tab

**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Extract unique customer names (`to_company_name`) from sales invoices
- Add a `selectedParty` state (string or null)
- Render a `Select` dropdown in the Sales tab (next to the invoice count) with options: "All Parties" + list of unique customer names
- Apply the filter to `filteredInvoices` before passing to `InvoiceList`

## 3. Add Vendor Filter on Purchase Tab

**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Extract unique vendor names (`from_company_name`) from purchase invoices
- Add a `selectedVendor` state (string or null)
- Render a `Select` dropdown in the Purchases tab content area
- Apply the filter to `filteredPurchases` before passing to `PurchasesTab`

---

## Technical Details

### State additions in InvoiceManagement.tsx
- `selectedParty: string | null` -- filters sales by customer name
- `selectedVendor: string | null` -- filters purchases by vendor name
- Both reset to `null` (show all) when the value is cleared

### Filter logic
```text
// Sales: after date filtering
if (selectedParty) filter where inv.to_company_name === selectedParty

// Purchases: after date filtering  
if (selectedVendor) filter where (inv.from_company_name || inv.to_company_name) === selectedVendor
```

### UI placement
- Each filter dropdown sits inline next to the entry count line (e.g., "12 invoices") within each tab's content area
- Uses the existing shadcn `Select` component for consistency

### Files Summary

| Action | File |
|--------|------|
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- remove global export, add party/vendor filter dropdowns |

