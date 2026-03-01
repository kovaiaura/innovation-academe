
Goal: Fix two issues together:
1) GST selection (e.g., GST 18% as CGST+SGST) is not being saved reliably.
2) Invoice PDF header should match your desired layout: logo on left top, TAX INVOICE on right top, and the invoice-detail border box lighter + properly aligned in the same header line.

What I found
- Root cause of GST issue is in `src/services/invoice.service.ts` (`createInvoice` and `updateInvoice`):
  - Current code still forces inter-state tax when state codes differ:
    - `isInterState = ... || (from_company_state_code !== to_company_state_code)`
  - Because of that, even if user selects GST preset with CGST+SGST, code can override and compute as inter-state path (or zero-tax combinations in edge cases), so saved GST doesn’t match user selection.
- PDF header layout issue is in:
  - `src/components/invoice/pdf/InvoicePDFHeader.tsx`
  - `src/components/invoice/pdf/InvoicePDFStyles.ts`
  - Title is currently centered; logo is inside company block below title; details box border is dark and alignment is not in single top-row style you requested.

Implementation approach

1) Make GST persistence follow user-selected preset exactly
- File: `src/services/invoice.service.ts`
- Update both `createInvoice` and `updateInvoice` to derive tax mode from selected rates, not state mismatch.
- New rule:
  - If `igst_rate > 0` and CGST/SGST are 0 → inter-state (IGST path)
  - Otherwise → intra-state (CGST+SGST path)
- Keep fallback defaults only when rates are truly missing, but do not override explicit UI selection via state-code comparison.
- Remove state-comparison coupling from `isInterState` for invoice save calculations.

Why this fixes it:
- Your dropdown selection (GST 18% or IGST 18%) becomes the source of truth.
- Saved `cgst_rate/sgst_rate/igst_rate`, amounts, and totals remain consistent with what you selected in edit/create dialog.

2) Keep view rendering consistent with stored GST values
- File: `src/components/invoice/ViewInvoiceDialog.tsx`
- Replace current view-time `isInterState` based on state code comparison with stored GST-rate/amount presence logic (same strategy already used in PDF totals).
- This prevents UI confusion where invoice appears to show wrong tax split even when data is saved correctly.

3) Redesign PDF header to your required top-line alignment
- Files:
  - `src/components/invoice/pdf/InvoicePDFHeader.tsx`
  - `src/components/invoice/pdf/InvoicePDFStyles.ts`
- Layout changes:
  - Create a top header row:
    - Left: logo (if available)
    - Right: “TAX INVOICE” (with copy subtitle under/near it)
  - Below that, second row in same header section:
    - Left: company details block
    - Right: invoice meta border box (Invoice Number, Date, Terms, Due Date, Place of Supply)
- Styling updates:
  - Light border for invoice meta box (soft gray, thinner appearance)
  - Better padding and label/value alignment (fixed label width + flexible value)
  - Tight, professional spacing so all header elements appear cleanly aligned in one structured header area.

4) Preserve existing behavior and data safety
- No database migration needed.
- No change to invoice numbering logic, line-item editor, or payment logic.
- Logo fallback behavior remains (already using `logo_url || report_logo_url`).

Files to modify
- `src/services/invoice.service.ts`
- `src/components/invoice/ViewInvoiceDialog.tsx`
- `src/components/invoice/pdf/InvoicePDFHeader.tsx`
- `src/components/invoice/pdf/InvoicePDFStyles.ts`

Validation checklist after implementation
1) Edit invoice with GST 18% (CGST+SGST), save, reopen:
- GST preset still shows GST 18%
- Totals show CGST+SGST correctly
- Downloaded PDF also shows CGST+SGST lines.

2) Edit invoice with IGST 18%, save, reopen:
- IGST remains selected and amounts are correct in both screen preview and PDF.

3) Header visual check in PDF:
- Logo appears on left top.
- TAX INVOICE appears on right top.
- Invoice details box has light border and aligned rows.
- Header appears as one cohesive aligned line/section as requested.

Potential edge cases I will handle
- Existing invoices with mixed/legacy rate combinations:
  - If both IGST and CGST/SGST are non-zero from old data, rendering will prioritize explicit stored values consistently (no state-code override).
- Missing logo:
  - Header still aligns correctly with empty logo slot fallback spacing.
