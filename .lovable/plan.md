

# Fix: Half-Day Leave "invalid input syntax for type integer: 0.5"

## Problem
The `total_days`, `lop_days`, and `paid_days` columns in `leave_applications` are `integer` type, but half-day leaves send `0.5`, causing a Postgres error.

## Solution
Single database migration to change all three columns from `integer` to `numeric`:

```sql
ALTER TABLE public.leave_applications 
  ALTER COLUMN total_days TYPE numeric USING total_days::numeric,
  ALTER COLUMN lop_days TYPE numeric USING lop_days::numeric,
  ALTER COLUMN paid_days TYPE numeric USING paid_days::numeric;
```

No frontend code changes needed — the code already correctly calculates 0.5 for half-day leaves.

| Action | File |
|--------|------|
| Create | Migration SQL (alter column types) |

