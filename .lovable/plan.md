

# Fix Edit Course Dialog UI

## Problems (from screenshot)
- Dialog too narrow for the 3-panel Content tab (Levels | Sessions | Content) — everything is cramped
- Fixed `h-[500px]` on inner grids wastes available vertical space
- Level/session lists overflow without proper scroll containers
- Content items (title + type + file info) are squeezed in the remaining 2 columns

## Changes — `src/components/course/EditCourseDialog.tsx`

### 1. Make dialog wider and taller
- Change `max-w-5xl` → `max-w-7xl` and keep `h-[90vh]`

### 2. Content tab — better layout proportions
- Change `grid-cols-4` → use explicit `grid-template-columns` with `1fr 1.2fr 2.5fr` so the content panel gets more room
- Replace fixed `h-[500px]` with `flex-1 min-h-0` so panels fill available space dynamically
- Wrap each panel column in `ScrollArea` for proper overflow handling

### 3. Sessions tab — same treatment
- Change `grid-cols-3` fixed height to flexible height
- Wrap level list in `ScrollArea`

### 4. Content item cards — cleaner layout
- Stack title and type vertically instead of cramming into `grid-cols-2` when space is tight
- Give file indicator its own row with full width

| Area | Change |
|------|--------|
| DialogContent | `max-w-5xl` → `max-w-7xl` |
| Sessions tab grid | Remove fixed `h-[500px]`, use flex layout |
| Content tab grid | Better column ratios, flex height, ScrollArea per panel |
| Content cards | Cleaner field arrangement |

