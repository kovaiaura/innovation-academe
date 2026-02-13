

## Fix Currency Formatting in Payslip PDF

### Problem
`Number.toLocaleString('en-IN', ...)` does not work correctly inside `@react-pdf/renderer` because it runs in a worker/limited JS environment without full locale support. This causes:
- A stray "1" appearing before values
- No rupee symbol displayed
- Incorrect number formatting

### Solution
Replace the `fmt()` function on line 49 of `PayslipPDF.tsx` with a manual Indian number formatting function that:
- Prepends the rupee symbol
- Formats numbers in the Indian numbering system (e.g., 1,23,456.78)
- Does not rely on `toLocaleString`

### Implementation

**File: `src/components/payroll/pdf/PayslipPDF.tsx`**

Replace line 49:
```typescript
const fmt = (n: number) => `₹${safe(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
```

With a manual formatter:
```typescript
const fmtIndian = (n: number): string => {
  const val = safe(n).toFixed(2);
  const [intPart, decPart] = val.split('.');
  const isNeg = intPart.startsWith('-');
  const digits = isNeg ? intPart.slice(1) : intPart;
  let formatted = '';
  if (digits.length <= 3) {
    formatted = digits;
  } else {
    formatted = digits.slice(-3);
    let remaining = digits.slice(0, -3);
    while (remaining.length > 2) {
      formatted = remaining.slice(-2) + ',' + formatted;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) formatted = remaining + ',' + formatted;
  }
  return (isNeg ? '-' : '') + '\u20B9' + formatted + '.' + decPart;
};
const fmt = fmtIndian;
```

This single change fixes all currency displays throughout the PDF since every value goes through `fmt()`.

