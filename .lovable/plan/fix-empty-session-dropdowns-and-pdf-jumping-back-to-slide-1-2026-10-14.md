# Fix empty session dropdowns and PDF jumping back to slide 1

## 1. Sessions showing no content when expanded
The sidebar treats a session as open unless it is explicitly locked, but the content loader only fetches content for sessions explicitly marked unlocked. Sessions with an unset lock value (like "Battery, Bulb & Switch – Introduction") appear open yet have no content loaded, so the dropdown is empty.

- Use the same rule in both places: load content for every session that is not explicitly locked.
- Show a small "No content in this session yet" line when a session truly has no content, instead of an empty dropdown.

## 2. PDF returning to slide 1 when moving to slide 2
The viewer hands the PDF to the renderer as a new object on every screen update. Clicking "next" triggers an update, the renderer thinks it is a brand-new document, reloads it, and resets to page 1.

- Keep the PDF source stable so page changes don't reload the document.
- Only reset to page 1 when a different PDF is opened.
- Keep zoom, fullscreen, right-click and print protections unchanged.

## Verification
- Check the build, then open a multi-page course PDF and confirm next/previous pages load and stay put.
- Confirm the Battery, Bulb & Switch session lists its content.

## Technical details
- `useClassCourseAssignments.ts` (~line 481): filter `is_unlocked !== false` instead of `=== true`.
- `PDFViewer.tsx`: memoize `file` with `useMemo(() => ({ url: pdfUrl }), [pdfUrl])` instead of the inline `{ url: pdfUrl }`.
- `LMSCourseViewer.tsx`: empty-state row when `contentItems.length === 0`.
