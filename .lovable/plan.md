

# Fix Ask Metova AI Feature - Complete Overhaul

## Problems Identified

1. **AI is disabled in the database** - The `ask_metova_settings` has `enabled: false`, causing a 503 error for all users
2. **No management role support** - Management users have no Ask Metova page, no route, and no backend context fetcher
3. **Student context lacks SWOT/improvement analysis** - No personal performance breakdown from course outcomes
4. **Officer context too basic** - Doesn't include institution-scoped student progress or assessment insights
5. **The "Default API Key" is valid** - The `OPENAI_API_KEY` secret is already configured and will work when AI is re-enabled

## Plan

### Step 1: Enable AI in database
- Update `system_configurations` to set `enabled: true` for `ask_metova_settings`

### Step 2: Add Management Role Support

**New file: `src/pages/management/AskMetova.tsx`**
- Create a management Ask Metova page (similar pattern to officer/system-admin versions)
- Quick action chips: "Student Progress", "Assessment Insights", "Project Overview", "Attendance Analysis", "SWOT Summary"

**Update `src/App.tsx`**
- Import ManagementAskMetova component
- Add route `/tenant/:tenantId/management/ask-metova` with `management` role protection

**Update `src/hooks/useAskMetova.ts`**
- Add `management` to the Role type union
- Add storage key for management conversations

### Step 3: Add Management Context Fetcher in Edge Function

**Update `supabase/functions/ask-metova/index.ts`**
- Add `fetchManagementContext()` function that fetches institution-scoped data:
  - Students in their institution with performance metrics
  - Assessment attempts and pass/fail rates for their institution
  - Assignment submissions and grading stats
  - Project progress for their institution
  - Attendance patterns
  - Course completion progress
- Add `managementPrompt` system prompt focused on:
  - Student progress monitoring
  - Assessment insights and class-wise comparisons
  - Identifying at-risk students
  - Project status and patentability insights
- Wire management role into the main handler (alongside student/officer/system_admin)

### Step 4: Enhance Student Context with SWOT Analysis

**Update `supabase/functions/ask-metova/index.ts`** (student context section)
- Fetch the student's course outcome mappings (from `assessment_questions` linked to course outcomes)
- Analyze assessment attempt answers to identify:
  - **Strengths**: Topics/course outcomes where score is above 75%
  - **Weaknesses**: Topics/course outcomes where score is below 50%
  - **Opportunities**: Available courses/sessions not yet completed
  - **Threats**: Upcoming deadlines, assessments at risk of failing
- Fetch content completion progress per module/session
- Add this SWOT data section to the student context

### Step 5: Enhance Student System Prompt

**Update student prompt** to include instructions for:
- Providing personalized SWOT analysis when asked
- Suggesting specific improvement areas based on weak course outcomes
- Recommending study focus areas based on upcoming assessments

### Step 6: Enhance Officer Context

**Update officer context fetcher** to include:
- Per-class assessment pass rates
- Student-wise performance summaries (aggregated)
- Assignment submission rates

## Technical Details

### Management Context Fetcher Structure
```text
fetchManagementContext(institutionId)
  -> Students in institution (count, active/inactive)
  -> Assessment attempts for institution students (pass rates, avg scores)
  -> Assignment submissions (completion rates, avg marks)
  -> Projects (status breakdown, achievements)
  -> Attendance (institution-level rates)
  -> Course progress (completion percentages)
```

### Student SWOT Data Structure
```text
fetchStudentContext(userId)
  -> Existing data (courses, assessments, etc.)
  -> NEW: Assessment question-level performance
    - Group by course outcome / topic
    - Calculate per-topic accuracy
  -> NEW: Content completion progress
    - Modules started vs completed
    - Sessions remaining
  -> NEW: SWOT summary section in context
```

### Files to Create
| File | Description |
|------|-------------|
| `src/pages/management/AskMetova.tsx` | Management Ask Metova page |

### Files to Modify
| File | Change |
|------|--------|
| `supabase/functions/ask-metova/index.ts` | Add management context, enhance student SWOT, enhance officer context |
| `src/hooks/useAskMetova.ts` | Add management role |
| `src/App.tsx` | Add management route |

### Database Change
- Update `ask_metova_settings` to `enabled: true`

