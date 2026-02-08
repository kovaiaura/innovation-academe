

# Comprehensive Invoice Management System Overhaul

## Overview

Transform the existing basic invoice system into a professional, audit-ready accounting platform with complete financial tracking, payment management, credit/debit notes, TDS handling, and month-wise reporting capabilities across Institution Billing, Sales Billing, and Purchase Billing.

---

## Current State Analysis

**Existing Features:**
- Basic invoice creation with GST (CGST/SGST/IGST) calculations
- Simple status workflow: Draft, Issued, Paid, Cancelled, Overdue
- PDF generation with signature support
- Line items with HSN/SAC codes
- Basic TDS columns exist (tds_rate, tds_amount) but not fully utilized
- Real-time subscription for invoice updates

**What's Missing:**
- Payment recording with multiple modes
- Credit/Debit note management
- TDS handling (self vs client deducted)
- Payment tracking (partial payments, balance due)
- Month-wise filtering and reporting
- Aging reports
- Dashboard summary cards
- Audit trail
- Export functionality

---

## Phase 1: Database Schema Extensions

### New Tables

**payments** - Track all payment transactions against invoices
- Links to invoice with payment details
- Supports multiple payments per invoice (partial payments)
- Tracks payment mode, reference, bank details
- TDS tracking per payment

**credit_debit_notes** - Track adjustments
- Credit notes for refunds/discounts
- Debit notes for additional charges
- Links to original invoice
- Full GST reversal/addition calculations

**invoice_audit_log** - Complete audit trail
- Tracks all changes to invoices
- Who changed, when, what values

### Invoice Table Enhancements
- `amount_paid` - Running total of payments received
- `tds_deducted_by` - 'self' | 'client' | 'none'
- `tds_certificate_number` - For client-deducted TDS
- `payment_status` - 'unpaid' | 'partial' | 'paid'
- `last_payment_date` - Most recent payment
- `sent_date` - When invoice was dispatched

---

## Phase 2: Extended Invoice Workflow

### New Status Flow
```text
Draft -> Sent -> Partially Paid -> Paid
           |           |
           v           v
        Overdue    Overdue
           |
           v
       Cancelled
```

### Payment Status (separate from invoice status)
- **Unpaid**: No payments received
- **Partial**: Some payment received, balance remaining
- **Paid**: Full amount received (considering TDS adjustments)

---

## Phase 3: Payment Recording System

### Record Payment Dialog
When recording a payment, capture:
- Payment date
- Amount received
- Mode of payment:
  - Bank Transfer (NEFT/RTGS/IMPS)
  - Cheque (with cheque number, bank)
  - UPI
  - Cash
  - Credit Card
  - Online Payment Gateway
- Transaction/Reference number
- TDS Handling:
  - No TDS
  - Client deducted TDS (amount + certificate number + quarter)
  - We deducted TDS (for purchase invoices)
- Notes/Remarks

### Partial Payment Support
- Multiple payments against single invoice
- Auto-calculate remaining balance after each payment
- Show complete payment history per invoice

---

## Phase 4: Credit/Debit Notes

### Credit Notes
- Issue when goods returned, discount given, or billing error
- Link to original invoice
- Itemized with GST reversal
- Reduces receivable amount

### Debit Notes
- Issue for additional charges, price increases
- Can be standalone or linked to invoice
- Increases receivable amount
- Full GST calculations

---

## Phase 5: Enhanced TDS Management

### TDS Configuration
- Applicable TDS rates (2%, 10%, etc.)
- Who deducts:
  - **Client Deducted** (Sales/Institution): Client deducts from payment
  - **Self Deducted** (Purchase): We deduct before paying vendor

### TDS Certificate Tracking
- Certificate number (Form 16A for 194J, etc.)
- Financial year and quarter
- Amount certified
- Upload certificate document
- Reconciliation status

---

## Phase 6: Dashboard & Top Sheet

### Summary Cards (per tab)
- Total Outstanding
- Overdue Amount (red indicator)
- This Month Invoiced
- This Month Collected
- TDS Receivable (for Sales/Institution)
- TDS Payable (for Purchase)

### Quick Filters
- Date range (Month/Quarter/Year/Custom)
- Status filter
- Payment status filter
- Customer/Vendor search

---

## Phase 7: Month-Wise View & Reports

### Month Navigator
- Calendar-style month selector
- Quick previous/next month buttons
- Jump to specific month-year

### Monthly View Features
- Invoices created in selected month
- Payments received in selected month
- Outstanding as of month-end
- Month-over-month comparison

### Export Reports
- **Invoice Register** (Excel/PDF)
  - All invoices with full details
  - GST breakup
  - Payment status
- **Outstanding Report**
  - Customer-wise outstanding
  - Aging buckets (0-30, 31-60, 61-90, 90+ days)
- **Collection Report**
  - Payment-wise collection details
  - Mode-wise summary
- **TDS Report**
  - TDS deducted/receivable
  - Certificate tracking status
