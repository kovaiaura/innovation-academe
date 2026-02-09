
# Purchase Billing Fixes & Enhanced Summary Cards

## Issues Identified

Based on the screenshots and code review:

### 1. Summary Cards Issues
- **Current cards are generic** and use terms like "Collected" and "TDS Receivable" which don't make sense for Purchase Billing
- For **Purchase Billing**, terminology should be:
  - "Total Invoiced" → **"Total Bills"** (what we owe/owed to vendors)
  - "Collected" → **"Amount Paid"** (what we paid to vendors)
  - "TDS Receivable" → **"TDS Deducted by Us"** (TDS we withheld from vendors)
  
### 2. Missing Delete Option
- **Sales Billing**: Delete option only appears for Draft invoices (line 339-350 in InvoiceList.tsx)
- **Purchase Billing**: Delete option only appears when balance equals total (i.e., no payments made), but the condition is buried in PurchaseInvoiceList.tsx

### 3. Export for Purchase
- Current export uses "Customer" column header - needs "Vendor" for purchase
- Missing purchase-specific fields like "Amount Paid" vs "Amount Received"

### 4. Aging Chart for Purchase
- Currently shows "Outstanding" which implies money owed TO us
- For Purchase, it should show money we OWE TO vendors (Payables Aging)

### 5. UI Issues in CreatePurchaseInvoiceDialog
- The dialog looks fine based on screenshot but could use better layout

---

## Implementation Plan

### Phase 1: Type-Aware Summary Cards

Create separate card configurations based on invoice type:

**For Institution/Sales Billing (Accounts Receivable):**
| Card | Description |
|------|-------------|
| Total Invoiced | Sum of all invoices we issued |
| Outstanding | Balance clients owe us |
| Collected | Payments received from clients |
| Overdue | Past-due receivables |
| TDS Receivable | TDS clients deducted (we'll claim) |

**For Purchase Billing (Accounts Payable):**
| Card | Description |
|------|-------------|
| Total Bills | Sum of all vendor bills |
| Outstanding | Balance we owe to vendors |
| Amount Paid | Payments we made to vendors |
| Overdue | Past-due payables |
| TDS Deducted by Us | TDS we withheld from vendors |

### Phase 2: Delete Invoice for Sales Billing

Add delete option to `InvoiceList.tsx` for Sales/Institution invoices that are:
- In "draft" status (already exists), OR
- In any status but have no payments recorded (amount_paid = 0)

This allows cleanup of mistakenly created invoices.

### Phase 3: Enhanced Export for Purchase

Update `invoice-export.service.ts` to:
- Use "Vendor" instead of "Customer" for purchase exports
- Add purchase-specific columns: "TDS Deducted", "Net Paid"
- Export with terminology matching payables workflow

### Phase 4: Aging Chart Terminology

Update `AgingReportChart.tsx` to:
- Accept `invoiceType` prop
- Show "Payables Aging" title for purchase
- Use "Amount we owe" instead of "Amount owed to us"

### Phase 5: Summary Calculation Fix

Update `invoice-export.service.ts` to:
- Add `invoice_type` awareness to `calculateInvoiceSummary`
- Calculate TDS correctly based on type:
  - For Sales/Institution: TDS receivable (client deducted)
  - For Purchase: TDS we deducted (self-deducted)

---

## Technical Implementation

### Files to Modify

**1. `src/components/invoice/InvoiceSummaryCards.tsx`**
- Add `invoiceType` prop
- Create separate card configurations for receivables vs payables
- Update labels and subtitles based on type

**2. `src/components/invoice/InvoiceList.tsx`**
- Add delete option for invoices with no payments (not just drafts)
- Ensure delete confirmation for non-draft invoices

**3. `src/services/invoice-export.service.ts`**
- Update `exportToCSV` to accept `invoiceType` parameter
- Create purchase-specific column headers
- Add TDS tracking columns

**4. `src/components/invoice/InvoiceExportDialog.tsx`**
- Pass `invoiceType` to export function
- Show type-specific export descriptions

**5. `src/components/invoice/AgingReportChart.tsx`**
- Add `invoiceType` prop
- Update title: "Receivables Aging" vs "Payables Aging"
- Adjust tooltip text based on type

**6. `src/pages/system-admin/InvoiceManagement.tsx`**
- Pass `invoiceType` to InvoiceSummaryCards
- Pass `invoiceType` to AgingReportChart
- Update delete handler for expanded delete capability

**7. `src/hooks/useInvoiceSummary.ts`** (if needed)
- Ensure TDS calculations consider invoice type

---

## Summary Cards Configuration

```text
Institution/Sales Billing:
+------------------+----------------+--------------+-----------+------------------+
| Total Invoiced   | Outstanding    | Collected    | Overdue   | TDS Receivable   |
| ₹X,XX,XXX        | ₹X,XX,XXX      | ₹X,XX,XXX    | ₹X,XX,XXX | ₹X,XX,XXX        |
| X invoices       | Balance due    | X paid       | X overdue | Client deducted  |
+------------------+----------------+--------------+-----------+------------------+

Purchase Billing:
+------------------+----------------+--------------+-----------+------------------+
| Total Bills      | Outstanding    | Paid         | Overdue   | TDS Deducted     |
| ₹X,XX,XXX        | ₹X,XX,XXX      | ₹X,XX,XXX    | ₹X,XX,XXX | ₹X,XX,XXX        |
| X bills          | Balance to pay | X settled    | X overdue | By us            |
+------------------+----------------+--------------+-----------+------------------+
```

---

## Delete Invoice Logic

**For Sales/Institution:**
```text
Can Delete If:
- Status is "draft" (no restrictions), OR
- amount_paid = 0 AND no linked payments exist
```

**For Purchase:**
- Keep existing logic (can delete if no payments made)

---

## Expected Outcome

After implementation:
1. Summary cards will show correct terminology for each billing type
2. Delete option available for Sales invoices without payments
3. Export will produce type-appropriate reports
4. Aging chart will use correct terminology (Receivables vs Payables)
5. All calculations will correctly differentiate TDS handling
