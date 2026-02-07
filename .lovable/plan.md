
# Plan: Assessment Weightage Mapping System

## Overview

Implement a comprehensive assessment mapping and weightage system where each class can have assessments categorized into:
- **Formative Assessment 1 (FA1)** - 20% weightage
- **Formative Assessment 2 (FA2)** - 20% weightage  
- **Final Assessment** - 40% weightage
- **Internal Assessment** - 20% weightage (manually entered by Officer)

The system will automatically calculate weighted scores and display overall performance based on these categories.

---

## Architecture

```text
+---------------------------+
|  class_assessment_mapping |  (New Table)
+---------------------------+
| id                        |
| class_id (FK)             |
| institution_id (FK)       |
| academic_year             |
| fa1_assessment_id (FK)    |  --> links to assessments.id
| fa2_assessment_id (FK)    |  --> links to assessments.id
| final_assessment_id (FK)  |  --> links to assessments.id
| created_by                |
| created_at / updated_at   |
+---------------------------+

+---------------------------+
|  internal_assessment_marks|  (New Table - for manual entry)
+---------------------------+
| id                        |
| class_id (FK)             |
| institution_id (FK)       |
| student_id (FK)           |
| marks_obtained            |  (0-100 scale)
| total_marks (default 100) |
| academic_year             |
| entered_by (FK)           |
| notes                     |
| created_at / updated_at   |
+---------------------------+
```

---

## Database Changes

### 1. Create `class_assessment_mapping` Table
Stores the mapping of assessments to categories (FA1, FA2, Final) for each class.

```sql
CREATE TABLE public.class_assessment_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2024-25',
  fa1_assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  fa2_assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  final_assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(class_id, academic_year)
);
```

### 2. Create `internal_assessment_marks` Table
Stores manual internal assessment marks entered by Officers.

```sql
CREATE TABLE public.internal_assessment_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_obtained numeric(5,2) NOT NULL DEFAULT 0 CHECK (marks_obtained >= 0),
  total_marks numeric(5,2) NOT NULL DEFAULT 100 CHECK (total_marks > 0),
  academic_year text NOT NULL DEFAULT '2024-25',
  entered_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id, academic_year)
);
```

### 3. RLS Policies
- Officers can read/write for their assigned institutions
- CEO/System Admin can read/write all
- Management can read/write for their institution

---

## New Components

### 1. Assessment Mapping UI Component
**File:** `src/components/assessment/ClassAssessmentMappingDialog.tsx`

Dialog to map assessments to categories (FA1, FA2, Final) for a class:
- Dropdown selectors for each category
- Shows available assessments assigned to that class
- Auto-calculates example weighted score

### 2. Internal Marks Entry Component
**File:** `src/components/assessment/InternalMarksEntry.tsx`

Table-based form for Officers to enter internal assessment marks:
- List all students in the class
- Input field for marks (0-100)
- Save all at once or individual save
- Shows student name, current marks, notes

### 3. Weighted Score Calculator
**File:** `src/utils/assessmentWeightageCalculator.ts`

Utility functions:
```typescript
interface WeightedScoreResult {
  fa1_score: number;        // Actual score (scaled to 20%)
  fa2_score: number;        // Actual score (scaled to 20%)
  final_score: number;      // Actual score (scaled to 40%)
  internal_score: number;   // Actual score (scaled to 20%)
  total_weighted: number;   // Out of 100
  breakdown: {
    fa1: { raw: number; percentage: number; weighted: number };
    fa2: { raw: number; percentage: number; weighted: number };
    final: { raw: number; percentage: number; weighted: number };
    internal: { raw: number; percentage: number; weighted: number };
  };
}

function calculateWeightedScore(
  fa1Attempt: AssessmentAttempt | null,
  fa2Attempt: AssessmentAttempt | null,
  finalAttempt: AssessmentAttempt | null,
  internalMarks: { obtained: number; total: number } | null
): WeightedScoreResult;
```

### 4. Weighted Performance Display
**File:** `src/components/analytics/WeightedAssessmentView.tsx`

