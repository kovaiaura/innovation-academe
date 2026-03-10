import { SalaryComponent, Deduction, StatutoryInfo } from '@/types/attendance';
import { OfficerDetails } from '@/services/systemadmin.service';

/**
 * Calculate PF (Provident Fund) - Employee & Employer
 * Employee: 12% of Basic + DA (max ₹15,000 basic for calculation)
 * Employer: 12% of Basic + DA (3.67% to EPF, 8.33% to EPS)
 */
export const calculatePF = (basicPay: number, da: number, pf_applicable: boolean) => {
  if (!pf_applicable) return { employee: 0, employer: 0 };
  
  const pfBase = Math.min(basicPay + da, 15000);
  const employeePF = Math.round(pfBase * 0.12);
  const employerPF = Math.round(pfBase * 0.12);
  
  return {
    employee: employeePF,
    employer: employerPF,
  };
};

/**
 * Calculate ESI (Employee State Insurance)
 * Applicable if gross salary <= ₹21,000/month
 * Employee: 0.75% of gross salary
 * Employer: 3.25% of gross salary
 */
export const calculateESI = (grossSalary: number, esi_applicable: boolean) => {
  if (!esi_applicable || grossSalary > 21000) return { employee: 0, employer: 0 };
  
  const employeeESI = Math.round(grossSalary * 0.0075);
  const employerESI = Math.round(grossSalary * 0.0325);
  
  return {
    employee: employeeESI,
    employer: employerESI,
  };
};

/**
 * Calculate Professional Tax (PT) - State-specific
 * Example for Maharashtra slab rates
 */
export const calculateProfessionalTax = (grossSalary: number, pt_applicable: boolean, state: string = 'maharashtra') => {
  if (!pt_applicable) return 0;
  
  if (state === 'maharashtra') {
    if (grossSalary <= 7500) return 0;
    if (grossSalary <= 10000) return 175;
    return 200;
  }
  
  return 0;
};

/**
 * Calculate TDS (Tax Deducted at Source)
 * Based on annual income and IT slab rates
 */
export const calculateTDS = (annualIncome: number, age: number = 30): number => {
  let tax = 0;
  
  if (annualIncome <= 250000) {
    tax = 0;
  } else if (annualIncome <= 500000) {
    tax = (annualIncome - 250000) * 0.05;
  } else if (annualIncome <= 1000000) {
    tax = 12500 + (annualIncome - 500000) * 0.20;
  } else {
    tax = 12500 + 100000 + (annualIncome - 1000000) * 0.30;
  }
  
  const monthlyTDS = Math.round(tax / 12);
  return monthlyTDS;
};

/**
 * Calculate Gross Salary from components
 */
export const calculateGrossSalary = (components: SalaryComponent[]): number => {
  return components.reduce((sum, component) => sum + component.amount, 0);
};

/**
 * Calculate Total Deductions
 */
export const calculateTotalDeductions = (deductions: Deduction[]): number => {
  return deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
};

/**
 * Calculate Net Pay
 */
export const calculateNetPay = (grossSalary: number, totalDeductions: number): number => {
  return grossSalary - totalDeductions;
};

/**
 * Generate Complete Payroll Calculation
 */
