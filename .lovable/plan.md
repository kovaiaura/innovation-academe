

# Invoice System Improvements

## 1. Party Management - Add Country, State Auto-suggest, Billing/Shipping Address

### Database Migration
Add new columns to `invoice_parties` table:
- `country` (text, default 'India')
- `billing_address`, `billing_city`, `billing_state`, `billing_state_code`, `billing_pincode` -- rename existing address fields to be billing
- `shipping_address`, `shipping_city`, `shipping_state`, `shipping_state_code`, `shipping_pincode` -- new shipping fields
- `shipping_same_as_billing` (boolean, default true)

Since the existing `address`, `city`, `state` etc. columns already serve as billing address, we'll add shipping columns and a `country` column. The existing columns will remain as billing address fields (no rename needed to avoid breaking changes).

### State Auto-suggest
Create a comprehensive Indian states/UTs list with codes as a constant (all 36 states/UTs). When user selects a state from a searchable dropdown, auto-fill the state code. Country defaults to "India".

### Files Changed:
- **Migration**: Add `country`, `shipping_*` columns to `invoice_parties`
- **`src/hooks/useInvoiceParties.ts`**: Update `InvoiceParty` interface with new fields
- **`src/components/invoice/InvoicePartiesManager.tsx`**: 
  - Add Country field (default "India")
  - Replace State text input with searchable Select of all Indian states (auto-fills state code)
  - Add "Shipping Address" section with "Same as Billing" checkbox
  - Proper 2-column grid layout

## 2. Fix Create Invoice Dialog UI

### Layout fixes in `CreateInvoiceDialog.tsx`:
- Add proper padding inside ScrollArea (`px-6` instead of relying on DialogContent padding)
- Ensure footer buttons stay inside the dialog box (use `DialogFooter` properly within content flow, not absolute)
- Fix side spacing consistency across all sections
- When party is selected, show only billing address fields in "Bill To"
- Use the comprehensive Indian states list (same as party manager)

## 3. Simplified Record Payment Dialog

### Simplify `RecordPaymentDialog.tsx`:
- Primary fields: **Amount Received** and **TDS Deducted** (both numeric inputs, prominent)
- Payment Date, Payment Mode, Reference remain but secondary
- Remove TDS certificate, quarter fields (keep TDS amount only for simplicity)
- Show clear summary: Invoice Total, Already Paid, TDS Already Deducted, Balance Due

## 4. Fix Status Logic (Amount Received + TDS = Fully Paid)

### Update balance calculation across the app:
The core issue: if bill is 700, amount received is 630, and TDS deducted is 70, then 630 + 70 = 700 = Fully Paid.

**`InvoiceList.tsx`** -- Update `getSimplifiedStatus()`:
```text
balance = total_amount - (amount_paid + tds_total)
```
Where `tds_total` is sum of all TDS amounts from payments.

**`payment.service.ts`** -- After creating a payment, update the invoice's `amount_paid` and `tds_amount`:
- Sum all payments' `amount` into `invoices.amount_paid`
- Sum all payments' `tds_amount` into `invoices.tds_amount`
- If `amount_paid + tds_amount >= total_amount`, auto-set status to `paid`
- If `amount_paid + tds_amount > 0 but < total_amount`, status stays as-is (user sees "Partially Paid" badge)

This will be done via a **database trigger** on the `payments` table that automatically updates the parent invoice's `amount_paid`, `tds_amount`, and `status` fields after any INSERT/UPDATE/DELETE on payments.

### Status Display:
- **Draft** -- newly created
- **Sent** -- marked as sent
- **Partially Paid** -- amount_paid + tds > 0 but < total_amount
- **Fully Paid** -- amount_paid + tds >= total_amount

## Technical Summary

| Action | File |
|--------|------|
| Migration | Add columns to `invoice_parties`, create payment trigger |
| Modify | `src/hooks/useInvoiceParties.ts` -- add shipping/country fields |
| Modify | `src/components/invoice/InvoicePartiesManager.tsx` -- billing/shipping, state auto-suggest |
| Modify | `src/components/invoice/CreateInvoiceDialog.tsx` -- UI fixes, full states list, billing address |
| Modify | `src/components/invoice/InvoiceList.tsx` -- fix balance = total - (paid + tds) |
| Modify | `src/components/invoice/RecordPaymentDialog.tsx` -- simplify to amount + tds |
| New | `src/constants/indianStates.ts` -- complete list of 36 states/UTs with codes |

