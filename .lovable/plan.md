

# Fix: Question Analysis "Correct %" Always 0%

## Root Cause
In `assessment.service.ts`, `getAssessmentAttempts()` does NOT fetch `assessment_answers` from the database. It calls `transformAttempt(a)` which defaults `answers` to an empty array `[]`. The analytics component at line 346-348 tries to compute correct % from `attempt.answers`, but they're always empty.

## Fix

**File: `src/services/assessment.service.ts` — `getAssessmentAttempts` method (line ~809-829)**

Update the select query to also fetch `assessment_answers`:

```sql
select('*, profiles:student_id(id, name), institutions:institution_id(id, name), classes:class_id(id, class_name), assessment_answers(*)')
```

Then pass the answers into `transformAttempt`:

```typescript
return attempts.map(a => {
  const answers = (a.assessment_answers || []).map(ans => ({
    question_id: ans.question_id,
    selected_option_id: ans.selected_option_id,
    is_correct: ans.is_correct,
    points_earned: ans.points_earned || 0,
    time_spent_seconds: ans.time_spent_seconds || 0,
  }));
  return transformAttempt(a as unknown as DbAttempt, answers);
});
```

This single change makes the existing analytics UI code work correctly — it already computes correct % from `completedAttempts.flatMap(a => a.answers)`.

## Files

| File | Change |
|------|--------|
| `src/services/assessment.service.ts` | Include `assessment_answers(*)` in select + pass to transform |

Single file, ~5-line change.

