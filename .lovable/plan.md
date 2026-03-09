

# Plan: Add File Replace/Update Capability to Course Content Editor

## Problem
The Edit Course dialog's Content tab lets the CEO edit title, type, and YouTube URL, but there's no way to **replace the actual PDF/PPT file** for existing content items. The CEO needs to swap out files without affecting student progress.

## Why Progress Is Safe
Student completions are tracked by `content_id` (primary key) in the `student_content_completions` table. Updating `file_path` or `youtube_url` on an existing content row keeps the same `content_id`, so all completion records remain intact.

## Changes

### 1. `src/components/course/EditCourseDialog.tsx` — Content Tab Enhancement
In the Content tab's content item cards, add:
- **File replace button** (for PDF/PPT types): A small "Replace File" button with a hidden file input. When a file is selected, upload it via `uploadCourseContent()`, then update the content record's `file_path` and `file_size_mb` using `handleUpdateContent`.
- **Current file indicator**: Show the current file name (extracted from `file_path`) so the CEO knows what's uploaded.
- **Delete confirmation**: Wrap the existing delete button in an AlertDialog to prevent accidental deletion.

### 2. No database or backend changes needed
- `useUpdateContent` already supports updating `file_path` and `file_size_mb`.
- `useDeleteContent` already handles storage file cleanup.
- `uploadCourseContent` from `courseStorage.service.ts` handles file uploads.
- The content record's `id` stays the same, preserving all progress.

| File | Change |
|------|--------|
| `src/components/course/EditCourseDialog.tsx` | Add file replace upload button for PDF/PPT content, show current file name, add delete confirmation dialog |

