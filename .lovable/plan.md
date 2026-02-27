
# Fix Ask Metova: Remove Default API Key, Add Per-Institution Performance Metrics

## Problem Summary

1. **The "Default API Key" (OPENAI_API_KEY) is exhausted** -- it returns a 429 quota error. The user wants to remove the default option entirely and only allow a real custom API key.
2. **Missing per-institution performance metrics** for CEO -- the context fetcher provides raw counts but lacks computed KPIs like pass rate per institution, attendance rate per institution, course completion rate, etc.
3. **Officer context is not scoped** to their institution -- fetches all data globally.

## Changes

### 1. Remove Default API Key Option, Require Custom API Key

**File: `src/components/settings/AISettingsTab.tsx`**
- Remove the "Use Default API Key" radio option entirely
- Show only the API key input field (always visible, no radio toggle)
- Update description to say "Enter your OpenAI API key to power the AI assistant"
- If no custom key is saved, show a warning that AI won't work until a key is provided

**File: `supabase/functions/ask-metova/index.ts`**
- Remove the `defaultOpenAIApiKey` constant (line 5: `Deno.env.get('OPENAI_API_KEY')`)
- Use only `aiSettings.custom_api_key` -- if empty, return a clear error: "No API key configured. Please add your OpenAI API key in Settings."
- Remove the fallback logic on line 1918

### 2. Add Per-Institution Performance Metrics for CEO (System Admin)

**File: `supabase/functions/ask-metova/index.ts`**

Add a new `fetchPerInstitutionMetrics()` function that computes for each institution:
- **Assessment Pass Rate**: from `assessment_attempts` grouped by `institution_id`
- **Average Assessment Score**: average percentage per institution
- **Attendance Rate**: from `class_session_attendance` grouped by `institution_id`
- **Student Count**: active students per institution
- **Project Status**: in-progress vs completed per institution
- **XP Engagement**: total XP earned per institution

Add a new `fetchTrainerPerformance()` function:
- Join officers with their assigned institutions
- For each officer, compute: their students' avg assessment score, pass rate
- Identify top/bottom performing trainers

Add **"At-Risk Institutions"** section:
- Institutions with pass rate below 50% or attendance rate below 70%

Wire these into `fetchSystemAdminContext()` alongside existing fetchers.

### 3. Scope Officer Context to Their Institution

**File: `supabase/functions/ask-metova/index.ts`**

Update `fetchOfficerContext()` to accept `institutionId` parameter:
- Filter classes, assessment attempts, attendance, projects, and assignments by `institution_id`
- Add student names to performance summaries (join with `students` table)

Update the main handler (around line 1936-1940) to resolve the officer's `institution_id` from their profile before calling `fetchOfficerContext(institutionId)`.

### 4. Enhance Management Context with Content Completion

**File: `supabase/functions/ask-metova/index.ts`**

In `fetchManagementContext()`:
- Add content completion rate: query `student_content_completions` count vs total `course_content` count
- Add student-wise performance with names (join `students` table for `student_name`)

### 5. Update System Prompts

Update `systemAdminPrompt` to mention:
- Per-institution performance comparison
- Trainer performance analysis
- At-risk institution identification

Update `officerPrompt` to mention institution-scoped data and student names.

## Technical Details

### Per-Institution Metrics (New Function)
```text
fetchPerInstitutionMetrics():
  assessment_attempts GROUP BY institution_id -> pass rate, avg score
  class_session_attendance GROUP BY institution_id -> attendance rate
  students GROUP BY institution_id -> active count
  projects GROUP BY institution_id -> status breakdown
  student_xp_transactions GROUP BY institution_id -> total XP
```

### Trainer Performance (New Function)
```text
fetchTrainerPerformance():
  officers JOIN officer_assignments -> get institution per officer
  assessment_attempts WHERE institution_id = officer's institution -> avg score, pass rate
```

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/ask-metova/index.ts` | Remove default API key, add per-institution metrics, scope officer context, enhance management context |
| `src/components/settings/AISettingsTab.tsx` | Remove "Default API Key" option, require custom key input |
