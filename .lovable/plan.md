
# Plan: Fix Duplicate Section Display in Assessment Publishing

## Problem Analysis

In the "Publishing" step (Step 4) of assessment creation, class names are displaying with duplicate section information:
- "Grade 3A A" instead of "Grade 3A"
- "Grade 4A A" instead of "Grade 4A"
- "Grade 9 A" instead of "Grade 9"

The issue occurs in `PublishingSelector.tsx` at lines 159 and 331 where the code unconditionally appends the section to the class name when a section exists:
```typescript
{classItem.section ? `${classItem.class_name} ${classItem.section}` : classItem.class_name}
```

The database has ALL classes with `section = 'A'`, but some class names already include the section identifier (e.g., "Grade 3A", "Grade 4A"). This results in redundant display like "Grade 3A A".

---

## Solution

Update the display logic to only append the section if the class name doesn't already end with that section identifier.

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/assessment/PublishingSelector.tsx` | Add helper function and update display logic at lines 159 and 331 |

---

## Implementation Details

### 1. Add Helper Function

Create a helper function to intelligently format class names:

```typescript
// Helper function to format class name with section, avoiding duplicates
const formatClassName = (className: string, section: string | null): string => {
  if (!section) return className;
  
  // Check if class name already ends with the section (case insensitive)
  const upperClassName = className.toUpperCase();
  const upperSection = section.toUpperCase();
  
  // Check if class name ends with the section (e.g., "Grade 3A" ends with "A")
  if (upperClassName.endsWith(upperSection)) {
    return className; // Don't append section, it's already in the name
  }
  
  return `${className} ${section}`;
};
```

### 2. Update Display Logic

Replace the current inline conditional at two locations:

**Line 159** (in `updatePublishing` function):
```typescript
// Before:
class_names: selectedClasses.map((c) => 
  c.section ? `${c.class_name} ${c.section}` : c.class_name
)

// After:
class_names: selectedClasses.map((c) => formatClassName(c.class_name, c.section))
```

**Line 331** (in the checkbox label):
```typescript
// Before:
{classItem.section ? `${classItem.class_name} ${classItem.section}` : classItem.class_name}

// After:
{formatClassName(classItem.class_name, classItem.section)}
```

---

## Expected Results

After the fix:
- "Grade 9" with section "A" → "Grade 9 A" (section appended)
- "Grade 3A" with section "A" → "Grade 3A" (no duplication)
- "Grade 4B" with section "B" → "Grade 4B" (no duplication)
- "Grade 5" with section "B" → "Grade 5 B" (section appended)

---

## Summary

This is a simple UI display fix that requires:
1. Adding a helper function to `PublishingSelector.tsx`
2. Updating 2 locations where class names are formatted

The fix ensures class names are displayed correctly without duplicate section information.
