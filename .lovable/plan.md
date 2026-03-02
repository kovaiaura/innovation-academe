
# Attendance Corrections + Salary Payment Tracking

## Overview
Fix several attendance card calculations, replace "Late Days" with "Weekends", add a "Salary Payable Days" card, and introduce a "Mark as Paid" feature that creates a corresponding purchase invoice entry in the Top Sheet.

---

## Changes Summary

### 1. Fix "Working Days" calculation
**Current**: Counts only days with `dayType === 'working'` (excludes leave days, which is incorrect).
**New**: `Working Days = Present + Paid Leave + LOP` (i.e., days the employee was expected to work, excluding weekends and holidays).

### 2. Replace "Late Days" card with "Weekends" card
**Current**: Shows "Late Days" count.
**New**: Shows "Weekends" count (total weekend days from the calendar for that employee's institution/company).

### 3. Fix "Attendance %" calculation
**Current**: `(Total Days in Month - LOP) / Total Days in Month`
**New**: `(Total Days in Month - (Casual Leave + LOP)) * 100 / Total Days in Month`
- Casual leave (paid leave) and LOP both reduce attendance percentage. Weekends, holidays, and present days don't.

### 4. Add "Salary Payable Days" card
**New card**: `Present + Holidays + Weekends + Paid Leave`
This represents how many days count toward the salary payout.

### 5. Add "Mark Salary as Paid" feature
Below the Monthly Payout Summary, add a "Mark as Paid" button with two options:
- **Full Salary**: Records the net payout amount as paid
- **Custom Amount**: Allows entering a custom amount

When marked as paid:
- Store a record in a new `salary_payments` database table (employee_id, month, year, amount_paid, payment_type, paid_at, paid_by)
- Show a "Paid" badge on the payout card with the paid amount
- Automatically create a **purchase invoice** entry in the invoices table with:
  - `invoice_type = 'purchase'`
  - `to_company_name` = employee name
  - `total_amount` = amount paid
  - `status = 'paid'`
  - `remark = "February 2026 Salary"`
  - This will appear in the **Top Sheet** as a debit entry

---

## Technical Details

### Database Migration: Create `salary_payments` table
```text
CREATE TABLE salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_type TEXT NOT NULL,  -- 'officer' or 'staff'
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount_paid NUMERIC NOT NULL,
  net_salary NUMERIC NOT NULL,
  payment_type TEXT DEFAULT 'full',  -- 'full' or 'custom'
  invoice_id UUID REFERENCES invoices(id),
  paid_by UUID,
  paid_by_name TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS + policy for authenticated users
```

### File: `src/components/payroll/IndividualAttendanceTab.tsx`

**Stats calculation changes (calculateStats function)**:
- `workingDays` = presentDays + paidLeaveDays + totalLopDays (expected work days)
- `weekendDays` = days with `dayType === 'weekend'` (already calculated)
- `attendancePercentage` = `((totalDaysInMonth - (paidLeaveDays + totalLopDays)) * 100) / totalDaysInMonth`
- New: `salaryPayableDays` = presentDays + holidays + weekendDays + paidLeaveDays

**Summary cards update**:
- Card 1: Working Days (recalculated)
- Card 2: Present (unchanged)
- Card 3: Attendance % (recalculated)
- Card 4: **Weekends** (replacing Late Days)
- Card 5: Holidays (unchanged)
- Card 6: Paid Leave (unchanged)
- Card 7: LOP Days (unchanged)
- Card 8: Approved Overtime (unchanged)
- New Card 9: **Salary Payable Days**

**Mark as Paid section** (below payout summary):
- State: `salaryPaymentStatus`, `paymentAmount`, `showPaymentDialog`
- Load existing payment from `salary_payments` table on employee/month change
- Dialog with radio: "Full Salary" (pre-filled net payout) or "Custom Amount" (editable input)
- On confirm: Insert into `salary_payments`, create purchase invoice, refresh data
- Show green "Paid" badge with amount if already paid; allow undo/re-mark

### Integration with Top Sheet
No changes needed to TopSheetTab -- it already reads from the invoices table. The purchase invoice created by "Mark as Paid" will automatically appear as a settled debit entry with the salary remark.

### Files to modify/create:
| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` -- fix stats, replace late with weekends, add payable days card, add mark-as-paid |
| Create | DB migration for `salary_payments` table |
