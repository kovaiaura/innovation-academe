
# Complete Invoice Management Overhaul

## Summary of Changes Required

Based on your requirements, this plan addresses the following major changes:

1. **Delete invoices in any state** with proper cascade handling
2. **Merge Institution Billing into Sales Billing** (single tab)
3. **Enhanced table columns** for both Sales and Purchase with TDS, Payment Mode, Reference columns
4. **Remove "View Vendor Bill" action** (already visible in View Details)
5. **New Summary Cards** showing 6 KPIs across all billing types
6. **Remove "Show Aging" button** and embed reports below the table
7. **Export enhancements** with Invoice URL/Link column
8. **Monthly/Quarterly/Custom report view** below the table

---

## Phase 1: Database Changes

### Update Delete Function
Currently, `deleteInvoice()` only deletes drafts. We need to:
- Allow deletion in ANY state
- Add cascade delete for related records (payments, credit/debit notes, audit logs)
- The database already has ON DELETE CASCADE for foreign keys, so we just need to remove the status restriction

**File: `src/services/invoice.service.ts`**
```typescript
// Remove the status filter to allow delete in any state
export async function deleteInvoice(id: string): Promise<void> {
  // Delete related payments first
  await supabase.from('payments').delete().eq('invoice_id', id);
  // Delete related credit/debit notes
  await supabase.from('credit_debit_notes').delete().eq('invoice_id', id);
  // Delete related audit logs
  await supabase.from('invoice_audit_log').delete().eq('invoice_id', id);
  // Delete invoice (line items cascade automatically)
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
}
```

---

## Phase 2: Merge Institution into Sales Billing