Shows the weighted assessment breakdown for:
- Individual students
- Class aggregate
- Institution aggregate

---

## UI Integration Points

### 1. CEO Dashboard - Institution Detail
Add new tab or section under "Classes" to configure assessment mapping:
- Navigate to class → "Assessment Mapping" tab
- Configure FA1, FA2, Final assessment mapping
- View weighted scores for all students

### 2. Officer Dashboard - Assessment Management
Add options for:
- Map assessments to categories for assigned classes
- Enter internal assessment marks
- View class-wise weighted performance

### 3. Management Dashboard - Analytics
Enhance analytics to show:
- Weighted assessment scores instead of simple averages
- Breakdown by FA1, FA2, Final, Internal

### 4. Student Dashboard
Add new view showing:
- Personal weighted score breakdown
- Category-wise performance (FA1, FA2, Final, Internal)

---

## Calculation Logic

### Weightage Formula
```
Total Score = (FA1% × 0.20) + (FA2% × 0.20) + (Final% × 0.40) + (Internal% × 0.20)
```

### Absent Handling
- If a student is marked absent for an assessment, their score for that category = 0
- The weightage still applies (they get 0 contribution from that category)

### Example
| Category | Raw Score | Total | Percentage | Weight | Contribution |
|----------|-----------|-------|------------|--------|--------------|
| FA1      | 24        | 30    | 80%        | 20%    | 16.0         |
| FA2      | 18        | 30    | 60%        | 20%    | 12.0         |
| Final    | 70        | 100   | 70%        | 40%    | 28.0         |
| Internal | 85        | 100   | 85%        | 20%    | 17.0         |
| **Total**|           |       |            |        | **73.0**     |

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/components/assessment/ClassAssessmentMappingDialog.tsx` | UI for mapping assessments to categories |
| `src/components/assessment/InternalMarksEntry.tsx` | Form for entering internal marks |
| `src/components/analytics/WeightedAssessmentView.tsx` | Display weighted scores |
| `src/hooks/useClassAssessmentMapping.ts` | Hook for CRUD on mapping table |
| `src/hooks/useInternalMarks.ts` | Hook for CRUD on internal marks |
| `src/utils/assessmentWeightageCalculator.ts` | Calculation utilities |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/system-admin/InstitutionDetail.tsx` | Add assessment mapping access from class detail |
| `src/pages/officer/AssessmentManagement.tsx` | Add mapping and internal marks entry options |
| `src/components/institution/InstitutionClassesTab.tsx` | Add "Assessment Mapping" action button |
| `src/hooks/useComprehensiveAnalytics.ts` | Include weighted scores in analytics |
| `src/components/analytics/StudentAnalyticsView.tsx` | Show weighted assessment breakdown |
| `src/components/analytics/ClassAnalyticsView.tsx` | Show class-level weighted scores |
| `src/pages/management/Analytics.tsx` | Display weighted assessment view |
| `src/pages/student/Dashboard.tsx` | Show student's weighted score summary |

---

## User Flows

### Flow 1: CEO/Officer Maps Assessments to Categories
1. Navigate to Institution → Class
2. Click "Assessment Mapping"
3. Select FA1 assessment from dropdown (shows assessments assigned to this class)
4. Select FA2 assessment
5. Select Final assessment
6. Save mapping

### Flow 2: Officer Enters Internal Marks
1. Navigate to Assessment Management
2. Select class → "Internal Marks"
3. See list of all students
4. Enter marks for each student (0-100)
5. Add optional notes
6. Save

### Flow 3: View Weighted Performance
1. Navigate to Analytics (CEO/Officer/Management)
2. Select "Weighted Assessment" view
3. See breakdown: FA1 (20%), FA2 (20%), Final (40%), Internal (20%)
4. View individual student or class aggregate scores

---

## Summary

This implementation creates a structured assessment evaluation system with:
- Fixed weightage categories aligned with academic standards
- Flexible mapping of existing assessments to categories
- Manual internal marks entry for officers
- Automatic weighted score calculation
- Zero score for absent students
- Analytics integration showing weighted performance
