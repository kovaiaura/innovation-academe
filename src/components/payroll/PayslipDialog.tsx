/**
 * Payslip Dialog Component
 * Professional Zoho-style payslip view with PDF export capability
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/attendanceHelpers';

interface PayslipData {
  employee_name: string;
  employee_id: string;
  designation: string;
  department?: string;
  institution_name?: string;
  pan?: string;
  bank_account?: string;
  month: number;
  year: number;
  pay_date?: string;
  basic_salary: number;
  hra: number;
  conveyance_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  overtime_pay: number;
  other_earnings?: number;
  pf_deduction: number;
  professional_tax: number;
  tds: number;
  esi?: number;
  lop_deduction: number;
  other_deductions?: number;
  working_days: number;
  days_present: number;
  days_leave: number;
  paid_leave_days: number;
  lop_leave_days: number;
  unmarked_days: number;
  days_lop: number;
  late_days: number;
  overtime_hours: number;
  total_hours_worked: number;
  gross_earnings: number;
  total_deductions: number;
  net_pay: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_branch?: string;
}

interface CompanyProfile {
  company_name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  logo_url?: string;
}

interface PayslipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslipData: PayslipData | null;
  companyProfile?: CompanyProfile | null;
}

const safe = (v: number | undefined | null) => (typeof v === 'number' && !isNaN(v) ? v : 0);

// Print-specific styles injected into the page
const printStyles = `
@media print {
  @page {
    size: A4;
    margin: 10mm;
  }
  /* Hide everything except payslip */
  body > *:not(#payslip-print-root) {
    display: none !important;
  }
  /* Remove dialog backdrop and chrome */
  [data-radix-dialog-overlay],
  [role="dialog"] > button,
  .print-hidden {
    display: none !important;
  }
  [role="dialog"] {
    position: static !important;
    transform: none !important;
    max-width: none !important;
    max-height: none !important;
    width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    background: white !important;
  }
  #payslip-print-area {
    width: 100% !important;
    max-width: none !important;
    max-height: none !important;
    overflow: visible !important;
    break-inside: avoid;
  }
  a {
    text-decoration: none !important;
    color: inherit !important;
    pointer-events: none !important;
  }
  /* Force print backgrounds */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
