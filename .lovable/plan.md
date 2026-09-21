# Stream large course PDFs reliably

## Changes
- Replace full-file Blob downloads with fresh signed URLs passed directly to the canvas PDF viewer, allowing large files to stream in byte ranges.
- Keep PDF controls, disabled right-click, and print/save shortcut protection intact.
- Standardize every course PDF entry point so students, trainers, and course previews use the same viewer for both stored paths and older full URLs.
- Improve errors and retry behavior so retries obtain a new signed link rather than reusing an expired one.

## Verification
- Inventory every PDF record and match it to its stored object.
- Open each stored course PDF through the real in-app viewer and confirm pages render, including the 10–20 MB files.
- Check the current build and browser console for loading, range-request, and rendering errors.

## Technical details
- `react-pdf`/PDF.js will receive a signed URL rather than an in-memory object URL.
- The storage helper will continue normalizing legacy URLs to their current object paths before generating fresh links.