### Changes to Tab Structure
- Remove "Institution Billing" tab
- Keep only **Sales Billing** and **Purchase Billing**
- Institution invoices will appear under Sales Billing (they're both Accounts Receivable)

**File: `src/pages/system-admin/InvoiceManagement.tsx`**

- Change tabs from 3 to 2: `['sales', 'purchase']`
- Update fetch logic to include both `sales` and `institution` invoice types when on Sales tab
- Update labels and icons accordingly

---

## Phase 3: Enhanced Sales Table Columns

### New Column Structure for Sales Billing
| Column | Description |
|--------|-------------|
| Invoice # | Invoice number |
| Customer | Customer/Institution name |
| Date | Invoice date |
| Due Date | Payment due date (with overdue indicator) |
| Total Amount | Invoice total |
| Paid by Client | Amount received |
| Balance | Outstanding balance |
| TDS (Client) | TDS deducted by client (NEW - before Status) |
| Status | Invoice status badge |
| Payment | Payment status badge |
| Payment Mode | NEFT/UPI/Cheque etc. (from latest payment) |
| Reference # | Latest payment reference number |
| Actions | Dropdown menu |

**File: `src/components/invoice/InvoiceList.tsx`**
- Add TDS column before Status
- Add Payment Mode column
- Add Reference Number column
- Enable delete for ALL invoice states

---

## Phase 4: Enhanced Purchase Table Columns

### New Column Structure for Purchase Billing
| Column | Description |
|--------|-------------|
| Our Ref # | Our internal reference |
| Vendor Bill # | Vendor's invoice number |
| Vendor | Vendor name |
| Bill Date | Date on vendor invoice |
| Due Date | Payment due date |
| Amount | Total bill amount |
| Paid | Amount we paid |
| Balance | Remaining to pay |
| TDS (Deducted) | TDS we deducted (NEW - before Status) |
| Status | Payment status |
| Actions | Dropdown menu (without View Vendor Bill) |

**File: `src/components/invoice/PurchaseInvoiceList.tsx`**
- Add TDS column before Status
- Remove "View Vendor Bill" action from dropdown
- Enable delete for ALL states

---

## Phase 5: New Summary Cards (6 Cards)

### Cross-Billing Summary Dashboard
Replace current 5 cards with 6 new unified cards:

| # | Card Title | Source | Description |
|---|------------|--------|-------------|
| 1 | Sales Bill Total | Sales + Institution invoices | Total value of all sales invoices |
| 2 | Purchase Bill Total | Purchase invoices | Total value of all purchase bills |
| 3 | Payments Made | Payments on Purchase | Amount paid for purchase bills |
| 4 | Payments Received | Payments on Sales/Institution | Amount received from clients |
| 5 | TDS We Deducted | Purchase payments | TDS we withheld from vendors |
| 6 | TDS Client Deducted | Sales/Institution invoices | TDS clients withheld from us |

### New Hook: `useGlobalInvoiceSummary`
Create a new hook that fetches data across ALL invoice types for the summary cards:

**File: `src/hooks/useGlobalInvoiceSummary.ts`**
```typescript
export interface GlobalSummary {
  sales_total: number;
  purchase_total: number;
  payments_made: number;
  payments_received: number;
  tds_we_deducted: number;
  tds_client_deducted: number;
}
```

**File: `src/components/invoice/GlobalSummaryCards.tsx`**
New component with 6 cards displayed at the top of the page (above tabs)

---

## Phase 6: Remove "Show Aging" Button

### Changes
- Remove the "Show Aging" button from the header
- Move the aging chart/report to display BELOW the invoice table
- Always show the aging analysis (no toggle needed)

**File: `src/pages/system-admin/InvoiceManagement.tsx`**
- Remove `showAgingChart` state and button
- Move `AgingReportChart` component below `InvoiceList`/`PurchaseInvoiceList`

---

## Phase 7: Embedded Report View Below Table

### New Report Section Component
Create a tabbed report section with:
- **Monthly View**: Bar chart showing invoiced vs collected by month
- **Quarterly View**: Aggregated quarterly data
- **Custom Range**: Date picker for custom period
- **Aging Analysis**: The current aging chart (always visible)

**File: `src/components/invoice/InvoiceReportSection.tsx`**
```typescript
interface InvoiceReportSectionProps {
  invoices: Invoice[];
  payments: Payment[];
  invoiceType: InvoiceType;
}

// Sub-tabs: Monthly | Quarterly | Custom | Aging
```

The component will include:
- Date range selector
- Bar chart (Recharts) showing invoiced vs collected
- Summary statistics for the selected period

---

## Phase 8: Enhanced Export with Invoice Link

### Add Invoice URL Column
For each invoice, generate a URL that can be used to view/download the invoice:

**File: `src/services/invoice-export.service.ts`**

Update `exportToCSV` to add an "Invoice Link" column:
```typescript
// For Sales invoices
const invoiceUrl = `${window.location.origin}/invoice/${inv.id}`;
headers.push('Invoice Link');
// Each row includes the URL
```

For Purchase:
- Include "Vendor Bill Link" column pointing to the attachment URL

---

## Implementation Files Summary

### Files to Create
```
src/hooks/useGlobalInvoiceSummary.ts
src/components/invoice/GlobalSummaryCards.tsx
src/components/invoice/InvoiceReportSection.tsx
```

### Files to Modify
```
src/services/invoice.service.ts
  - Update deleteInvoice() to handle any state with cascades

src/pages/system-admin/InvoiceManagement.tsx
  - Merge Institution into Sales tab (2 tabs only)
  - Add GlobalSummaryCards at top
  - Remove "Show Aging" button
  - Add InvoiceReportSection below tables

src/components/invoice/InvoiceList.tsx
  - Add TDS column before Status
  - Add Payment Mode and Reference # columns
  - Allow delete in any state (remove condition)

src/components/invoice/PurchaseInvoiceList.tsx
  - Add TDS column before Status
  - Remove "View Vendor Bill" action
  - Allow delete in any state

src/components/invoice/InvoiceSummaryCards.tsx
  - Replace with GlobalSummaryCards (or update to show 6 cards)

src/services/invoice-export.service.ts
  - Add Invoice Link/URL column to exports

src/hooks/useInvoiceSummary.ts
  - Update to support fetching Sales + Institution together
```

---

## Summary of User Requirements Addressed

| Requirement | Solution |
|-------------|----------|
| Delete in any state | Remove status restriction, add cascade deletes |
| TDS column before Status | Add to both Sales and Purchase tables |
| Remove "View Vendor Bill" | Remove from Purchase dropdown (still in View Details) |
| Merge Institution into Sales | Single "Sales Billing" tab for both |
| Sales table columns | Add Payment Mode, Reference #, TDS columns |
| 6 Summary Cards | New global cards for cross-billing metrics |
| Remove "Show Aging" button | Remove button, embed report below table |
| Monthly/Quarterly/Custom reports | New tabbed report section below table |
| Export with Invoice Link | Add URL column to CSV exports |

---

## Visual Layout After Changes

```
+---------------------------------------------------------------+
| Invoice Management                        [Export] [+ Create] |
+---------------------------------------------------------------+
|                                                               |
| +----------+ +----------+ +----------+ +----------+ +-------+ +----------+
| | Sales    | | Purchase | | Payments | | Payments | | TDS   | | TDS      |
| | Bill     | | Bill     | | Made     | | Received | | We    | | Client   |
| | Total    | | Total    | | (Purch)  | | (Sales)  | | Deduct| | Deducted |
| +----------+ +----------+ +----------+ +----------+ +-------+ +----------+
|                                                               |
| [ Sales Billing ]  [ Purchase Billing ]                       |
|                                                               |
| [Month Filter: < Month v Year v >]                            |
|                                                               |
| +-----------------------------------------------------------+ |
| | Invoice Table (with new columns)                          | |
| |                                                           | |
| | Invoice | Customer | Date | Due | Amount | Paid | Balance | |
| | TDS | Status | Payment | Mode | Reference | Actions       | |
| +-----------------------------------------------------------+ |
|                                                               |
| +-----------------------------------------------------------+ |
| | Report Section                                            | |
| | [ Monthly | Quarterly | Custom | Aging ]                  | |
| |                                                           | |
| | [Chart/Report based on selected tab]                      | |
| +-----------------------------------------------------------+ |
+---------------------------------------------------------------+
```

This comprehensive update transforms the Invoice Management into a professional accounting system with complete visibility across Sales and Purchase billing.
