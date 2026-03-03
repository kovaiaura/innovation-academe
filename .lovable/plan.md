
# Fix Officer Profile Page: Attendance, Bank Details, Statutory Info, Institution Names

## Problem
The officer's "My Profile" page has four issues:
1. **Daily Attendance shows no data** -- it uses mock data (`getOfficerAttendanceRecord` from `mockOfficerAttendance.ts`) instead of the real `officer_attendance` database table
2. **No month selector** -- officer can't browse attendance by month
3. **Bank Details shows "Contact HR"** -- instead of displaying actual bank data from the `officers` table (columns: `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch`)
4. **Statutory Information shows "Contact HR"** -- instead of displaying actual data from `officers.statutory_info` JSONB (PF number, UAN, PAN, PT registration)
5. **Assigned Institutions shows raw UUIDs** -- instead of resolving institution names

---

## Changes

### 1. Rewrite `OfficerDailyAttendanceDetails` to use real DB data

**File: `src/components/officer/OfficerDailyAttendanceDetails.tsx`**

- Replace mock data imports (`getOfficerAttendanceRecord`, `getOfficerById`) with the existing `useOfficerMonthlyAttendance` hook from `src/hooks/useOfficerAttendance.ts`
- This hook calls `getOfficerMonthlyAttendance(officerId, month)` which queries the `officer_attendance` table
- Map real DB records (with `check_in_time`, `check_out_time`, `check_in_latitude/longitude`, `check_out_latitude/longitude`, `check_in_validated`, `total_hours_worked`, `overtime_hours`, `status`) into the daily display
- Add a month selector (input type="month") so officers can browse different months
- Remove the Collapsible wrapper -- show attendance directly (always visible)

### 2. Update `useOfficerByUserId` to fetch bank and statutory fields

**File: `src/hooks/useOfficerProfile.ts`**

- The hook already does `select('*')` so all columns are returned, but the `OfficerProfile` interface is too narrow
- Add to `OfficerProfile` interface: `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch`, `statutory_info`, `phone`, `address`, `date_of_birth`, `join_date`, `employment_type`, `normal_working_hours`

### 3. Display real Bank Details in Profile

**File: `src/pages/officer/Profile.tsx`**

Replace the "Contact HR" placeholder in the Bank Details collapsible with actual data from the officer record:
- Bank Name
- Account Number (partially masked for security, e.g., "XXXX1234")
- IFSC Code
- Branch

Show "Not provided" for any missing fields.

### 4. Display real Statutory Information in Profile

**File: `src/pages/officer/Profile.tsx`**

Replace the "Contact HR" placeholder in the Statutory Information collapsible with:
- PF Number
- UAN Number
- PAN Number
- PT Registration
- PF Applicable / ESI Applicable / PT Applicable flags

All sourced from `officer.statutory_info` JSONB field.

### 5. Resolve institution names from UUIDs

**File: `src/pages/officer/Profile.tsx`**

- Add a query to fetch institution names from the `institutions` table using the `assigned_institutions` UUID array
- Display human-readable institution names in badges instead of raw UUIDs

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/hooks/useOfficerProfile.ts` -- expand OfficerProfile interface |
| Modify | `src/components/officer/OfficerDailyAttendanceDetails.tsx` -- use real DB data + month selector |
| Modify | `src/pages/officer/Profile.tsx` -- bank details, statutory info, institution names |
