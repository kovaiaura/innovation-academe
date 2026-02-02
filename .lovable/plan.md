
# Plan: Fix Manual Assessment Statistics Not Appearing in Management Dashboard

## Problem Analysis

After editing manual assessments, the pass rate, attempt count, and average score show **0%** in the Management Dashboard Assessment list and Analytics page, but correctly display when clicking "View" on individual assessments.

### Root Cause

Manual assessment student attempts are saved with status `'evaluated'` or `'absent'`:
```typescript
status: attempt.is_absent ? 'absent' : 'evaluated'
```

However, the **Assessment List** and **Analytics** pages only filter for these statuses:
```typescript
.in('status', ['completed', 'submitted', 'auto_submitted'])
```

The **View Dialog** correctly includes `'evaluated'`:
```typescript  
.in('status', ['completed', 'submitted', 'auto_submitted', 'evaluated'])
```

This mismatch means manual assessment attempts are excluded from the dashboard statistics.

---

## Solution

Add `'evaluated'` to the status filters in both the Assessment List and Analytics pages to include manual assessment attempts in statistics calculations.

---

## Files to Modify

### 1. `src/pages/management/Assessments.tsx`

**Line 80-81 (Current):**
```typescript
.in('status', ['completed', 'submitted', 'auto_submitted']);
```

**Updated:**
```typescript
.in('status', ['completed', 'submitted', 'auto_submitted', 'evaluated']);
```

---

### 2. `src/pages/management/Analytics.tsx`

**Line 88 (Current):**
```typescript
.in('status', ['completed', 'submitted', 'auto_submitted']);
```

**Updated:**
```typescript
.in('status', ['completed', 'submitted', 'auto_submitted', 'evaluated']);
```

---

## Summary

| File | Line | Change |
|------|------|--------|
| `src/pages/management/Assessments.tsx` | 81 | Add `'evaluated'` to status filter |
| `src/pages/management/Analytics.tsx` | 88 | Add `'evaluated'` to status filter |

---

## Expected Results After Fix

| Dashboard | Metric | Before | After |
|-----------|--------|--------|-------|
| Assessment List | Attempts | 0 | Count of manual + online attempts |
| Assessment List | Pass Rate | 0% | Accurate pass rate including manual |
| Assessment List | Avg Score | 0.0% | Accurate average including manual |
| Analytics | Avg Pass Rate | 0.0% | Combined pass rate |
| Analytics | Avg Score | 0.0% | Combined average score |
| Analytics | Performance Trends | Empty | Includes manual assessment data |
| Analytics | Score Distribution | Empty | Includes manual assessment grades |
