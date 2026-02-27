

# Fix XP and Badge Allocation on Real-Time Events

## Root Cause: Student ID Mismatch

The **recalculate** function correctly uses `student.user_id` (the auth UUID from `profiles`/`auth.users`) for all XP and badge operations. However, the **real-time callers** (when a student joins a project, gets an award, etc.) pass the **wrong ID type**:

| Caller | ID Passed | Correct ID |
|--------|-----------|------------|
| `useProjectMembers.ts` (line 60) | `input.student_id` = students table record ID | Should be `students.user_id` (auth UUID) |
| `useProjectMembers.ts` (line 99) | Same issue for bulk add | Same fix needed |
| `useProjectAchievements.ts` (line 56) | `member.student_id` from `project_members` = students table record ID | Should be `students.user_id` (auth UUID) |
| `assessment.service.ts` (line 744) | `attemptData.student_id` from `assessment_attempts` | Already correct (stores auth UUID) |
| `assignment.service.ts` (line 348) | `data.student_id` from `assignment_submissions` | Already correct (stores auth UUID) |

### Why This Breaks Everything

1. **XP stored under wrong ID**: XP transactions are created with the students table record ID instead of auth UUID, so they don't show up for the student
2. **Badge check fails**: `checkAndAwardBadges` calls `getStudentActivityCounts`, which does `.eq('user_id', studentId)` on the `students` table. When `studentId` is already the students table ID (not auth UUID), this query returns nothing, so all activity counts are 0, and no badges are awarded

## Fix Plan

### 1. Fix `useProjectMembers.ts` - Resolve auth user_id before awarding XP

Update the `awardProjectXP` helper function to look up the student's `user_id` from the `students` table before calling `awardProjectMembershipXP`:

```typescript
async function awardProjectXP(projectId: string, studentRecordId: string) {
  // Look up student's auth user_id
  const { data: student } = await supabase
    .from('students')
    .select('user_id')
    .eq('id', studentRecordId)
    .single();
  
  if (!student?.user_id) return;
  
  // Get project's institution_id
  const { data: project } = await supabase
    .from('projects')
    .select('institution_id')
    .eq('id', projectId)
    .single();
  
  if (project?.institution_id) {
    await gamificationDbService.awardProjectMembershipXP(
      student.user_id,  // auth UUID, not students table ID
      project.institution_id,
      projectId
    );
  }
}
```

### 2. Fix `useProjectAchievements.ts` - Resolve auth user_id for each member

Update `awardProjectAwardXPToMembers` to look up each member's `user_id`:

```typescript
// For each member, join to get user_id
const { data: members } = await supabase
  .from('project_members')
  .select('student_id, students:student_id(user_id)')
  .eq('project_id', projectId);

for (const member of members) {
  const authUserId = member.students?.user_id;
  if (!authUserId) continue;
  
  await gamificationDbService.awardProjectAwardXP(
    authUserId,  // auth UUID
    project.institution_id,
    projectId,
    achievementTitle
  );
}
```

### 3. Verify assessment and assignment callers (already correct)

- `assessment.service.ts`: Uses `assessment_attempts.student_id` which stores auth UUID -- no change needed
- `assignment.service.ts`: Uses `assignment_submissions.student_id` which stores auth UUID -- no change needed

### Summary of Files to Edit

| File | Change |
|------|--------|
| `src/hooks/useProjectMembers.ts` | Look up `students.user_id` before awarding XP |
| `src/hooks/useProjectAchievements.ts` | Look up `students.user_id` for each member before awarding XP |

These two fixes align the real-time XP/badge awarding with the same ID convention used by the recalculate function, ensuring consistent behavior.
