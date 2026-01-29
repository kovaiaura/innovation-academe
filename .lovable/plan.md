
# Plan: Fix Course Assignment Counts and SDG Tracking

## Problem Summary

When courses are assigned to institution classes, the counts and SDG metrics are not reflected correctly across dashboards because:

1. **Class Detail Page** uses mock data (`getCourseAssignmentsByClass`) instead of querying the database
2. **Institution Stats** queries `course_institution_assignments` instead of `course_class_assignments`
3. **SDG Dashboard** (Management) only tracks SDGs from projects, ignoring course SDGs
4. Same course assigned to multiple classes should be counted as **1 unique course** (not per-class-assignment)

---

## Solution Overview

### Database Query Logic Change

**Current Logic (Incorrect)**:
- `course_institution_assignments` table → counts courses "available" to institution
- Mock data for class-level course display

**New Logic (Correct)**:
- `course_class_assignments` table → counts **unique** courses actually assigned to classes
- Database-backed queries replacing mock data

---

## Files to Modify

### 1. `src/hooks/useInstitutionStats.ts`

**Current** (Line 151-152):
```typescript
supabase.from('course_institution_assignments')
  .select('*', { count: 'exact', head: true })
  .eq('institution_id', institutionId)
```

**Updated**: Query `course_class_assignments` and count **distinct** `course_id` values:
```typescript
// Get unique course IDs assigned to any class in this institution
supabase.from('course_class_assignments')
  .select('course_id')
  .eq('institution_id', institutionId)
```
Then use `new Set(data.map(d => d.course_id)).size` for unique count.

---

### 2. `src/pages/system-admin/ClassDetail.tsx`

**Current** (Lines 12, 39-44):
```typescript
import { getCourseAssignmentsByClass } from '@/data/mockClassCourseAssignments';
// ...
useState(() => {
  if (classId) {
    setCourseAssignments(getCourseAssignmentsByClass(classId));
  }
});
```

**Updated**: Use the existing `useClassCourseAssignments` hook from database:
```typescript
import { useClassCourseAssignments } from '@/hooks/useClassCourseAssignments';
// ...
const { data: dbCourseAssignments = [] } = useClassCourseAssignments(classId);
```

Pass `dbCourseAssignments.length` to `ClassOverviewTab`.

---

### 3. `src/pages/super-admin/CEOAnalyticsDashboard.tsx`

**Current** (Line 177):
```typescript
supabase.from('course_institution_assignments')
  .select('id', { count: 'exact', head: true })
  .eq('institution_id', inst.id)
```

**Updated**: Query unique courses from `course_class_assignments`:
```typescript
supabase.from('course_class_assignments')
  .select('course_id')
  .eq('institution_id', inst.id)
```
Then count unique `course_id` values.

---

### 4. `src/pages/management/SDGDashboard.tsx`

**Current**: Only loads SDG data from `projects` table.

**Updated**: Add course SDG tracking:
```typescript
// Get SDGs from courses assigned to this institution's classes
const { data: courseAssignments } = await supabase
  .from('course_class_assignments')
  .select('course_id, courses(id, title, sdg_goals)')
  .eq('institution_id', user.tenant_id);

// Extract unique course SDGs
const uniqueCourseIds = new Set<string>();
const courseSDGCounts: Record<number, number> = {};
courseAssignments?.forEach(ca => {
  if (!uniqueCourseIds.has(ca.course_id)) {
    uniqueCourseIds.add(ca.course_id);
    const goals = ca.courses?.sdg_goals as number[] | null;
    goals?.forEach(g => {
      courseSDGCounts[g] = (courseSDGCounts[g] || 0) + 1;
    });
  }
});
```

Update UI to show:
- **Active SDGs**: Combined from both projects AND courses
- **SDG Courses**: Count of unique courses with SDG mappings
- Chart includes course SDG distribution

---

### 5. `src/services/sdg.service.ts`

Update `getInstitutionContributions()` to:
- Query `course_class_assignments` instead of `course_institution_assignments`
- Count unique `course_id` values per institution
- Merge course SDGs with project SDGs for accurate contribution score

---

## Key Counting Logic

### Unique Course Count (Per Institution)
```sql
SELECT COUNT(DISTINCT course_id) 
FROM course_class_assignments 
WHERE institution_id = ?
```

### Class-Level Course Count
```sql
SELECT COUNT(*) 
FROM course_class_assignments 
WHERE class_id = ?
```

### SDG Aggregation
```sql
SELECT DISTINCT c.sdg_goals
FROM course_class_assignments cca
JOIN courses c ON cca.course_id = c.id
WHERE cca.institution_id = ?
```
Flatten arrays and count unique SDG numbers.

---

## Summary of Changes

| File | Change Description |
|------|-------------------|
| `src/hooks/useInstitutionStats.ts` | Query `course_class_assignments` for unique course count |
| `src/pages/system-admin/ClassDetail.tsx` | Replace mock data with `useClassCourseAssignments` hook |
| `src/pages/super-admin/CEOAnalyticsDashboard.tsx` | Query unique courses from `course_class_assignments` |
| `src/pages/management/SDGDashboard.tsx` | Add course SDG tracking alongside projects |
| `src/services/sdg.service.ts` | Update contribution calculation with class-assigned courses |

---

## Expected Results After Fix

| Dashboard | Metric | Before | After |
|-----------|--------|--------|-------|
| Class Detail (CEO) | Active Courses | 0 (mock) | Actual count from DB |
| Management Dashboard | Courses Assigned | 0 | Unique courses across all classes |
| SDG Dashboard (Management) | Active SDGs | Projects only | Projects + Courses |
| CEO Analytics | Total Courses | 0 | Unique courses per institution |

---

## Notes

- Same course assigned to multiple classes = **counted once** at institution level
- Each class still shows its own assignment count (can be same course)
- SDGs are aggregated from both **projects** and **courses** for complete picture
- Existing `useClassCourseAssignments` hook already fetches from database correctly
