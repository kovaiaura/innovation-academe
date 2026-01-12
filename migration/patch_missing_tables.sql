-- ============================================
-- Patch: Missing Tables from 02_schema_exact.sql
-- Run this BEFORE 05_rls_policies.sql
-- ============================================

-- task_comments (6 columns) - Missing from original schema
CREATE TABLE IF NOT EXISTS public.task_comments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL,
    user_id uuid,
    user_name text NOT NULL,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT task_comments_pkey PRIMARY KEY (id)
);

-- Add foreign key
ALTER TABLE public.task_comments 
ADD CONSTRAINT task_comments_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Add index for query performance
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id 
ON public.task_comments USING btree (task_id);

-- ============================================
-- Verification query (run separately to confirm)
-- ============================================
-- SELECT table_name, column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'task_comments' 
-- ORDER BY ordinal_position;
