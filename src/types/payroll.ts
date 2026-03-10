/**
 * Payroll Types
 * Salary structure, statutory info, and payroll configuration types
 * 
 * NEW FORMULA:
 * Gross Salary = Actual Salary (per month)
 * Basic = 50% of Gross
 * DA = Basic × 20%
 * HRA = Basic × 40%
 * CCA = Basic × 10%
 * SPL = Gross - (Basic + DA + HRA + CCA)
 * 
 * Pro-rated Earnings:
 * Each component = (Gross component / total days in month) × salary payable days
 */

export interface SalaryStructure {
  basic_pay: number;           // 50% of Gross
  da: number;                  // Dearness Allowance (Basic × 20%)
  hra: number;                 // House Rent Allowance (Basic × 40%)
  cca: number;                 // City Compensatory Allowance (Basic × 10%)
  special_allowance: number;   // Gross - (Basic + DA + HRA + CCA)
  other_allowances?: number;
  // Legacy fields kept for backward compat with stored data
  conveyance_allowance?: number;
  medical_allowance?: number;
  transport_allowance?: number;
}

export interface StatutoryInfo {
  pf_applicable: boolean;       // Provident Fund
  pf_account_number?: string;
  esi_applicable: boolean;      // Employee State Insurance
  esi_number?: string;
  pt_applicable: boolean;       // Professional Tax
  pt_state?: string;
  uan_number?: string;          // Universal Account Number
  pan_number?: string;
  pf_number?: string;
}

export interface PayrollConfig {
  company_name: string;
  company_address: string;
  company_logo_url?: string;
  statutory_settings: {
    pf_rate_employee: number;
    pf_rate_employer: number;
    esi_rate_employee: number;
    esi_rate_employer: number;
    esi_wage_limit: number;
    professional_tax_state: string;
  };
  salary_components: {
    basic_percentage: number;
    da_percentage: number;       // DA as % of Basic (20%)
    hra_percentage: number;      // HRA as % of Basic (40%)
    cca_percentage: number;      // CCA as % of Basic (10%)
    // Legacy - kept for config compat
    conveyance_allowance?: number;
    medical_allowance?: number;
    special_allowance_percentage?: number;
  };
  overtime_settings: {
    default_multiplier: number;
    weekend_multiplier: number;
  };
}

export const DEFAULT_PAYROLL_CONFIG: PayrollConfig = {
  company_name: 'MetaSage Alliance',
  company_address: 'Mumbai, Maharashtra, India',
  statutory_settings: {
    pf_rate_employee: 12,
    pf_rate_employer: 12,
    esi_rate_employee: 0.75,
    esi_rate_employer: 3.25,
    esi_wage_limit: 21000,
    professional_tax_state: 'maharashtra',
  },
  salary_components: {
    basic_percentage: 50,        // 50% of Gross
    da_percentage: 20,           // 20% of Basic
    hra_percentage: 40,          // 40% of Basic
    cca_percentage: 10,          // 10% of Basic
  },
  overtime_settings: {
    default_multiplier: 1.5,
    weekend_multiplier: 2.0,
  },
};

// Calculate salary breakdown from monthly gross salary
export const calculateSalaryBreakdown = (
  monthlySalary: number
): SalaryStructure => {
  const basic = monthlySalary * 0.5;
  const da = basic * 0.2;
  const hra = basic * 0.4;
  const cca = basic * 0.1;
  const special = monthlySalary - (basic + da + hra + cca);
  
  return {
    basic_pay: Math.round(basic * 100) / 100,
    da: Math.round(da * 100) / 100,
    hra: Math.round(hra * 100) / 100,
    cca: Math.round(cca * 100) / 100,
    special_allowance: Math.round(Math.max(0, special) * 100) / 100,
  };
};

// Calculate professional tax based on state
export const calculateProfessionalTax = (monthlySalary: number, state: string = 'maharashtra'): number => {
  if (state === 'maharashtra') {
    if (monthlySalary <= 7500) return 0;
    if (monthlySalary <= 10000) return 175;
    return 200;
  }
  // Default
  if (monthlySalary <= 15000) return 0;
  return 200;
};

// Calculate PF deduction
export const calculatePFDeduction = (basicSalary: number, pfRate: number = 12): number => {
  const pfCeiling = 15000; // PF calculated on max ₹15,000 basic
  const applicableBasic = Math.min(basicSalary, pfCeiling);
  return Math.round(applicableBasic * (pfRate / 100));
};

// Calculate ESI deduction
export const calculateESIDeduction = (grossSalary: number, esiRate: number = 0.75, wageLimit: number = 21000): number => {
  if (grossSalary > wageLimit) return 0; // Not applicable above wage limit
  return Math.round(grossSalary * (esiRate / 100));
};

// Migrate legacy salary structure to new format
export const migrateSalaryStructure = (raw: Record<string, number>, grossSalary?: number): SalaryStructure => {
  // If it already has cca, it's in new format
  if (raw.cca !== undefined && raw.cca > 0) {
    return {
      basic_pay: raw.basic_pay || 0,
      da: raw.da || 0,
      hra: raw.hra || 0,
      cca: raw.cca || 0,
      special_allowance: raw.special_allowance || 0,
      other_allowances: raw.other_allowances || 0,
    };
  }
  
  // Legacy format: recalculate from gross
  const total = grossSalary || Object.values(raw).reduce((s, v) => s + (Number(v) || 0), 0);
  if (total > 0) {
    return calculateSalaryBreakdown(total);
  }
  
  return {
    basic_pay: raw.basic_pay || 0,
    da: raw.da || 0,
    hra: raw.hra || 0,
    cca: 0,
    special_allowance: raw.special_allowance || 0,
    other_allowances: raw.other_allowances || 0,
  };
};
