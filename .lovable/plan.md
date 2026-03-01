
# Make Create Invoice Dialog Full-Screen

## Problem
The current dialog uses `max-w-4xl max-h-[90vh]` which constrains it, making scrolling difficult and buttons overflowing on smaller screens. The user wants a full-screen layout for better usability.

## Solution
Convert the `DialogContent` from a centered modal to a full-screen overlay page. This gives maximum space for all sections (Bill To, Invoice Details, GST, Line Items, Totals, Notes) and eliminates scroll/overflow issues.

## Changes

### File: `src/components/invoice/CreateInvoiceDialog.tsx`
- Change `DialogContent` classes from `max-w-4xl max-h-[90vh]` to full-screen: `w-screen h-screen max-w-none m-0 rounded-none translate-x-0 translate-y-0 top-0 left-0`
- Remove the `translate-x-[-50%] translate-y-[-50%]` centering (override with `inset-0`)
- Keep the same internal structure: sticky header, scrollable body, sticky footer with buttons
- The `ScrollArea` will now use the full viewport height minus header and footer
- Footer buttons (Cancel / Create Invoice) remain pinned at bottom with `border-t`

### Technical Detail
```text
DialogContent className changes:
FROM: "max-w-4xl max-h-[90vh] flex flex-col"
TO:   "!max-w-none !w-full !h-full !translate-x-0 !translate-y-0 !top-0 !left-0 !rounded-none flex flex-col"
```

The inner content area will use `max-w-4xl mx-auto` to keep the form at a readable width while the background fills the screen. This gives proper scrolling across the entire page.

No database changes required. Only one file modified.
