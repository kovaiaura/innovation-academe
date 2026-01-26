
## Plan: Update Academic Year from 2024-25 to 2025-26

### Overview
Update all hardcoded academic year values from "2024-25" (or "2024-2025") to "2025-26" (or "2025-2026") across the management dashboard header, fallback values, hooks, and related components.

---

### Files to Update

#### 1. Management Header Component
**File:** `src/components/management/InstitutionHeader.tsx`
- **Line 21:** Change default prop from `"2024-25 (Semester 2)"` to `"2025-26 (Semester 2)"`

---

#### 2. Management Dashboard Pages (Fallback Values)

| File | Line | Current | Updated |
|------|------|---------|---------|
| `src/pages/management/Dashboard.tsx` | 172 | `"2024-25"` | `"2025-26"` |
| `src/pages/management/Officers.tsx` | 117 | `'2024-25'` | `'2025-26'` |
| `src/pages/management/Students.tsx` | 204 | `'2024-25'` | `'2025-26'` |
| `src/pages/management/Attendance.tsx` | 139 | `"2024-25"` | `"2025-26"` |
| `src/pages/management/InventoryAndPurchase.tsx` | 156 | `"2024-25"` | `"2025-26"` |

---

#### 3. Settings Page
**File:** `src/pages/management/Settings.tsx`
- **Line 53:** Change `defaultValue="2024-2025"` to `defaultValue="2025-2026"`

---

#### 4. Add Class Dialog
**File:** `src/components/institution/AddClassDialog.tsx`
- **Line 20:** Change `academic_year: '2024-2025'` to `academic_year: '2025-2026'`
- **Line 40:** Change `academic_year: '2024-2025'` to `academic_year: '2025-2026'`

---

#### 5. Timetable Hooks (Default Parameters)

| File | Line | Current | Updated |
|------|------|---------|---------|
| `src/hooks/useClassTimetable.ts` | 8 | `academicYear: string = '2024-25'` | `academicYear: string = '2025-26'` |
| `src/hooks/useTimetable.ts` | 114 | `academicYear: string = '2024-25'` | `academicYear: string = '2025-26'` |

---

#### 6. Student Timetable Page
**File:** `src/pages/student/Timetable.tsx`
- **Line 16:** Change `'2024-25'` to `'2025-26'`

---

#### 7. Institution Timetable Tab
**File:** `src/components/institution/InstitutionTimetableTab.tsx`
- **Line 202:** Change `academic_year: '2024-25'` to `academic_year: '2025-26'`

---

### Summary of All Changes

| Category | Files | Changes |
|----------|-------|---------|
| Header Component | 1 | Default prop value |
| Management Pages | 5 | Fallback strings |
| Settings | 1 | Default input value |
| Add Class Dialog | 1 | 2 state initializations |
| Timetable Hooks | 2 | Default parameters |
| Student Page | 1 | Hook call parameter |
| Timetable Component | 1 | Assignment creation |

**Total:** 12 files with 14 value changes

---

### Notes
- Database migration files are not being updated as they are historical records
- Documentation files will not be updated (only code changes)
- Existing data in the database with "2024-25" will remain unchanged (only affects new entries and UI defaults)
