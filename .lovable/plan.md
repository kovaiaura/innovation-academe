
# Invoice PDF Template Enhancement Plan

## Issues Identified

Based on the code analysis and your requirements:

### Issue 1: Company Logo Not Showing in PDF
- **Root Cause**: The `InvoicePDFHeader.tsx` component does NOT include any logo rendering
- The `logo_url` is stored in `company_profiles` table and available in Invoice Settings > Branding
- However, the PDF header component never fetches or displays this logo
- The sample PDF template shows a logo should appear at the top left

### Issue 2: Values Half Hidden in Downloaded PDF
- **Root Cause**: The table column widths in `InvoicePDFStyles.ts` are too narrow
- Current column widths total only ~100% but the Tax column contains two lines of text (tax type + amount)
- The cell content overflows and gets clipped
- Font sizes may also be too small for proper rendering

### Issue 3: GST Not Editable During Invoice Creation
- **Current State**: GST rates ARE loaded from company profile and used for calculations
- However, there's NO UI to let users change the GST rates per invoice during creation
- The rates are fetched but displayed as read-only in the totals section

---

## Proposed Changes

### 1. Add Company Logo to PDF Header

Update `InvoicePDFHeader.tsx` to:
- Accept `logoUrl` as a prop
- Display the logo in the header section (top left, matching sample template layout)
- Add logo styles to `InvoicePDFStyles.ts`

Update `InvoicePDF.tsx` to:
- Accept `companyProfile` prop containing `logo_url`
- Pass `logoUrl` to `InvoicePDFHeader`

Update `ViewInvoiceDialog.tsx` to:
- Fetch company profile to get logo_url
- Pass it to `InvoicePDF` component

**New Header Layout:**
```text
+------------------+----------------------------------+
|   [COMPANY LOGO] |  Invoice Number: MSA/MSD/031    |
|                  |  Invoice Date: 02.01.2026       |
|                  |  Terms: Custom                   |
|                  |  Due Date: 08.01.2026           |
|                  |  Place of Supply: Delhi (07)    |
+------------------+----------------------------------+
| Company Name                                        |
| Address, City, State, PIN                           |
| GSTIN: XXXXX | Phone: XXXXX | Email: xxx@xxx       |
+----------------------------------------------------+
```

### 2. Fix PDF Table Layout for Better Visibility

Update `InvoicePDFStyles.ts`:
- Increase overall font sizes (current 8px is too small)
- Adjust column widths to prevent overflow
- Use `wrap: false` on critical elements to prevent mid-row page breaks
- Ensure text doesn't get clipped

**Updated Column Widths:**
| Column | Current | Proposed |
|--------|---------|----------|
| S.No | 5% | 5% |
| Description | 30% | 35% |
| HSN/SAC | 10% | 10% |
| Qty | 8% | 8% |
| Unit | 7% | 7% |
| Rate | 12% | 12% |
| Tax | 12% | 10% |
| Amount | 16% | 13% |

**Font Size Updates:**
| Element | Current | Proposed |
|---------|---------|----------|
| Table cells | 8px | 9px |
| Headers | 8px | 10px |
| Total labels | 9px | 10px |

### 3. Add GST Rate Editing in Invoice Creation

Update `CreateInvoiceDialog.tsx`:
- Add a collapsible "GST Configuration" section
- Allow users to edit CGST, SGST, IGST rates per invoice
- Default values come from company profile but can be overridden
- Show clear inter-state vs intra-state logic
- Recalculate totals when GST rates change

**New GST Section in Create Invoice Dialog:**
```text
+----------------------------------------------------+
| GST Configuration                    [Collapse]    |
+----------------------------------------------------+
| Transaction Type: [Intra-State / Inter-State] auto |
|                                                     |
| For Intra-State:                                    |
|   CGST Rate: [__9__]%    SGST Rate: [__9__]%       |
|                                                     |
| For Inter-State:                                    |
|   IGST Rate: [__18__]%                              |
+----------------------------------------------------+
```

---

## Files to Modify

### PDF Components
```
src/components/invoice/pdf/InvoicePDFStyles.ts
  - Add logo styles
  - Increase font sizes
  - Adjust column widths
  - Fix overflow issues

src/components/invoice/pdf/InvoicePDFHeader.tsx
  - Add logo rendering with Image component
  - Restructure layout to match sample template

src/components/invoice/pdf/InvoicePDF.tsx
  - Accept logoUrl prop
  - Pass to header component

src/components/invoice/ViewInvoiceDialog.tsx
  - Fetch company profile for logo_url
  - Pass to InvoicePDF component
```

### Invoice Creation
```
src/components/invoice/CreateInvoiceDialog.tsx
  - Add GST rate input fields
  - Add collapsible section for GST configuration
  - Allow per-invoice GST rate customization
```

### Types (if needed)
```
src/types/invoice.ts
  - Add logo_url to Invoice type if needed for PDF generation
```

---

## Sample Template Matching

Based on the uploaded PDF (MSA_MSD_031.pdf), the invoice should follow this structure:

**Header Section:**
- "TAX INVOICE" title centered
- Company logo on left side
- Invoice details box on right (Invoice Number, Date, Terms, Due Date, Place of Supply)
- Company details below logo (Name, Address, GSTIN, Phone, Email, Website)

**Bill To Section:**
- Customer/Institution name and full address
- Country: India (if applicable)

**Line Items Table:**
- Description | HSN/SAC | Amount columns
- Alternating row colors for readability
- Sub Total, IGST (or CGST+SGST), Total Amount rows
- Balance Due row

**Footer Section:**
- Total In Words
- Notes section
- Account Details (Bank info)
- Terms & Conditions (numbered list)
- Authorized Signatory with signature image and company name

---

## Expected Outcome

After implementation:
1. Company logo from Settings > Invoice > Branding will appear on all generated PDFs
2. PDF values will be fully visible without clipping or overflow
3. Users can customize GST rates during invoice creation (not locked to company defaults)
4. PDF template matches the professional format shown in the sample
