/**
 * Payroll Configuration Service
 * Fetch and manage company payroll settings
 */

import { supabase } from '@/integrations/supabase/client';
import { PayrollConfig, DEFAULT_PAYROLL_CONFIG, SalaryStructure, StatutoryInfo } from '@/types/payroll';

// Fetch company payroll configuration
export const getPayrollConfig = async (): Promise<PayrollConfig> => {
  try {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'company_payroll_config')
      .single();
    
    if (error || !data) {
      console.log('Using default payroll config');
      return DEFAULT_PAYROLL_CONFIG;
    }
    
    return data.value as unknown as PayrollConfig;
  } catch (error) {
    console.error('Error fetching payroll config:', error);
    return DEFAULT_PAYROLL_CONFIG;
  }
};

// Update company payroll configuration
export const updatePayrollConfig = async (config: PayrollConfig): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('system_configurations')
      .update({ value: JSON.parse(JSON.stringify(config)), updated_at: new Date().toISOString() })
      .eq('key', 'company_payroll_config');
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating payroll config:', error);
    return false;
  }
};

// Fetch officer salary structure
export const getOfficerSalaryDetails = async (officerId: string): Promise<{
  annualSalary: number;
  monthlySalary: number;
  salaryStructure: SalaryStructure;
  statutoryInfo: StatutoryInfo;
  designation: string | null;
  hourlyRate: number;
  overtimeMultiplier: number;
  bankDetails: { bank_name?: string; bank_account_number?: string; bank_ifsc?: string; bank_branch?: string };
}> => {
  const config = await getPayrollConfig();
  
  const { data, error } = await supabase
    .from('officers')
    .select('annual_salary, salary_structure, statutory_info, designation, hourly_rate, overtime_rate_multiplier, bank_name, bank_account_number, bank_ifsc, bank_branch')
    .eq('id', officerId)
    .single();
  
  if (error) throw error;
  
  const annualSalary = data?.annual_salary || 0;
  
  // Use stored salary structure or calculate from CTC
  let salaryStructure: SalaryStructure;
  let monthlySalary: number;
  
  const rawSS = data?.salary_structure as unknown as Record<string, number> | null;
  // Check if stored structure has meaningful values (sum > 0), also map transport_allowance -> conveyance_allowance
  const hasStoredStructure = rawSS && typeof rawSS === 'object' && Object.keys(rawSS).length > 0;
  const storedSum = hasStoredStructure ? Object.values(rawSS).reduce((s, v) => s + (Number(v) || 0), 0) : 0;
  
  if (hasStoredStructure && storedSum > 0) {
    // Map transport_allowance to conveyance_allowance if needed
    const conveyance = (rawSS.conveyance_allowance || 0) || (rawSS.transport_allowance || 0);
    salaryStructure = {
      basic_pay: rawSS.basic_pay || 0,
      hra: rawSS.hra || 0,
      conveyance_allowance: conveyance,
      medical_allowance: rawSS.medical_allowance || 0,
      special_allowance: rawSS.special_allowance || 0,
      da: rawSS.da || 0,
      transport_allowance: rawSS.transport_allowance || 0,
      other_allowances: rawSS.other_allowances || 0,
    };
    monthlySalary = (salaryStructure.basic_pay || 0) +
      (salaryStructure.hra || 0) +
      (salaryStructure.conveyance_allowance || 0) +
      (salaryStructure.medical_allowance || 0) +
      (salaryStructure.special_allowance || 0) +
      (salaryStructure.da || 0) +
      (salaryStructure.other_allowances || 0);
  } else {
    // Calculate default breakdown from CTC
    monthlySalary = Math.round(annualSalary / 12 * 100) / 100;
    const basic = monthlySalary * (config.salary_components.basic_percentage / 100);
    const hra = monthlySalary * (config.salary_components.hra_percentage / 100);
    const conveyance = config.salary_components.conveyance_allowance;
    const medical = config.salary_components.medical_allowance;
    const special = monthlySalary - basic - hra - conveyance - medical;
    
    salaryStructure = {
      basic_pay: Math.round(basic * 100) / 100,
      hra: Math.round(hra * 100) / 100,
      conveyance_allowance: conveyance,
      medical_allowance: medical,
      special_allowance: Math.round(Math.max(0, special) * 100) / 100,
    };
  }
  
  // Use stored statutory info or defaults
  const statutoryInfo: StatutoryInfo = (data?.statutory_info as unknown as StatutoryInfo) || {
    pf_applicable: true,
    esi_applicable: monthlySalary <= 21000,
    pt_applicable: true,
    pt_state: 'maharashtra',
  };
  
  return {
    annualSalary,
    monthlySalary,
    salaryStructure,
    statutoryInfo,
    designation: data?.designation || null,
    hourlyRate: data?.hourly_rate || (monthlySalary / 22 / 8),
    overtimeMultiplier: data?.overtime_rate_multiplier || config.overtime_settings.default_multiplier,
    bankDetails: {
      bank_name: data?.bank_name || undefined,
      bank_account_number: data?.bank_account_number || undefined,
      bank_ifsc: data?.bank_ifsc || undefined,
      bank_branch: data?.bank_branch || undefined,
    },
  };
};

