# Schema Export Guide - Lovable Cloud to External Database

## Overview
This guide provides a professional, error-free method to migrate the Meta-INNOVA LMS schema from Lovable Cloud to any external PostgreSQL database using `pg_dump`.

## Prerequisites

1. **PostgreSQL Client Tools** installed locally (includes `pg_dump` and `psql`)
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt install postgresql-client`

2. **Database Password** from Lovable Cloud
   - Go to Lovable → Settings → Backend → Database Settings
   - Copy the database password

## Connection Details

| Parameter | Value |
|-----------|-------|
| Host | `db.ftadmxcxzhptngqbbqpk.supabase.co` |
| Port | `5432` |
| Database | `postgres` |
| User | `postgres` |
| Schema | `public` |

---

## Step 1: Export Schema from Lovable Cloud

### Option A: Full Schema Export (Recommended)

```bash
# Set password as environment variable (more secure)
export PGPASSWORD='your_database_password_here'

# Export schema only (no data)
pg_dump \
  --host=db.ftadmxcxzhptngqbbqpk.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema=public \
  --schema-only \
  --no-owner \
  --no-privileges \
  --no-comments \
  --file=lovable_schema_export.sql

# Clear password from environment
unset PGPASSWORD
```

### Option B: Windows Command Prompt

```cmd
set PGPASSWORD=your_database_password_here

pg_dump ^
  --host=db.ftadmxcxzhptngqbbqpk.supabase.co ^
  --port=5432 ^
  --username=postgres ^
  --dbname=postgres ^
  --schema=public ^
  --schema-only ^
  --no-owner ^
  --no-privileges ^
  --file=lovable_schema_export.sql

set PGPASSWORD=
```

### Option C: With Data (Full Backup)

```bash
export PGPASSWORD='your_database_password_here'

pg_dump \
  --host=db.ftadmxcxzhptngqbbqpk.supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema=public \
  --no-owner \
  --no-privileges \
  --file=lovable_full_backup.sql

unset PGPASSWORD
```

---

## Step 2: Clean the Export (Optional)

The exported SQL may contain references that need adjustment. Run the cleanup script:

```bash
# Using the cleanup script
psql -f migration/cleanup_pgdump.sql
```

Or manually remove these sections from the export:
- Any `auth.` schema references
- Any `storage.` schema references
- Any `supabase_functions.` references
- Extension creation statements (target DB should have these)

---

## Step 3: Import to Target Database

### Option A: Fresh Database (Drop existing tables first)

```bash
export PGPASSWORD='target_database_password'

# First, drop existing public schema and recreate
psql \
  --host=TARGET_HOST \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

# Then import the schema
psql \
  --host=TARGET_HOST \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=lovable_schema_export.sql

unset PGPASSWORD
```

### Option B: Existing Database (Merge - Be Careful)

```bash
export PGPASSWORD='target_database_password'

psql \
  --host=TARGET_HOST \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=lovable_schema_export.sql

unset PGPASSWORD
```

---

## Step 4: Verify Migration

Run the verification script on the target database:

```bash
psql \
  --host=TARGET_HOST \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --file=migration/verify_schema.sql
```

Expected results:
- **103 tables** in public schema
- All enums present (`app_role`)
- All sequences present
- All foreign keys intact

---

## Troubleshooting

### Error: "relation already exists"
The target database already has some tables. Either:
1. Drop the schema first (Step 3, Option A)
2. Add `IF NOT EXISTS` to CREATE statements

### Error: "permission denied"
Ensure you're using the `postgres` superuser account.

### Error: "could not connect to server"
1. Check if the host allows your IP address
2. Verify SSL mode (try adding `--sslmode=require`)

### Error: "password authentication failed"
1. Double-check the password
2. Ensure no extra spaces in the password

---

## Alternative: Export Individual Components

### Tables Only
```bash
pg_dump --schema=public --schema-only --section=pre-data --file=tables.sql ...
```

### Indexes and Constraints Only
```bash
pg_dump --schema=public --schema-only --section=post-data --file=constraints.sql ...
```

### Functions Only
```bash
pg_dump --schema=public --schema-only --section=pre-data \
  --exclude-table='*' --file=functions.sql ...
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Schema only | `pg_dump --schema-only` |
| Data only | `pg_dump --data-only` |
| Specific table | `pg_dump --table=tablename` |
| Exclude table | `pg_dump --exclude-table=tablename` |
| Compressed | `pg_dump --format=custom` |
| Parallel export | `pg_dump --jobs=4 --format=directory` |

---

## Current Schema Statistics (Lovable Cloud)

| Metric | Count |
|--------|-------|
| Tables | 103 |
| Enums | 1 (app_role) |
| Sequences | 1 (inventory_items_sl_no_seq) |
| Functions | 25+ |
| Storage Buckets | 16 |

---

## Support

If you encounter issues:
1. Run `migration/verify_schema.sql` on both source and target
2. Compare the output to identify discrepancies
3. Use `pg_dump --verbose` for detailed logging
