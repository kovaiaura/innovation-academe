

# Plan: Fix Staff Dashboard Salary Tracker Showing ₹0

## Problem
The staff dashboard salary tracker shows ₹0 for all values because `user.annual_salary` is always `undefined`. The `AuthContext.tsx` (line 142-163) builds the `userData` object but never includes `annual_salary` from `profileData`, even though the `profiles` table has this column and the `User` type supports it.

In contrast, the officer dashboard works because it fetches salary from the `officers` table via a separate hook (`useOfficerByUserId`), bypassing the auth context entirely.

## Root Cause
In `src/contexts/AuthContext.tsx`, line 142-163, the `userData` object includes `hourly_rate`, `overtime_rate_multiplier`, and `normal_working_hours` from `profileData`, but **omits `annual_salary`**.

## Fix

### 1. Add `annual_salary` to AuthContext user object
**File:** `src/contexts/AuthContext.tsx` (~line 157)

Add `annual_salary: profileData.annual_salary || undefined` to the `userData` construction, right next to the existing `hourly_rate` line.

This single-line fix ensures `user.annual_salary` is populated for all staff users, making the `useStaffSalaryCalculation` hook receive the correct salary value.

### Files Modified
| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add `annual_salary` from `profileData` to `userData` object |

