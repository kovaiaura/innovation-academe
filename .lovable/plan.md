

# Adapt Ask Metova Prompts Based on Institution Type (School vs College)

## Problem
Currently, the student system prompt in `ask-metova` is identical regardless of whether the student belongs to a school or a college. College students need career-focused guidance — job roles, market trends, salary expectations, skill-to-career mapping — while school students need age-appropriate STEM learning support.

## Current State
- The `institutions` table has a `type` column (text, defaults to `'school'`). Currently all institutions are `'school'`.
- The student prompt (`studentPrompt`, lines 2313-2404) already mentions career guidance with salary/trends in its last section, but it's always applied — even for school students.
- `fetchStudentContext()` (line 1674) already resolves `institutionId` from the user's profile but does NOT fetch the institution type.

## Plan

### 1. Update `fetchStudentContext()` to return institution type
In the edge function, when fetching the student's profile, also fetch the institution's `type` field. Return it alongside context and sources.

### 2. Add college-specific context fetching
For college students, fetch additional data to power career guidance:
- Student's **projects** (titles, categories, SDG goals, tech used) — already fetched, but frame them for career mapping
- Student's **skills** from course categories and completed content
- Student's **assessment strengths** — already in SWOT, reuse for career alignment

### 3. Create separate system prompts for school vs college students

**School student prompt** (current behavior, slightly refined):
- STEM learning focus, age-appropriate explanations
- Simple career inspiration ("explore these fields") without salary/market details
- Remove the detailed salary/certification section

**College student prompt** (new):
- Career-oriented AI mentor persona
- Based on student's skills, projects, and course performance, suggest:
  - Specific job roles they qualify for or should target
  - Current market demand and hiring trends (2025-2026)
  - Expected salary ranges (fresher → 3yr → 5yr) in Indian/global market
  - Skill gaps to fill for target roles
  - Relevant certifications (AWS, Google AI, etc.)
  - Higher education paths (MTech, MBA, international programs)
- Still helps with academic doubts but frames them in career context
- References industry domains: AI/ML, Cybersecurity, Cloud, Data Engineering, Full-Stack, DevOps, IoT, Green Tech, Fintech

### 4. Wire institution type into prompt selection
In the main handler (line 2570-2574), pass the institution type from context to select the appropriate prompt.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/ask-metova/index.ts` | Fetch institution type in `fetchStudentContext`, add `collegeStudentPrompt`, select prompt based on type |

No database changes needed — the `type` column already exists on `institutions`.

## Technical Detail

```text
Main handler flow:
  role === 'student'
    → fetchStudentContext(userId)
      → get profile → get institution type
      → return { context, sources, institutionType }
    → if institutionType === 'college'
        use collegeStudentPrompt
      else
        use schoolStudentPrompt (current prompt, trimmed)
```

The college prompt will include sections like:
- "Based on your projects in [X category] and strong performance in [Y], here are career paths..."
- Job role suggestions with market demand indicators
- Salary benchmarks structured as Entry/Mid/Senior
- Certification roadmaps aligned to their demonstrated skills

