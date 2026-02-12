

## Revamp Officer Daily Attendance Card

The current `OfficerCheckInCard` has too much content causing the Check In/Check Out buttons to overflow outside the card boundary. The fix involves a complete UI revamp with a minimal, compact design that's fully responsive.

---

### Changes to: `src/components/officer/OfficerCheckInCard.tsx`

**Current problems:**
- Institution info bar, time display, hours worked, overtime, location validation, map toggle, GPS warning, buttons, and instructions all stack vertically -- too much for the card height
- Buttons overflow on smaller screens

**New minimal design:**

1. **Compact header** -- Title "Daily Attendance" with status badge inline, remove the subtitle text

2. **Condensed info row** -- Institution name + GPS badge on a single small line (no separate card-like container)

3. **Time display** -- Keep the 2-column check-in/check-out times but use smaller text sizing

4. **Remove from default view:**
   - Hours worked bar (only show if checked in, as a small inline text, not a full-width bar)
   - Overtime bar (merge into hours display as a suffix)
   - Location validation row (fold into status badge or remove)
   - Map collapsible (remove from dashboard card entirely -- it's available on the profile page)
   - GPS "not configured" warning (simplify to a small inline note)
   - Bottom instruction text (remove entirely)

5. **Buttons** -- Use `size="default"` instead of `size="lg"`, ensure they stay inside the card with `flex-wrap` as a safety net

6. **Responsive** -- Use `overflow-hidden` on the Card, ensure all content uses `min-w-0` and `truncate` where needed

---

### Technical Details

**File:** `src/components/officer/OfficerCheckInCard.tsx` (lines 293-477)

The return JSX will be restructured to:

```text
Card (overflow-hidden)
  CardHeader (compact, pb-3)
    Row: "Daily Attendance" + StatusBadge
  CardContent (space-y-3, not space-y-4)
    Institution row (text-xs, inline)
    Time grid (2-col, smaller text)
    Hours worked (inline text if checked in, not a full bar)
    Buttons row (size="default", flex gap-2)
```

Key removals:
- Map collapsible section (lines 386-410)
- GPS not configured warning block (lines 412-421)  
- Bottom instruction paragraph (lines 465-473)
- Overtime separate display block (lines 362-370) -- merged into hours text
- Location validation row (lines 372-384) -- removed from this card

This keeps the card compact, ensures buttons never overflow, and maintains all critical functionality (check-in, check-out, time display, status).