export const generatePayrollCalculation = (
  officer: OfficerDetails,
  daysPresent: number,
  daysAbsent: number,
  daysLeave: number,
  overtimeHours: number = 0,
  loanDeduction: number = 0
) => {
  const totalDays = daysPresent + daysAbsent + daysLeave;
  const paidDays = daysPresent + daysLeave;
  
  // Use salary structure or fallback to total salary using new formula
  // New formula: Basic=50%, DA=Basic×20%, HRA=Basic×40%, CCA=Basic×10%, SPL=remainder
  const grossSalaryMonthly = officer.salary;
  const fallbackBasic = grossSalaryMonthly * 0.5;
  const fallbackDA = fallbackBasic * 0.2;
  const fallbackHRA = fallbackBasic * 0.4;
  const fallbackCCA = fallbackBasic * 0.1;
  const fallbackSPL = grossSalaryMonthly - (fallbackBasic + fallbackDA + fallbackHRA + fallbackCCA);
  
  const salaryStructure = officer.salary_structure || {
    basic_pay: fallbackBasic,
    da: fallbackDA,
    hra: fallbackHRA,
    cca: fallbackCCA,
    special_allowance: Math.max(0, fallbackSPL),
  };
  
  // Calculate pro-rated salary components: (Gross component / total days) × paid days
  const basicPay = ((salaryStructure.basic_pay || 0) / totalDays) * paidDays;
  const da = ((salaryStructure.da || 0) / totalDays) * paidDays;
  const hra = ((salaryStructure.hra || 0) / totalDays) * paidDays;
  const ccaAmount = ((salaryStructure.cca || 0) / totalDays) * paidDays;
  const specialAllowance = ((salaryStructure.special_allowance || 0) / totalDays) * paidDays;
  
  // Overtime calculation
  const overtimePay = overtimeHours * (basicPay / 208) * 2;
  
  // Build salary components
  const components: SalaryComponent[] = [
    { component_type: 'basic_pay', amount: Math.round(basicPay), is_taxable: true, calculation_type: 'fixed' },
    { component_type: 'da', amount: Math.round(da), is_taxable: true, calculation_type: 'fixed' },
    { component_type: 'hra', amount: Math.round(hra), is_taxable: true, calculation_type: 'fixed' },
    { component_type: 'cca', amount: Math.round(ccaAmount), is_taxable: false, calculation_type: 'fixed' },
    { component_type: 'special_allowance', amount: Math.round(specialAllowance), is_taxable: true, calculation_type: 'fixed' },
  ];
  
  if (overtimePay > 0) {
    components.push({
      component_type: 'overtime',
      amount: Math.round(overtimePay),
      is_taxable: true,
      calculation_type: 'computed',
    });
  }
  
  const grossSalary = calculateGrossSalary(components);
  
  // Calculate statutory deductions
  const statutoryInfo = officer.statutory_info || {
    pf_applicable: true,
    esi_applicable: false,
    pt_applicable: true,
  };
  
  const pf = calculatePF(basicPay, da, statutoryInfo.pf_applicable);
  const esi = calculateESI(grossSalary, statutoryInfo.esi_applicable);
  const pt = calculateProfessionalTax(grossSalary, statutoryInfo.pt_applicable);
  const tds = calculateTDS(grossSalary * 12);
  
  // Build deductions
  const deductions: Deduction[] = [];
  
  if (pf.employee > 0) {
    deductions.push({
      deduction_type: 'pf',
      amount: pf.employee,
      calculation_type: 'statutory',
    });
  }
  
  if (esi.employee > 0) {
    deductions.push({
      deduction_type: 'esi',
      amount: esi.employee,
      calculation_type: 'statutory',
    });
  }
  
  if (pt > 0) {
    deductions.push({
      deduction_type: 'professional_tax',
      amount: pt,
      calculation_type: 'statutory',
    });
  }
  
  if (tds > 0) {
    deductions.push({
      deduction_type: 'tds',
      amount: tds,
      calculation_type: 'statutory',
    });
  }
  
  if (loanDeduction > 0) {
    deductions.push({
      deduction_type: 'loan',
      amount: loanDeduction,
      calculation_type: 'fixed',
      notes: 'Monthly loan deduction',
    });
  }
  
  const totalDeductions = calculateTotalDeductions(deductions);
  const netPay = calculateNetPay(grossSalary, totalDeductions);
  
  return {
    salary_components: components,
    total_earnings: grossSalary,
    deductions,
    total_deductions: totalDeductions,
    gross_salary: grossSalary,
    net_pay: netPay,
    pf_employee: pf.employee,
    pf_employer: pf.employer,
    esi_employee: esi.employee,
    esi_employer: esi.employer,
    tds,
    professional_tax: pt,
  };
};

/**
 * Adjust payroll for leave days (deduction)
 */
export const adjustPayrollForLeave = (
  leaveDays: number,
  hourlyRate: number,
  normalWorkingHours: number
): number => {
  const deduction = leaveDays * normalWorkingHours * hourlyRate;
  return deduction;
};

/**
 * Calculate substitute pay (regular hours)
 */
export const calculateSubstitutePay = (
  substituteHours: number,
  hourlyRate: number
): number => {
  return substituteHours * hourlyRate;
};