`;

export function PayslipDialog({
  open,
  onOpenChange,
  payslipData,
  companyProfile,
}: PayslipDialogProps) {
  if (!payslipData) return null;

  const companyName = companyProfile?.company_name || 'Company Name';
  const companyAddress = [
    companyProfile?.address,
    companyProfile?.city,
    companyProfile?.state,
    companyProfile?.pincode,
  ].filter(Boolean).join(', ') || 'Address';
  const logoUrl = companyProfile?.logo_url;

  const monthName = format(new Date(payslipData.year, payslipData.month - 1), 'MMMM yyyy');

  const earnings = [
    { label: 'Basic Salary', amount: safe(payslipData.basic_salary) },
    { label: 'House Rent Allowance (HRA)', amount: safe(payslipData.hra) },
    { label: 'Conveyance Allowance', amount: safe(payslipData.conveyance_allowance) },
    { label: 'Medical Allowance', amount: safe(payslipData.medical_allowance) },
    { label: 'Special Allowance', amount: safe(payslipData.special_allowance) },
    ...(safe(payslipData.overtime_pay) > 0 ? [{ label: `Overtime Pay (${safe(payslipData.overtime_hours)}h)`, amount: safe(payslipData.overtime_pay) }] : []),
    ...(safe(payslipData.other_earnings) > 0 ? [{ label: 'Other Earnings', amount: safe(payslipData.other_earnings) }] : []),
  ];

  const deductions = [
    { label: 'Provident Fund (PF)', amount: safe(payslipData.pf_deduction) },
    { label: 'Professional Tax', amount: safe(payslipData.professional_tax) },
    { label: 'Tax Deducted at Source (TDS)', amount: safe(payslipData.tds) },
    ...(safe(payslipData.esi) > 0 ? [{ label: 'ESI', amount: safe(payslipData.esi) }] : []),
    ...(safe(payslipData.lop_deduction) > 0 ? [{ label: `LOP Deduction (${safe(payslipData.days_lop)} days)`, amount: safe(payslipData.lop_deduction) }] : []),
    ...(safe(payslipData.other_deductions) > 0 ? [{ label: 'Other Deductions', amount: safe(payslipData.other_deductions) }] : []),
  ];

  const grossEarnings = safe(payslipData.gross_earnings);
  const totalDeductions = safe(payslipData.total_deductions);
  const netPay = safe(payslipData.net_pay);

  const maxRows = Math.max(earnings.length, deductions.length);

  // Always show bank details section

  const handleDownload = () => {
    window.print();
  };

  const attendanceStats = [
    { label: 'Working Days', value: safe(payslipData.working_days), color: 'text-gray-800', bg: 'bg-gray-100' },
    { label: 'Present', value: safe(payslipData.days_present), color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Paid Leave', value: safe(payslipData.paid_leave_days), color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'LOP', value: safe(payslipData.lop_leave_days), color: 'text-red-700', bg: 'bg-red-50' },
    { label: 'Late', value: safe(payslipData.late_days), color: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'OT Hours', value: Number(safe(payslipData.overtime_hours).toFixed(1)), color: 'text-purple-700', bg: 'bg-purple-50' },
  ];

  return (
    <>
      <style>{printStyles}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:border-none print:shadow-none">
          <DialogHeader className="print-hidden">
            <DialogTitle>Payslip - {monthName}</DialogTitle>
          </DialogHeader>

          <div id="payslip-print-area" className="bg-white text-black rounded-lg border border-gray-300 print:border-none print:shadow-none" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b-2 border-gray-800">
              <div className="flex items-start gap-3">
                {logoUrl && (
                  <img src={logoUrl} alt="Company Logo" className="h-14 w-14 object-contain rounded" />
                )}
                <div>
                  <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wide">{companyName}</h1>
                  <p className="text-xs text-gray-500 mt-0.5 max-w-[280px]">{companyAddress}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block border-2 border-gray-800 text-gray-800 text-xs font-bold px-3 py-1.5 rounded tracking-widest">
                  SALARY SLIP
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-2">{monthName}</p>
              </div>
            </div>

            {/* Employee Details */}
            <div className="border-b border-gray-300">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-500 font-medium w-[120px]">Employee Name</td>
                    <td className="py-2 px-2 font-semibold text-gray-800">{payslipData.employee_name}</td>
                    <td className="py-2 px-4 text-gray-500 font-medium w-[120px] border-l border-gray-200">Employee ID</td>
                    <td className="py-2 px-2 font-semibold text-gray-800">{payslipData.employee_id}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-gray-500 font-medium">Designation</td>
                    <td className="py-2 px-2 font-semibold text-gray-800">{payslipData.designation}</td>
                    <td className="py-2 px-4 text-gray-500 font-medium border-l border-gray-200">Institution</td>
                    <td className="py-2 px-2 font-semibold text-gray-800">{payslipData.institution_name || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Earnings & Deductions - Side by Side Table */}
            <div className="grid grid-cols-2">
              {/* Earnings */}
              <div className="border-r border-gray-300">
                <div className="bg-green-50 px-4 py-2 border-b border-gray-300">
                  <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Earnings</span>
                </div>
                {earnings.map((item, i) => (
                  <div key={i} className={`flex justify-between px-4 py-1.5 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {Array.from({ length: maxRows - earnings.length }).map((_, i) => (
                  <div key={`e-pad-${i}`} className={`px-4 py-1.5 text-xs ${(earnings.length + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>&nbsp;</div>
                ))}
                <div className="flex justify-between px-4 py-2 bg-green-50 border-t border-green-300">
                  <span className="text-xs font-bold text-green-800">GROSS EARNINGS</span>
                  <span className="text-xs font-bold text-green-800">{formatCurrency(grossEarnings)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <div className="bg-red-50 px-4 py-2 border-b border-gray-300">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Deductions</span>
                </div>
                {deductions.map((item, i) => (
                  <div key={i} className={`flex justify-between px-4 py-1.5 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {Array.from({ length: maxRows - deductions.length }).map((_, i) => (
                  <div key={`d-pad-${i}`} className={`px-4 py-1.5 text-xs ${(deductions.length + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>&nbsp;</div>
                ))}
                <div className="flex justify-between px-4 py-2 bg-red-50 border-t border-red-300">
                  <span className="text-xs font-bold text-red-800">TOTAL DEDUCTIONS</span>
                  <span className="text-xs font-bold text-red-800">{formatCurrency(totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay - High contrast for print */}
            <div className="mx-4 my-4 border-2 border-gray-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-100">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-600 font-bold">Net Payable Amount</p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900">{formatCurrency(netPay)}</p>
                </div>
                <div className="text-right text-xs space-y-0.5">
                  <p className="text-gray-700 font-medium">Gross: <span className="text-green-800 font-bold">{formatCurrency(grossEarnings)}</span></p>
                  <p className="text-gray-700 font-medium">Deductions: <span className="text-red-800 font-bold">{formatCurrency(totalDeductions)}</span></p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="mx-4 mb-3 border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-300">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Bank Details</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1.5 px-4 text-gray-500 font-medium w-[120px]">Bank Name</td>
                    <td className="py-1.5 px-2 font-semibold text-gray-800">{payslipData.bank_name || '-'}</td>
                    <td className="py-1.5 px-4 text-gray-500 font-medium w-[120px] border-l border-gray-200">Account No.</td>
                    <td className="py-1.5 px-2 font-semibold text-gray-800">{payslipData.bank_account_number || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-4 text-gray-500 font-medium">IFSC Code</td>
                    <td className="py-1.5 px-2 font-semibold text-gray-800">{payslipData.bank_ifsc || '-'}</td>
                    <td className="py-1.5 px-4 text-gray-500 font-medium border-l border-gray-200">Branch</td>
                    <td className="py-1.5 px-2 font-semibold text-gray-800">{payslipData.bank_branch || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Attendance Summary */}
            <div className="px-4 pb-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Attendance Summary</p>
              <div className="grid grid-cols-6 gap-2">
                {attendanceStats.map((stat) => (
                  <div key={stat.label} className={`${stat.bg} rounded p-2 text-center border border-gray-200`}>
                    <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[9px] text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-gray-400 py-3 border-t border-gray-200 mx-4">
              <p>This is a computer-generated payslip and does not require a signature.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 print-hidden">
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
