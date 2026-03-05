

# Fix: 1000-Row Limit Truncating Student Data + Add Serial Numbers

## Problem

The database has a default limit of 1000 rows per query. Your institution has 1108 students, so:

- **Institution overview shows 1000** instead of 1108 (the student list fetch is capped)
- **Class cards show wrong counts** (e.g., Semester 04 shows 389 instead of 494) because the count query fetches all students for the institution (capped at 1000) and then counts per class client-side — some classes get shortchanged
- **Clicking into a class works** because that query filters by `class_id` which returns <1000 rows

The institution overview stats card already uses `{ count: 'exact', head: true }` which bypasses the limit — that part is fine. The problem is in two hooks.

## Changes

### File 1: `src/hooks/useClasses.ts` (lines 104-107)

**Problem**: `select('class_id').eq('institution_id', institutionId)` fetches max 1000 rows, then counts client-side.

**Fix**: Replace with individual `count` queries per class (classes are few, ~6). For each class, use `select('*', { count: 'exact', head: true }).eq('class_id', classId)` — no row limit, returns exact count.

```typescript
// For each class, get exact count
const countsPromises = (classData || []).map(cls =>
  supabase.from('students')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', cls.id)
);
const countsResults = await Promise.all(countsPromises);

const result = (classData || []).map((cls, i) => ({
  ...cls,
  student_count: countsResults[i].count || 0
}));
```

### File 2: `src/hooks/useStudents.ts` (lines 78-88)

**Problem**: `select('*').eq('institution_id', institutionId)` returns max 1000 rows.

**Fix**: When fetching by `classId` (which is the common case for class detail pages), the query already filters and likely stays under 1000 — no change needed there.

For institution-wide fetches (no classId), implement paginated fetching using `.range()`:

```typescript
// Paginated fetch for institution-level queries
if (!classId) {
  const allStudents: DbStudent[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('institution_id', institutionId)
      .order('student_name', { ascending: true })
      .range(offset, offset + batchSize - 1);
    
    if (error) throw error;
    allStudents.push(...(data || []));
    hasMore = (data?.length || 0) === batchSize;
    offset += batchSize;
  }
  return allStudents;
}
```

### File 3: `src/components/institution/ClassStudentsTab.tsx` (lines 117-128)

**Add serial number column** to the students table:

```tsx
<TableHead className="w-12">S.No</TableHead>
<TableHead>Student</TableHead>
...

{filteredStudents.map((student, index) => (
  <TableRow key={student.id}>
    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
    ...
```

## Summary

| File | Change |
|------|--------|
| `src/hooks/useClasses.ts` | Use per-class exact count queries instead of fetching all student rows |
| `src/hooks/useStudents.ts` | Paginated fetch for institution-wide student queries |
| `src/components/institution/ClassStudentsTab.tsx` | Add S.No serial number column |

