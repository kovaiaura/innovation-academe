

# Plan: Fix Repair Failing for All Students

## Problem Analysis
The repair process is failing for all students (100/494 processed, 0 linked, 100 failed). This is a **systematic failure**, not random timeouts.

Two likely root causes:
1. **Auth Admin API rate limiting**: The edge function fires 50 sequential `auth.admin.createUser` calls with no delay. Supabase's GoTrue admin API enforces rate limits, causing 429 errors that cascade as failures.
2. **Edge function timeout**: 50 sequential auth operations (each ~300-500ms) can exceed the edge function's CPU time limit (2 seconds on free tier), causing the function to die mid-execution. The frontend then gets no valid response, and the catch block marks the entire batch as failed.

## Fix

### 1. Reduce batch size and add inter-operation delay
**File: `supabase/functions/create-student-users-batch/index.ts`**
- Add a 300ms delay between each student's auth operation to avoid rate limiting
- Reduce max batch size from 100 to 25

### 2. Reduce frontend batch size and add inter-batch delay  
**File: `src/services/credentialService.ts`**
- Reduce batch size from 50 to 20 (to keep edge function within CPU/wall-clock limits)
- Add a 1-second delay between batch invocations to avoid overwhelming the backend

### 3. Add error logging for debugging
**File: `supabase/functions/create-student-users-batch/index.ts`**
- Log the specific error for each student failure so we can diagnose if the issue persists

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/create-student-users-batch/index.ts` | Add 300ms delay between students, reduce max to 25, add error logging |
| `src/services/credentialService.ts` | Reduce batch to 20, add 1s delay between batches |

