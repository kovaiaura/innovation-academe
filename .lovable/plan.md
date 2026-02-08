
# Purchase Billing Workflow Enhancement

## Understanding the Requirements

You've correctly identified that **Purchase Billing** has a fundamentally different workflow from Sales/Institution billing:

1. **Purchase = We BUY goods/services FROM vendors** (we receive invoices, we pay)
2. **Sales/Institution = We SELL goods/services TO clients** (we send invoices, we get paid)

### Current Issues

The current implementation treats Purchase invoices similarly to Sales invoices, which is incorrect:
- Shows "Mark as Sent" and "Mark as Issued" actions (not applicable - we receive the bill, not send it)
- TDS section says "TDS Deducted by Client" (wrong - WE deduct TDS before paying vendor)
- Missing proper "Make Payment" workflow where we record OUR payments to vendors
- UI doesn't reflect the "we owe them" perspective

---

## Proposed Changes

### 1. Purchase Invoice Actions Overhaul

**Remove for Purchase:**
- Mark as Sent
- Mark as Issued
- Issue Credit Note (different workflow for purchase)
- Issue Debit Note
- TDS Certificate Upload (we don't receive TDS certificates for purchases)

**Keep/Add for Purchase:**
- View (show bill details + attached vendor invoice)
- Record Payment / Make Payment (when we pay the vendor)
- Edit Payment (modify existing payment records)
- Payment History (track all payments we made)
- View Audit Log

**Auto-behaviors:**
- When total payments = bill amount → Auto-mark as "Paid"
- Show "Pending" status until first payment, then "Partial" until fully paid

### 2. Purchase-Specific Record Payment Dialog

Create a new `RecordPurchasePaymentDialog` with these differences:

| Field | Sales/Institution | Purchase |
|-------|------------------|----------|
| TDS Label | "TDS Deducted by Client" | "TDS Deducted by Us" |
| TDS Meaning | Client withheld tax from payment | We withhold tax before paying |
| TDS Input | Amount OR Certificate # | Percentage (2%, 10%) OR Amount |
| Certificate | We receive from client | We issue (track Form 16A details) |

**Payment Recording Fields:**
- Payment Date
- Amount Paid (net amount we transferred)
- Payment Mode (NEFT/RTGS/IMPS/UPI/Cheque/Cash)
- Reference/UTR Number
- TDS Section:
  - Toggle: "We Deducted TDS"
  - If yes: TDS Rate (2%, 5%, 10%) OR Amount
  - TDS Section (194J, 194C, etc.)
  - Our TAN Number (for reference)
- Bank/Cheque details (if applicable)
- Notes

### 3. Enhanced Create Purchase Invoice UI

Improve the `CreatePurchaseInvoiceDialog` with:

**Section 1: Vendor Details**
- Vendor Name (searchable dropdown if vendor master exists)
- Vendor Address
- Vendor GSTIN
- Vendor PAN (important for TDS)
- Vendor Contact/Phone

**Section 2: Bill Details**
- Vendor Invoice Number (their invoice #)
- Bill Date (date on vendor's invoice)
- Bill Receipt Date (when we received it)
- **Payment Due Date** (prominently shown with days until due)
- Total Amount
- GST Breakup (optional detailed view):
  - Taxable Value
  - CGST/SGST or IGST
  - Total

**Section 3: Attachment**
- Upload vendor bill (PDF/Image) - required
- Preview uploaded document

**Section 4: Category/Notes**
- Expense Category (optional dropdown)
- Notes/Description
- Internal Reference Number (our tracking #)

### 4. Purchase Invoice List Enhancements

**Modified Columns:**
| Column | Description |
|--------|-------------|
| Bill # | Vendor's invoice number |
| Vendor | Vendor name |
| Bill Date | Date on vendor invoice |
| Due Date | Payment due date (with "X days left" or "X days overdue") |
| Amount | Total bill amount |
| Paid | Amount we've paid so far |
| Balance | Remaining amount to pay |
| Status | Pending / Partial / Paid |

**Status Colors:**
- Pending (not yet due): Gray
- Due Soon (within 7 days): Yellow
- Overdue: Red
- Partial: Orange
- Paid: Green

### 5. Database Schema Updates

Add to `payments` table for purchase context:
- `tds_section` (text) - e.g., '194J', '194C'
- `our_tan` (text) - Our TAN for TDS deduction
- `is_self_deducted_tds` (boolean) - True for purchase payments

Modify `invoices` table:
- `bill_receipt_date` (date) - When we received the vendor bill
- `expense_category` (text) - Optional categorization

### 6. Purchase-Specific Status Flow

```text
Received → Pending Payment → Partial → Paid
              ↓
           Overdue
```

- **Received**: Bill recorded but no payment made
- **Pending Payment**: Awaiting payment (not overdue yet)
- **Partial**: Some payment made
- **Overdue**: Due date passed with balance remaining
- **Paid**: Fully paid

---

## Implementation Files

### Files to Create
```text
src/components/invoice/RecordPurchasePaymentDialog.tsx
src/components/invoice/PurchaseInvoiceList.tsx (specialized list)
```

### Files to Modify
```text
src/components/invoice/CreatePurchaseInvoiceDialog.tsx
  - Add payment due date prominence
  - Add vendor PAN field
  - Add expense category
  - Improve layout and UX

src/components/invoice/InvoiceList.tsx
  - Add invoice_type awareness for actions
  - Show different action menu for purchase

src/pages/system-admin/InvoiceManagement.tsx
  - Wire up new purchase payment dialog
  - Different handling for purchase tab

src/types/payment.ts
  - Add tds_section, our_tan, is_self_deducted_tds

src/services/payment.service.ts
  - Support purchase-specific payment fields

src/hooks/usePayments.ts
  - Add updatePayment method for edit functionality
```

### Database Migration
```sql
-- Add purchase-specific columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tds_section text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS our_tan text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_self_deducted_tds boolean DEFAULT false;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_receipt_date date;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS expense_category text;
```

---

## Summary

This plan transforms Purchase Billing into a proper "Payables" module with:
- Correct workflow perspective (we pay vendors, not receive payment)
- Proper TDS handling (we deduct, not client)
- Clear due date tracking and overdue alerts
- Payment recording with edit capability
- Auto-status updates when fully paid
- Enhanced vendor bill entry with all required details

The key insight is that Purchase Billing operates as an **Accounts Payable** system, not a mirror of Sales/Institution which is **Accounts Receivable**.