- **GST Summary**
  - CGST/SGST/IGST totals
  - State-wise breakup

---

## Phase 8: Aging Reports

### Visual Aging Chart
- Stacked bar chart showing aging buckets
- Current (not yet due)
- 1-30 days overdue
- 31-60 days overdue
- 61-90 days overdue
- 90+ days overdue

### Customer/Vendor-wise Aging
- Drill down by party
- Days Since Invoice (DSI) calculation
- Automatic overdue flagging

---

## Phase 9: Enhanced Invoice List

### Additional Columns
- Sent Date
- Amount Paid
- Balance Due
- Days Overdue
- TDS Amount
- Payment Status indicator

### Quick Actions
- Mark as Sent
- Record Payment
- Issue Credit Note
- View Payment History
- Send Reminder (email)
- Duplicate Invoice

### Bulk Operations
- Export selected to Excel
- Export selected to PDF
- Bulk status update
- Send bulk reminders

---

## Phase 10: Enhanced PDFs

### Updated Invoice PDF
- Payment status watermark (PAID/PARTIAL/OVERDUE)
- UPI QR code for easy payment
- Outstanding amount prominently displayed
- Credit note references if applicable

### New PDF Documents
- Payment Receipt
- Credit Note
- Debit Note
- Statement of Account (multi-invoice)
- Aging Report

---

## Implementation Files

### New Files to Create
```text
src/types/payment.ts
src/types/credit-debit-note.ts
src/services/payment.service.ts
src/services/credit-debit-note.service.ts
src/services/invoice-export.service.ts
src/hooks/usePayments.ts
src/hooks/useCreditDebitNotes.ts
src/hooks/useInvoiceSummary.ts

src/components/invoice/RecordPaymentDialog.tsx
src/components/invoice/PaymentHistoryDialog.tsx
src/components/invoice/CreateCreditNoteDialog.tsx
src/components/invoice/CreateDebitNoteDialog.tsx
src/components/invoice/InvoiceSummaryCards.tsx
src/components/invoice/InvoiceMonthFilter.tsx
src/components/invoice/AgingReportChart.tsx
src/components/invoice/TDSCertificateUpload.tsx
src/components/invoice/InvoiceAuditLog.tsx
src/components/invoice/InvoiceExportDialog.tsx

src/components/invoice/pdf/PaymentReceiptPDF.tsx
src/components/invoice/pdf/CreditNotePDF.tsx
src/components/invoice/pdf/DebitNotePDF.tsx
src/components/invoice/pdf/StatementOfAccountPDF.tsx
src/components/invoice/pdf/AgingReportPDF.tsx
```

### Files to Modify
```text
src/types/invoice.ts - Add payment tracking fields
src/services/invoice.service.ts - Add payment/export methods
src/pages/system-admin/InvoiceManagement.tsx - Add dashboard, reports
src/components/invoice/InvoiceList.tsx - Add columns, actions
src/components/invoice/InvoiceStatusBadge.tsx - New statuses
src/components/invoice/CreateInvoiceDialog.tsx - TDS options
src/hooks/useInvoices.ts - Month filtering
```

---

## Database Triggers & Functions

### Auto-update Payment Status
Trigger on payments table to:
- Update invoice.amount_paid
- Update invoice.payment_status
- Update invoice.balance_due

### Overdue Detection
Daily scheduled function to:
- Mark invoices past due_date as overdue
- Calculate days overdue

### Audit Trail Trigger
On invoice INSERT/UPDATE/DELETE:
- Log old and new values
- Record user and timestamp

---

## Security & RLS

### Payment Table Policies
- Same access rules as parent invoice
- System admins can view all
- Read-only for non-admins

### Credit/Debit Notes
- Follow invoice access rules
- Only creators or admins can modify

### Audit Logs
- Read-only access
- Only super_admin can view all logs

---

## UI/UX Enhancements

### Tab Structure (Enhanced)
Each billing tab will have sub-tabs:
- **All Invoices** - List with filters
- **Monthly Report** - Month-wise view
- **Aging Analysis** - Aging chart and table
- **Payments** - Payment history
- **Credit/Debit Notes** - Adjustments

### Color Coding
- Draft: Gray
- Sent: Blue
- Partially Paid: Yellow/Amber
- Paid: Green
- Overdue: Red/Orange
- Cancelled: Muted/Strikethrough

---

## Summary

This comprehensive overhaul transforms the invoice system into a complete accounting solution with:
- Full payment lifecycle tracking with multiple modes
- Credit/Debit note management for adjustments
- Flexible TDS handling for both receivables and payables
- Month-wise filtering and comprehensive reporting
- Professional dashboards with aging analysis
- Complete audit compliance
- Export capabilities for Excel and PDF
- Enhanced PDF documents with receipts and statements

Each invoice type (Institution, Sales, Purchase) will have its tailored experience while sharing the common infrastructure for consistency and maintainability.

