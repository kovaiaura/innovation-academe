

# Fix Invoice PDF: GST Rates, Logo, and Template Matching

## Problems Identified

1. **GST rates not applied**: The `createInvoice()` function in `invoice.service.ts` ignores the user's selected GST preset. It always fetches company profile defaults. So even if the user picks "18% GST", the saved invoice may have 0% IGST or wrong rates.

2. **Logo missing in PDF**: The `ViewInvoiceDialog` fetches `profile.logo_url` from `company_profiles`, which exists in the schema. The logo may not be configured -- need to also check `report_logo_url` as a fallback since that's where Settings > Report uploads logos.

3. **PDF template doesn't match the sample**: The user wants the downloaded PDF to match the Zoho-style layout from their sample (company info on left, invoice details box on right, Bill To below, line items table, CGST/SGST or IGST breakdown, bank details, terms, signature).

## Changes

### 1. Pass GST rates from dialog to service (`CreateInvoiceInput` + `createInvoice`)

**File: `src/types/invoice.ts`**
- Add optional GST rate fields to `CreateInvoiceInput`: `cgst_rate`, `sgst_rate`, `igst_rate`

**File: `src/services/invoice.service.ts`**
- In `createInvoice()`, use `input.cgst_rate / sgst_rate / igst_rate` if provided, falling back to company profile defaults
- Use the user-selected rates to determine `isInterState` (if `igst_rate > 0`, it's inter-state)

**File: `src/components/invoice/CreateInvoiceDialog.tsx`**
- Pass `cgst_rate`, `sgst_rate`, `igst_rate` from the dialog's `gstRates` state into the `CreateInvoiceInput`

### 2. Fix logo in PDF

**File: `src/components/invoice/ViewInvoiceDialog.tsx`**
- When fetching company profile, check `profile.logo_url` first, then fallback to `profile.report_logo_url` -- both exist in the `company_profiles` table
- This ensures the logo appears in the PDF if either is configured

### 3. Refine PDF totals to show correct GST breakdown

**File: `src/components/invoice/pdf/InvoicePDFTotals.tsx`**
- Fix the GST display logic: if the invoice has `cgst_rate > 0` and `sgst_rate > 0`, show CGST + SGST rows. If `igst_rate > 0`, show IGST row. Don't rely solely on `isInterState` state code comparison -- use the actual stored rates.
- Add "Balance Due" row always (matching the sample template)

### 4. Minor PDF template refinements to match sample

**File: `src/components/invoice/pdf/InvoicePDFHeader.tsx`**
- Ensure phone and email are shown in From company section (already present)

**File: `src/components/invoice/pdf/InvoicePDFFooter.tsx`**  
- Add "Account Details" section title (rename from "Bank Details" to match sample)
- Ensure GST number is shown in account details section

No database changes required. These are all code-level fixes.

## File Summary

| Action | File | Change |
|--------|------|--------|
| Modify | `src/types/invoice.ts` | Add GST rate fields to `CreateInvoiceInput` |
| Modify | `src/services/invoice.service.ts` | Use user-provided GST rates instead of profile defaults |
| Modify | `src/components/invoice/CreateInvoiceDialog.tsx` | Pass GST rates in input |
| Modify | `src/components/invoice/ViewInvoiceDialog.tsx` | Fallback to `report_logo_url` for logo |
| Modify | `src/components/invoice/pdf/InvoicePDFTotals.tsx` | Fix GST display logic based on actual rates |
| Modify | `src/components/invoice/pdf/InvoicePDFFooter.tsx` | Rename bank details heading, show GSTIN |

