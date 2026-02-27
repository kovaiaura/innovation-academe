

# Professional AI Response Rendering + Enhanced Student Analytics Context

## Problem 1: AI responses render as plain text
The `ChatMessage.tsx` component splits content by newlines and wraps each in a `<p>` tag. This means markdown tables, headers, bold text, lists, and code blocks all appear as raw text -- not rendered professionally.

## Problem 2: Student context missing key analytics
The student context fetcher lacks:
- Class ranking position (where they stand among peers)
- Course outcome accuracy breakdown
- Project involvement details (type, SDG goals, achievements/recognition)
- Average assessment score summary
- Career domain recommendation capability

---

## Changes

### 1. Add `react-markdown` and render AI responses professionally

**Install**: `react-markdown` and `remark-gfm` (for GitHub-flavored markdown with table support)

**Update `src/components/student/ChatMessage.tsx`**:
- Replace the naive `split('\n').map(line => <p>)` rendering with `<ReactMarkdown>` component
- Add `remark-gfm` plugin for table support
- Style tables, headers, lists, and code blocks using Tailwind prose classes
- Ensure proper dark mode support with `dark:prose-invert`

### 2. Enhance Student Context in Edge Function

**Update `supabase/functions/ask-metova/index.ts`** - Add to `fetchStudentContext()`:

**A. Class Ranking Position**
- Fetch the student's `class_id` and `institution_id` from their profile
- Query all students in the same class with their assessment scores, assignment marks, project count, and XP
- Apply the existing ranking formula (Assessments 50%, Assignments 20%, Projects 20%, XP 10%)
- Show the student's rank out of total classmates

**B. Course Outcome Performance**
- Already partially done via SWOT, but add a dedicated summary section showing per-course accuracy percentage

**C. Project Details with Type and Recognition**
- Fetch `projects` the student is a member of (via `project_members`)
- Include project title, status, SDG goals, category/type
- Fetch `project_achievements` for those projects (awards, competition wins, patents)
- Summarize recognition: "You have X awards across Y projects"

**D. Career Domain Advice Context**
- Based on strengths (high-accuracy topics), project types, and course categories
- Add a section to the student context summarizing their strongest domains
- Update `studentPrompt` to include career guidance instructions:
  - Map STEM strengths to career domains (e.g., high robotics scores -> Mechatronics/Automation)
  - Consider project types and achievements for recommendations
  - Suggest relevant higher education paths and industry domains

### 3. Update Student System Prompt

**Update `studentPrompt`** to add career advice capability:
- When asked about career advice, future domains, or "what should I study":
  - Analyze their strongest course categories and topics
  - Consider their project types and any awards/recognition
  - Suggest relevant career domains (e.g., AI/ML, Robotics, Biotech, Data Science)
  - Recommend focus areas for competitive exams or higher studies

---

## Technical Details

### Markdown Rendering (ChatMessage.tsx)
```text
Before: message.content.split('\n').map(line => <p>{line}</p>)
After:  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
```

Custom component overrides will be added for:
- `table`: styled with borders, striped rows
- `th/td`: proper padding and alignment
- `h1-h3`: appropriate sizing within chat bubbles
- `code`: inline and block code styling

### Student Ranking Calculation (Edge Function)
```text
For each classmate:
  assessmentScore = avg(assessment_attempts.percentage) -> weight 50%
  assignmentScore = avg(assignment_submissions.marks_obtained / total_marks * 100) -> weight 20%
  projectScore = min(project_count * 20, 100) -> weight 20% (capped)
  xpScore = min(total_xp / 10, 100) -> weight 10% (capped)
  
  totalScore = assessment*0.5 + assignment*0.2 + project*0.2 + xp*0.1
  
Sort by totalScore descending -> find student's rank
```

### Career Domain Mapping (in studentPrompt)
```text
High accuracy in Programming/Coding -> Software Engineering, AI/ML, Web Dev
High accuracy in Electronics/Robotics -> Mechatronics, IoT, Embedded Systems  
High accuracy in Biology/Environment -> Biotech, Environmental Science
High accuracy in Math/Statistics -> Data Science, Finance, Research
Projects with patents/awards -> Entrepreneurship, R&D
```

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/student/ChatMessage.tsx` | Replace plain text rendering with ReactMarkdown + remark-gfm |
| `supabase/functions/ask-metova/index.ts` | Add class ranking, project details, career context to student fetcher; update studentPrompt |
| `package.json` | Add `react-markdown` and `remark-gfm` dependencies |

