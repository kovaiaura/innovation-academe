
# Plan: Company Inventory Management System

## Overview

Implement a comprehensive **Company Inventory Management** system for the CEO/System Admin role, separate from the existing institution-level inventory. This system will manage Meta-Innova's internal stock with full audit-friendly tracking, stock entry (inward), stock issue (outward), supplier management, and detailed reports with Excel/PDF export capabilities.

---

## Architecture

```text
+---------------------------+        +---------------------------+
|    company_item_master    |        |       company_suppliers   |
+---------------------------+        +---------------------------+
| id (uuid)                 |        | id (uuid)                 |
| item_code (unique)        |        | name                      |
| item_name                 |        | contact_person            |
| category                  |        | phone, email              |
| unit_of_measure           |        | address, gstin            |
| gst_percentage            |        | status (active/inactive)  |
| reorder_level             |        | created_at                |
| current_stock             |        +---------------------------+
| created_by, created_at    |
+---------------------------+
            |
            v
+---------------------------+        +---------------------------+
|   company_stock_entries   |        |   company_stock_issues    |
+---------------------------+        +---------------------------+
| id (uuid)                 |        | id (uuid)                 |
| entry_date                |        | issue_date                |
| entry_type (inward)       |        | issued_to_type            |
| item_id (FK)              |        | (dept/project/school)     |
| supplier_id (FK)          |        | issued_to_id              |
| invoice_number            |        | issued_to_name            |
| invoice_date              |        | item_id (FK)              |
| quantity                  |        | quantity                  |
| rate                      |        | purpose / reference       |
| amount                    |        | created_by                |
| batch_serial (optional)   |        | created_at                |
| location_store (optional) |        +---------------------------+
| created_by, created_at    |
+---------------------------+
```

---

## Database Changes

### 1. Create `company_suppliers` Table
Stores supplier master data for the company inventory.

```sql
CREATE TABLE public.company_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  gstin text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Create `company_item_master` Table
Central item master with all required fields.

```sql
CREATE TABLE public.company_item_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  item_name text NOT NULL,
  category text,
  unit_of_measure text NOT NULL DEFAULT 'Nos',
  gst_percentage numeric(5,2) DEFAULT 0,
  reorder_level integer DEFAULT 0,
  current_stock integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3. Create `company_stock_entries` Table
Records all inward stock movements.

```sql
CREATE TABLE public.company_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  item_id uuid NOT NULL REFERENCES company_item_master(id) ON DELETE RESTRICT,
  supplier_id uuid REFERENCES company_suppliers(id),
  invoice_number text,
  invoice_date date,
  quantity integer NOT NULL CHECK (quantity > 0),
  rate numeric(12,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) GENERATED ALWAYS AS (quantity * rate) STORED,
  batch_serial text,
  location_store text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
```

### 4. Create `company_stock_issues` Table
Records all outward stock movements.

```sql
CREATE TABLE public.company_stock_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  item_id uuid NOT NULL REFERENCES company_item_master(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  issued_to_type text NOT NULL CHECK (issued_to_type IN ('department', 'project', 'institution', 'branch', 'other')),
  issued_to_id uuid,
  issued_to_name text NOT NULL,
  purpose text,
  reference_number text,
  notes text,
  admin_override boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
```

### 5. Database Functions & Triggers

#### Auto-update stock on entry/issue
```sql
-- Trigger to update stock on new entry
CREATE OR REPLACE FUNCTION update_stock_on_entry()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE company_item_master 
  SET current_stock = current_stock + NEW.quantity,
      updated_at = now()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock on issue (with negative stock prevention)
CREATE OR REPLACE FUNCTION update_stock_on_issue()
RETURNS TRIGGER AS $$
DECLARE
  v_current_stock integer;
BEGIN
  SELECT current_stock INTO v_current_stock 
  FROM company_item_master WHERE id = NEW.item_id;
  
  -- Prevent negative stock unless admin override
  IF v_current_stock < NEW.quantity AND NOT NEW.admin_override THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', v_current_stock, NEW.quantity;
  END IF;
  
  UPDATE company_item_master 
  SET current_stock = current_stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 6. RLS Policies
- CEO/System Admin with `company_inventory` feature can read/write all
- Other roles have no access unless explicitly granted via position visible_features

---

## Feature Flag Addition

### Update `SystemAdminFeature` Type
Add new feature to `src/types/permissions.ts`:

```typescript
export type SystemAdminFeature = 
  | ...existing features...
  | 'company_inventory';
