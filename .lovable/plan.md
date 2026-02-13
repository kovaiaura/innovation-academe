

## Fix Conveyance Allowance, Add Bank Details, and Darken Payslip Colors

### Problem Analysis

1. **Conveyance Allowance shows 0**: The officer "Jeeva Kumar M" has a `salary_structure` stored in the database with ALL values as 0 (basic_pay: 0, hra: 0, etc.) and uses `transport_allowance` instead of `conveyance_allowance`. The code sees the stored structure has keys, so it uses it as-is instead of auto-calculating from the annual salary (500,000). This means all salary components come through as 0 except for `transport_allowance` which maps to a different field name.

2. **No bank details on payslip**: The officers table has `bank_name`, `bank_account_number`, `bank_ifsc`, and `bank_branch` columns, but these are never fetched or displayed in the payslip.

3. **Net Payable and Deductions text too light**: The blue box and red deduction totals need darker, higher-contrast colors for print legibility.

---

### Changes

#### 1. Fix salary structure fallback logic (`src/services/payrollConfig.service.ts`)

The condition at line 72 currently checks if the salary_structure object exists and has keys. The fix:
- Check if the salary_structure actually has meaningful values (sum of components > 0)
- If all components are zero, fall back to calculating from annual CTC
- Map `transport_allowance` to `conveyance_allowance` when reading stored data

#### 2. Fetch and pass bank details to payslip (`src/components/payroll/IndividualAttendanceTab.tsx`)

- The `getOfficerSalaryData` service already fetches from the officers table -- extend it to also select `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch`
- Pass these fields into the payslip data object when generating the payslip

#### 3. Add bank details section to PayslipDialog (`src/components/payroll/PayslipDialog.tsx`)

- Add `bank_name`, `bank_account_number`, `bank_ifsc`, `bank_branch` to the PayslipData interface
- Display a "Bank Details" section between the Employee Details table and the Earnings/Deductions section, showing Bank Name, Account Number, IFSC Code, and Branch

#### 4. Darken Net Payable and Deductions colors (`src/components/payroll/PayslipDialog.tsx`)

- Change the Net Payable box from `bg-blue-600` to `bg-blue-900` with bolder white text
- Change the Total Deductions row from `text-red-700` to `text-red-900 font-extrabold`
- Increase the Gross/Deductions summary text opacity from `opacity-90` to full white

### Files Modified

| File | Change |
|---|---|
| `src/services/payrollConfig.service.ts` | Fix salary structure fallback: check sum > 0, map transport_allowance to conveyance_allowance, return bank details |
| `src/components/payroll/IndividualAttendanceTab.tsx` | Pass bank details fields to payslip data object |
| `src/components/payroll/PayslipDialog.tsx` | Add bank details section, darken Net Pay box and Deduction colors |

