

# Plan: Preserve Sidebar Scroll Position on Navigation

## Problem
When navigating to a menu item near the bottom of the sidebar, the page loads correctly but the sidebar's `ScrollArea` resets its scroll position to the top. This forces users to scroll down again to find where they were.

## Root Cause
The sidebar uses a `<ScrollArea>` component (line 497 of `Sidebar.tsx`). On every route change, React re-renders the sidebar and the ScrollArea resets to the top.

## Solution
Store the sidebar scroll position in a `ref` and restore it after navigation. Specifically:

### Changes to `src/components/layout/Sidebar.tsx`
1. Add a `ref` to capture the scrollable viewport inside `ScrollArea`.
2. On the scroll event, save the current `scrollTop` to a module-level variable (persists across re-renders without triggering them).
3. After route changes (detected via `useLocation`), restore the saved `scrollTop` in a `useEffect` with a small `requestAnimationFrame` delay to ensure the DOM has updated.

The key code pattern:
```typescript
const scrollRef = useRef<HTMLDivElement>(null);
const savedScrollTop = useRef(0);

// Save scroll position on scroll
const handleScroll = (e: Event) => {
  savedScrollTop.current = (e.target as HTMLDivElement).scrollTop;
};

// Restore after route change
useEffect(() => {
  requestAnimationFrame(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = savedScrollTop.current;
    }
  });
}, [location.pathname]);
```

The `ScrollArea` viewport ref is accessed via `<ScrollArea><div ref={scrollRef}>` — we'll attach the ref to the ScrollArea's viewport using the component's built-in ref forwarding or by wrapping the content div.

### Files Modified
- `src/components/layout/Sidebar.tsx` — add scroll position persistence logic

