
# Simplified Invoice Management for CEO Dashboard

## Overview
Rebuild the invoice system to be simpler and more streamlined: unified "Create Invoice" (no sales/institution split), a parties (customer) management system, proper Indian GST with preset rates, auto-incrementing invoice numbers with configurable prefix/suffix, and a clean listing with easy payment recording.

## Database Changes

### 1. New table: `invoice_parties`
Stores saved customers/parties for quick selection during invoice creation.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| party_name | text NOT NULL | Company/person name |
| address | text | Street address |
| city | text | City |
| state | text | State name |
| state_code | text | State code (e.g. 33) |
| pincode | text | PIN code |
| gstin | text | GSTIN number |
| pan | text | PAN number |
| contact_person | text | Contact name |
| phone | text | Phone |
| email | text | Email |
| created_by | uuid | auth.uid() |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: system_admin/super_admin can CRUD.

### 2. New table: `invoice_settings`
Stores invoice numbering configuration (prefix, suffix, current counter).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| prefix | text | e.g. "INV-" (optional) |
| suffix | text | e.g. "" (optional) |
| current_number | integer NOT NULL DEFAULT 0 | Last used number |
| number_padding | integer DEFAULT 3 | Zero-pad length (e.g. 3 = 001) |
| created_by | uuid | auth.uid() |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: system_admin/super_admin can read/update. Single row design (upsert).

### 3. Database function: `get_next_invoice_number()`
Atomically increments `invoice_settings.current_number` and returns the formatted invoice number (prefix + padded number + suffix). Only increments -- called during successful invoice creation.

## Code Changes

### 1. Settings > Invoice tab (`InvoiceSettingsTab.tsx`)
Add a new card **"Invoice Numbering"** with:
- Prefix input (optional, e.g. "INV/24-25/")
- Suffix input (optional)
- Starting Number input (e.g. 001, 037)
- Preview showing what the next invoice number will look like
- Save button that upserts into `invoice_settings`

### 2. GST in Create Invoice Dialog
Replace the current IGST-only collapsible with a simple GST dropdown:
- Preset options: **5% GST** (2.5+2.5), **12% GST** (6+6), **18% GST** (9+9), **28% GST** (14+14), **IGST 5%**, **IGST 12%**, **IGST 18%**, **IGST 28%**, **Custom** (manual entry)
- When a preset is selected, auto-fill CGST/SGST or IGST rates
- Custom allows manually typing any rate

### 3. Parties Management
- New component: `InvoicePartiesManager.tsx` -- a dialog/panel to add, edit, delete saved parties
- Accessible from a "Manage Parties" button on the invoice page
- In Create Invoice dialog: add a "Select Party" dropdown at the top of "Bill To" section that auto-fills all party fields when selected, with option to type manually

### 4. Simplified Create Invoice Dialog
- Remove `invoiceType` prop -- always creates a generic invoice (stored as `invoice_type = 'sales'` in DB for backward compatibility)
- Remove institution selection dropdown
- Invoice number is auto-generated from settings (show as read-only with the next number preview), but allow manual override
- Add party selector at top of Bill To
- GST preset dropdown (as described above)
- Keep line items editor, totals calculation, and notes as-is

### 5. Simplified Invoice List columns
Update `InvoiceList.tsx` to show only:
- Invoice # | Customer | Date | Due Date | Amount | Paid | Balance | TDS Deducted | Status

Status values simplified to: **Draft, Sent, Partially Paid, Fully Paid**

Remove: Mode, Reference columns. Remove payment status badge column (merge into Status).

### 6. Simplified InvoiceManagement page
- Remove Sales/Purchase tabs -- single list view
- Remove the create invoice dropdown (Sales/Institution options) -- single "Create Invoice" button
- Keep month filter, export, and record payment functionality
- Keep the "Record Payment" action in the row dropdown menu (simple flow: click record payment, enter amount + date + mode, done)
- Remove credit/debit note, TDS certificate upload from the simplified view (can be added back later if needed)

### 7. PDF template
No changes -- existing PDF layout remains unchanged as requested.

## File Summary

| Action | File |
|--------|------|
| Migration | New table `invoice_parties`, `invoice_settings`, function `get_next_invoice_number()` |
| New | `src/components/invoice/InvoicePartiesManager.tsx` |
| New | `src/hooks/useInvoiceParties.ts` |
| New | `src/hooks/useInvoiceSettings.ts` |
| Modify | `src/components/settings/InvoiceSettingsTab.tsx` -- add numbering card |
| Modify | `src/components/invoice/CreateInvoiceDialog.tsx` -- party selector, GST presets, auto-number |
| Modify | `src/components/invoice/InvoiceList.tsx` -- simplified columns and statuses |
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- remove tabs, single list, single create button |
| Modify | `src/types/invoice.ts` -- add party type, update status enum |
