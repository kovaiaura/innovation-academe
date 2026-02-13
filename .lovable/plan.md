

## Fix Payslip NaN Values and Create Professional Zoho-Style Design

### Problem
1. **NaN values** in Conveyance Allowance, Gross Earnings, and Net Pay -- caused by salary structure fields being undefined when used in arithmetic
2. **No company logo** displayed in the payslip header despite `logo_url` being fetched
3. **UI is basic** -- needs a professional Zoho-style payslip layout

---

### Changes

#### 1. Fix NaN in `IndividualAttendanceTab.tsx` (payslip generation logic, ~line 1137)

Add `|| 0` fallback to all salary structure fields when building the payslip data object:

```
gross_earnings = (ss.basic_pay || 0) + (ss.hra || 0) + (ss.conveyance_allowance || 0) + (ss.medical_allowance || 0) + (ss.special_allowance || 0) + overtimePay
```

Also apply `|| 0` to each individual field passed into the payslip object (basic_salary, hra, conveyance_allowance, medical_allowance, special_allowance).

#### 2. Fix NaN in `PayslipDialog.tsx` (display layer)

Update `formatCurrency` calls to guard against NaN: wrap each amount with `(amount || 0)` so even if bad data gets through, it displays as Rs.0.00 instead of Rs.NaN.

#### 3. Add Company Logo to Payslip Header

In `PayslipDialog.tsx`, render `companyProfile.logo_url` as an image in the header section (left side, before company name). This is the same logo used in invoices, fetched from `company_profiles.logo_url`.

#### 4. Professional Zoho-Style Payslip Redesign

Redesign the `PayslipDialog.tsx` layout to match a professional Zoho-style salary slip:

- **Header**: Company logo (left) + Company name and address below it. "SALARY SLIP" badge and month on the right
- **Employee Details**: Clean bordered table-style row with Employee Name, ID, Designation, Institution, Department
- **Earnings and Deductions**: Side-by-side table with proper borders, alternating row backgrounds, clear section headers with colored text
- **Net Pay Section**: Bold highlighted box with large net pay amount, gross and deduction summary on the right
- **Attendance Summary**: Compact grid of colored stat boxes
- **Footer**: Computer-generated notice with generation timestamp

### Files Modified

| File | Change |
|---|---|
| `src/components/payroll/IndividualAttendanceTab.tsx` | Add `\|\| 0` guards to all salary structure fields in payslip generation (~line 1129-1172) |
| `src/components/payroll/PayslipDialog.tsx` | Add logo display, NaN guards, professional Zoho-style layout redesign |