```

### Update Position Creation Dialogs
Add to feature list in `CreatePositionDialog.tsx` and `EditPositionDialog.tsx`:

```typescript
{ value: 'company_inventory', label: 'Company Inventory' },
```

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/system-admin/CompanyInventory.tsx` | Main page with tabs for Items, Stock Entry, Stock Issue, Suppliers, Reports |
| `src/components/company-inventory/ItemMasterTab.tsx` | Item master CRUD operations |
| `src/components/company-inventory/StockEntryTab.tsx` | Inward stock entry form and list |
| `src/components/company-inventory/StockIssueTab.tsx` | Outward stock issue form and list |
| `src/components/company-inventory/SuppliersTab.tsx` | Supplier management |
| `src/components/company-inventory/ReportsTab.tsx` | Stock ledger, current stock summary, supplier purchase history |
| `src/components/company-inventory/AddItemDialog.tsx` | Dialog for adding/editing items |
| `src/components/company-inventory/AddSupplierDialog.tsx` | Dialog for adding/editing suppliers |
| `src/components/company-inventory/StockEntryDialog.tsx` | Dialog for recording inward stock |
| `src/components/company-inventory/StockIssueDialog.tsx` | Dialog for recording outward stock |
| `src/hooks/useCompanyInventory.ts` | React Query hooks for all CRUD operations |
| `src/services/companyInventory.service.ts` | Supabase service functions |
| `src/types/companyInventory.ts` | TypeScript interfaces |
| `src/utils/companyInventoryExport.ts` | Excel/PDF export utilities |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/permissions.ts` | Add `company_inventory` to SystemAdminFeature type and ALL_SYSTEM_ADMIN_FEATURES array |
| `src/components/position/CreatePositionDialog.tsx` | Add Company Inventory to feature checkbox list |
| `src/components/position/EditPositionDialog.tsx` | Add Company Inventory to feature checkbox list |
| `src/components/layout/Sidebar.tsx` | Add Company Inventory menu item with feature check |
| `src/App.tsx` | Add route for `/company-inventory` |

---

## UI Components Breakdown

### 1. Main Page: `CompanyInventory.tsx`
- **Tabs**: Item Master | Stock Entry | Stock Issue | Suppliers | Reports
- Header with quick stats (Total Items, Low Stock Alerts, Total Value)

### 2. Item Master Tab
- Search and filter
- Table: Item Code, Name, Category, UoM, GST%, Current Stock, Reorder Level, Status
- Add/Edit/Delete functionality
- Low stock indicator (when current_stock ≤ reorder_level)

### 3. Stock Entry (Inward) Tab
- Entry form with fields: Date, Supplier, Invoice No, Invoice Date, Item, Qty, Rate, Batch/Serial, Location
- Recent entries list with edit capability
- Auto-link to existing invoices from Invoice Management (if purchase invoice exists)

### 4. Stock Issue (Outward) Tab
- Issue form: Date, Department/Project/Institution selector, Item, Quantity, Purpose
- Negative stock warning with admin override checkbox (CEO only)
- Recent issues list

### 5. Suppliers Tab
- CRUD for suppliers
- View purchase history per supplier

### 6. Reports Tab
Three main reports with Excel/PDF export:

1. **Stock Ledger**
   - Select item and date range
   - Shows: Opening, Inward entries, Outward issues, Closing balance
   
2. **Current Stock Summary**
   - All items with current stock and value
   - Highlight low stock items
   
3. **Supplier-wise Purchase History**
   - Select supplier and date range
   - List all purchases with totals

---

## Export Functionality

### Excel Export
Using the browser to generate CSV/Excel compatible format:
```typescript
function exportToExcel(data: any[], filename: string) {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadBlob(blob, `${filename}.csv`);
}
```

### PDF Export
Using `@react-pdf/renderer` (already installed):
```typescript
function generateStockLedgerPDF(data: StockLedgerData) {
  // Generate PDF document with proper formatting
}
```

---

## Integration with Existing Systems

### 1. Link with Invoice Management (Purchase Bills)
- When recording stock entry, optionally link to existing purchase invoice
- Auto-populate supplier/invoice details if linked

### 2. Issue to Institution/Project
- When issuing stock, select from existing institutions or projects
- Track which institution/project received inventory

---

## User Flows

### Flow 1: Add New Item to Master
1. Navigate to Company Inventory → Item Master
2. Click "Add Item"
3. Enter: Item Code (auto-suggest or manual), Name, Category, UoM, GST%, Reorder Level
4. Save → Item appears in master list with 0 stock

### Flow 2: Record Stock Entry (Inward)
1. Navigate to Stock Entry tab
2. Click "New Entry"
3. Select/search item, enter quantity, rate
4. Select supplier (or add new)
5. Enter invoice details
6. Save → Stock automatically updates in Item Master

### Flow 3: Issue Stock (Outward)
1. Navigate to Stock Issue tab
2. Click "New Issue"
3. Select item → Shows available stock
4. Select destination (Department/Project/Institution)
5. Enter quantity and purpose
6. If qty > available: Show warning, require admin override
7. Save → Stock automatically decreases

### Flow 4: Generate Report
1. Navigate to Reports tab
2. Select report type (Stock Ledger / Current Stock / Supplier History)
3. Set filters (date range, item/supplier)
4. View report in table
5. Export to Excel or PDF

---

## Summary

This implementation creates a complete company-level inventory management system with:
- Full item master with GST and reorder tracking
- Supplier management
- Stock entry (inward) with invoice linking
- Stock issue (outward) with destination tracking
- Automatic stock balance updates via triggers
- Negative stock prevention with admin override
- Three comprehensive reports with export capability
- Role-based access via `company_inventory` feature flag
- Integration with existing invoice and institution systems
