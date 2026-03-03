

# Fix: Add Missing `leave_duration` Column to `leave_applications` Table

## Problem
The error "Could not find the 'leave_duration' column of 'leave_applications' in the schema cache" occurs because the code writes/reads `leave_duration` but the column doesn't exist in the database.

## Solution
Add the `leave_duration` column to the `leave_applications` table via a migration.

**Migration SQL:**
```sql
ALTER TABLE public.leave_applications 
ADD COLUMN leave_duration text NOT NULL DEFAULT 'full_day';
```

This single migration fixes the issue. No code changes needed — the code already correctly uses `leave_duration` everywhere (service layer, officer leave page, system admin leave page, leave records).

