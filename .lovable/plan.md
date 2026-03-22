

# Add Session Reorder (Drag & Drop) in Course Detail

## What You'll Get
Up/down arrow buttons next to each session within a level, allowing you to rearrange session order. The new order is saved to the database immediately.

## Technical Approach

### File: `src/pages/system-admin/CourseDetail.tsx`
- Add **Move Up / Move Down** arrow buttons next to each session's edit/delete buttons
- When clicked, swap the `display_order` of the target session with its neighbor
- Use the existing `useUpdateSession` hook to persist both swapped sessions' `display_order` values
- Disable "Move Up" on the first session and "Move Down" on the last session in each module

### File: `src/hooks/useCourses.ts`
- Add a new `useReorderSessions` mutation that accepts an array of `{ id, display_order }` pairs and batch-updates them in a single call (using multiple `.update()` calls or a small RPC)
- Alternatively, reuse `useUpdateSession` twice in sequence — simpler, slightly less atomic

### UI Detail
Each session card's header will gain two small icon buttons (ChevronUp / ChevronDown) placed before the Edit and Delete buttons. Clicking triggers an immediate swap of `display_order` with the adjacent session and invalidates the course query to reflect the new order.

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/system-admin/CourseDetail.tsx` | Add up/down reorder buttons per session, implement swap handler |
| `src/hooks/useCourses.ts` | Add `useReorderSessions` batch mutation |

