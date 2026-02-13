

## Fix Rupee Symbol Rendering in Payslip PDF

### Problem
The built-in `Helvetica` font used by `@react-pdf/renderer` does not contain the Unicode Rupee glyph (`₹` / `\u20B9`). The PDF renderer substitutes it with a fallback that appears as a bold "1" before every currency value.

### Solution
Replace the Unicode Rupee symbol with the text prefix **"Rs."** in the formatter. This is universally supported by all PDF fonts and is a standard representation in Indian financial documents.

### Changes

**File: `src/components/payroll/pdf/PayslipPDF.tsx`**

Update line 66 in the `fmtIndian` function -- change:
```typescript
return (isNeg ? '-' : '') + '\u20B9' + formatted + '.' + decPart;
```
to:
```typescript
return (isNeg ? '-' : '') + 'Rs.' + formatted + '.' + decPart;
```

This single-line change fixes all currency values across the entire payslip since every amount passes through `fmt()`.
