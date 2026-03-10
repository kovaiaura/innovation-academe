

# Update Salary Structure: Replace Old Components with New Formula

## New Salary Formula
```text
Gross Salary = Actual Salary (per month)

Basic     = 50% of Gross
DA        = Basic × 20%
HRA       = Basic × 40%
CCA       = Basic × 10%
SPL       = Gross - (Basic + DA + HRA + CCA)

Earnings (pro-rated):
Each component = (Gross component / total days in month) × salary payable days
```

## What Changes

The old structure used: Basic (50%), HRA (20% of CTC), Conveyance (fixed ₹1,600), Medical (fixed ₹1,250), Special (remainder). The new structure replaces Conveyance and Medical with DA and CCA, all percentage-based off Basic.

## Files to Modify

| File | Change |
|------|--------|
| `src/types/payroll.ts` | Replace `conveyance_allowance` and `medical_allowance` with `da` and `cca` in `SalaryStructure`. Update `PayrollConfig` defaults. Update `calculateSalaryBreakdown()`. |
| `src/services/payrollConfig.service.ts` | Update default breakdown formula in both `getOfficerSalaryDetails()` and `getStaffSalaryDetails()` to use new formula (DA=Basic×20%, HRA=Basic×40%, CCA=Basic×10%, SPL=remainder). |
| `src/utils/payrollCalculations.ts` | Update `generatePayrollCalculation()` fallback percentages and component list to use DA, HRA, CCA, SPL instead of old components. Pro-rate each as `(gross component / total days) × paid days`. |
| `src/data/mockStaffPayroll.ts` | Update mock salary breakdown to match new formula. |
| `src/data/mockAttendanceData.ts` | Update mock `salary_components` arrays to use new component types. |
| `src/components/payroll/PayslipDialog.tsx` | Replace `conveyance_allowance` and `medical_allowance` with `da` and `cca` in `PayslipData` interface and earnings display. Labels: "Dearness Allowance (DA)", "City Compensatory Allowance (CCA)". |
| `src/components/payroll/pdf/PayslipPDF.tsx` | Same as PayslipDialog — update interface and earnings labels. |
| `src/components/payroll/IndividualAttendanceTab.tsx` | Update payslip generation to pass `da` and `cca` instead of `conveyance_allowance` and `medical_allowance`. |
| `src/components/officer/EditOfficerDialog.tsx` | Update "Auto Calculate" to use new formula. Replace Transport/Medical input fields with DA/CCA fields. |
| `src/components/officer/OfficerDetailsDialog.tsx` | Replace Transport Allowance and Medical Allowance display with DA and CCA. |
| `src/pages/system-admin/MetaStaffDetail.tsx` | Update `calculateSalary()` to use new formula. Replace input fields for salary breakdown. |
| `src/components/attendance/OfficerPayrollTab.tsx` | Update component type references if needed. |

## Summary
- **Remove**: `conveyance_allowance`, `medical_allowance`, `transport_allowance` as salary components
- **Add**: `da` (Dearness Allowance = Basic × 20%), `cca` (City Compensatory Allowance = Basic × 10%)
- **Keep**: `basic_pay` (50% of Gross), `hra` (Basic × 40%), `special_allowance` (Gross - Basic - DA - HRA - CCA)
- All earnings pro-rated: `(Gross component / total days in month) × salary payable days`