// Fetch staff salary structure (from profiles table)
export const getStaffSalaryDetails = async (userId: string): Promise<{
  annualSalary: number;
  monthlySalary: number;
  salaryStructure: SalaryStructure;
  statutoryInfo: StatutoryInfo;
  designation: string | null;
  hourlyRate: number;
  overtimeMultiplier: number;
}> => {
  const config = await getPayrollConfig();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('annual_salary, hourly_rate, salary_structure, statutory_info, designation, overtime_rate_multiplier')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  
  // Calculate monthly salary from annual or hourly rate
  const hourlyRate = data?.hourly_rate || 500;
  const annualSalary = data?.annual_salary || (hourlyRate * 8 * 22 * 12);
  
  // Use stored salary structure or calculate from CTC
  let salaryStructure: SalaryStructure;
  let monthlySalary: number;
  
  if (data?.salary_structure && typeof data.salary_structure === 'object' && Object.keys(data.salary_structure).length > 0) {
    salaryStructure = data.salary_structure as unknown as SalaryStructure;
    // Monthly salary = sum of all salary components
    monthlySalary = (salaryStructure.basic_pay || 0) +
      (salaryStructure.hra || 0) +
      (salaryStructure.conveyance_allowance || 0) +
      (salaryStructure.medical_allowance || 0) +
      (salaryStructure.special_allowance || 0) +
      (salaryStructure.da || 0) +
      (salaryStructure.transport_allowance || 0) +
      (salaryStructure.other_allowances || 0);
  } else {
    // Calculate default breakdown from CTC
    monthlySalary = Math.round(annualSalary / 12 * 100) / 100;
    const basic = monthlySalary * (config.salary_components.basic_percentage / 100);
    const hra = monthlySalary * (config.salary_components.hra_percentage / 100);
    const conveyance = config.salary_components.conveyance_allowance;
    const medical = config.salary_components.medical_allowance;
    const special = monthlySalary - basic - hra - conveyance - medical;
    
    salaryStructure = {
      basic_pay: Math.round(basic * 100) / 100,
      hra: Math.round(hra * 100) / 100,
      conveyance_allowance: conveyance,
      medical_allowance: medical,
      special_allowance: Math.round(Math.max(0, special) * 100) / 100,
    };
  }
  
  // Use stored statutory info or defaults
  const statutoryInfo: StatutoryInfo = (data?.statutory_info as unknown as StatutoryInfo) || {
    pf_applicable: true,
    esi_applicable: monthlySalary <= 21000,
    pt_applicable: true,
    pt_state: 'maharashtra',
  };
  
  return {
    annualSalary,
    monthlySalary,
    salaryStructure,
    statutoryInfo,
    designation: data?.designation || null,
    hourlyRate,
    overtimeMultiplier: data?.overtime_rate_multiplier || config.overtime_settings.default_multiplier,
  };
};

// Update officer salary structure
export const updateOfficerSalary = async (
  officerId: string,
  salaryStructure: SalaryStructure,
  statutoryInfo: StatutoryInfo,
  designation?: string
): Promise<boolean> => {
  try {
    const updateData: Record<string, unknown> = {
      salary_structure: salaryStructure,
      statutory_info: statutoryInfo,
      updated_at: new Date().toISOString(),
    };
    
    if (designation !== undefined) {
      updateData.designation = designation;
    }
    
    const { error } = await supabase
      .from('officers')
      .update(updateData)
      .eq('id', officerId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating officer salary:', error);
    return false;
  }
};

// Update staff salary structure
export const updateStaffSalary = async (
  userId: string,
  salaryStructure: SalaryStructure,
  statutoryInfo: StatutoryInfo,
  designation?: string
): Promise<boolean> => {
  try {
    const updateData: Record<string, unknown> = {
      salary_structure: salaryStructure,
      statutory_info: statutoryInfo,
      updated_at: new Date().toISOString(),
    };
    
    if (designation !== undefined) {
      updateData.designation = designation;
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating staff salary:', error);
    return false;
  }
};
