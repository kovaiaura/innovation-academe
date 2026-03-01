

# Fix: "Cannot read properties of undefined (reading 'filter')" Crash

## Root Cause

`useGlobalInvoiceSummary()` returns `allInvoices` and `allPayments` which are `undefined` before data finishes loading. The code in `InvoiceManagement.tsx` calls `.filter()` on these values without guarding against `undefined`, which crashes the app.

## Fix

**File: `src/pages/system-admin/InvoiceManagement.tsx`**

Add default empty arrays when destructuring from the hook:

```typescript
const { allInvoices = [], allPayments = [], loading, refetch } = useGlobalInvoiceSummary();
```

This single change ensures `filteredInvoices` and `filteredPayments` computations never crash, and `GlobalSummaryCards` always receives valid arrays.

**File: `src/components/invoice/GlobalSummaryCards.tsx`** (defensive guard)

Add fallback defaults in the component as well for safety:

```typescript
const safeInvoices = invoices || [];
const safePayments = payments || [];
```

Use these in the `useMemo` instead of the raw props. This prevents future crashes if the component is used elsewhere without guaranteed arrays.

## Files to Modify
- `src/pages/system-admin/InvoiceManagement.tsx` (line 34 -- add defaults)
- `src/components/invoice/GlobalSummaryCards.tsx` (lines 14-15 -- add defensive guards)

