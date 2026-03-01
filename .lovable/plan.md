

# Simplify Summary Cards, Add Unified Date Filter, Fix Invoice Number Reuse

## Overview
Three changes: (1) Replace 6 summary cards with 3 minimal ones, (2) add a unified date-range filter for both cards and invoice list, (3) make deleted invoice numbers reusable.

---

## 1. Replace Summary Cards with 3 Minimal Cards

**File: `src/components/invoice/GlobalSummaryCards.tsx`** -- Rewrite

Replace the current 6-card grid with just 3 clean, minimal cards:
- **Total Sales** -- sum of all sales/institution invoice amounts (in filtered range)
- **Received** -- sum of payments received (in filtered range)
- **Overdue** -- sum of balance on unpaid invoices past due date (in filtered range)

The component will accept the filtered invoices and payments arrays (not the summary object) so it can compute values based on the active date filter.

---

## 2. Unified Date Range Filter (replaces InvoiceMonthFilter)

**New file: `src/components/invoice/InvoiceDateFilter.tsx`**

A compact filter bar with preset options:
- **All Time** (default) -- no date filtering
- **This Month** / **This Quarter** / **This Year**
- **Custom Range** -- shows two date pickers (from/to)

Returns a `{ from: Date | null, to: Date | null }` range that applies to both the summary cards and the invoice listing.

**File: `src/pages/system-admin/InvoiceManagement.tsx`** -- Update

- Remove `InvoiceMonthFilter` usage and `selectedMonth` state
- Add `dateRange` state (`{ from: Date | null, to: Date | null }`)
- Use `InvoiceDateFilter` component
- Filter `allInvoices` by `invoice_date` within the date range
- Pass filtered invoices to both `GlobalSummaryCards` and `InvoiceList`
- Pass filtered payments to `GlobalSummaryCards` for "Received" calculation

---

## 3. Fix Invoice Number Reuse After Deletion

**Database migration**: Modify the `get_next_invoice_number_v2` function.

Current behavior: Always increments `current_number` in `invoice_settings`, so if invoice 039 is deleted, the next one becomes 040.

New behavior: After incrementing the counter, check if any invoice with that number already exists. If not, use it. But more importantly, when an invoice is deleted, decrement the counter back so the number gets reused.

Simpler approach: Instead of modifying the RPC, update the `deleteInvoice` service to decrement `current_number` in `invoice_settings` when the deleted invoice's number matches the highest counter. This way, if 039 is deleted and it was the latest, the counter goes back to 38, so the next call produces 039 again.

**File: `src/services/invoice.service.ts`** -- Update `deleteInvoice`

After successfully deleting an invoice, check if its number was the highest (matches current counter). If so, decrement `invoice_settings.current_number` by 1. This handles the exact scenario: delete 039 -> next new invoice is 039.

---

## File Summary

| Action | File |
|--------|------|
| Rewrite | `src/components/invoice/GlobalSummaryCards.tsx` -- 3 minimal cards |
| Create | `src/components/invoice/InvoiceDateFilter.tsx` -- unified date filter |
| Modify | `src/pages/system-admin/InvoiceManagement.tsx` -- wire new filter + simplified cards |
| Modify | `src/services/invoice.service.ts` -- decrement counter on delete |
| Delete (unused) | `src/components/invoice/InvoiceMonthFilter.tsx` -- replaced by InvoiceDateFilter |
| Modify | `src/hooks/useGlobalInvoiceSummary.ts` -- minor: export type only (summary interface simplified) |
| DB Migration | Update `get_next_invoice_number_v2` or handle in service layer |

