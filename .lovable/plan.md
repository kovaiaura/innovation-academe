

# Plan: Add Default Password Prompt Before Repair

## Problem
When clicking "Repair Missing Accounts", new auth accounts get a random auto-generated password that nobody knows. The CEO needs to provide a default password so repaired students can actually log in.

## Solution
Add a dialog that appears when the CEO clicks "Repair Missing Accounts", prompting them to enter a default password. That password is then passed to the batch edge function for all newly created accounts.

## Changes

### 1. `src/pages/system-admin/CredentialManagement.tsx`
- Add state for a "Repair Password Dialog" (`repairPasswordDialogOpen`, `repairDefaultPassword`)
- When "Repair Missing Accounts" is clicked, open the dialog instead of calling repair directly
- Dialog contains: title, explanation text, password input with visibility toggle, password strength validation (8+ chars, uppercase, lowercase, number, special char), and Confirm/Cancel buttons
- On confirm, call `handleRepairAccounts` passing the entered password

### 2. `src/services/credentialService.ts`
- Update `repairStudentAccounts` to accept a `defaultPassword: string` parameter
- Pass `defaultPassword` in the batch request body instead of empty string

### 3. `supabase/functions/create-student-users-batch/index.ts`
- Read `defaultPassword` from the request body
- In repair mode, use `defaultPassword` (if provided) instead of the random UUID-based password

| File | Change |
|------|--------|
| `src/pages/system-admin/CredentialManagement.tsx` | Add password prompt dialog before repair |
| `src/services/credentialService.ts` | Accept and pass `defaultPassword` parameter |
| `supabase/functions/create-student-users-batch/index.ts` | Use provided `defaultPassword` in repair mode |

