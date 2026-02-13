import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface PayslipPDFData {
  employee_name: string;
  employee_id: string;
  designation: string;
  department?: string;
  institution_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_branch?: string;
  month: number;
  year: number;
  basic_salary: number;
  hra: number;
  conveyance_allowance: number;
  medical_allowance: number;
  special_allowance: number;
  overtime_pay: number;
  overtime_hours: number;
  other_earnings?: number;
  pf_deduction: number;
  professional_tax: number;
  tds: number;
  esi?: number;
  lop_deduction: number;
  days_lop: number;
  other_deductions?: number;
  working_days: number;
  days_present: number;
  paid_leave_days: number;
  lop_leave_days: number;
  late_days: number;
  gross_earnings: number;
  total_deductions: number;
  net_pay: number;
}

interface PayslipPDFProps {
  data: PayslipPDFData;
  companyName: string;
  companyAddress: string;
  logoUrl?: string | null;
}

const safe = (v: number | undefined | null) => (typeof v === 'number' && !isNaN(v) ? v : 0);
const fmtIndian = (n: number): string => {
  const val = safe(n).toFixed(2);
  const [intPart, decPart] = val.split('.');
  const isNeg = intPart.startsWith('-');
  const digits = isNeg ? intPart.slice(1) : intPart;
  let formatted = '';
  if (digits.length <= 3) {
    formatted = digits;
  } else {
    formatted = digits.slice(-3);
    let remaining = digits.slice(0, -3);
    while (remaining.length > 2) {
      formatted = remaining.slice(-2) + ',' + formatted;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) formatted = remaining + ',' + formatted;
  }
  return (isNeg ? '-' : '') + '\u20B9' + formatted + '.' + decPart;
};
const fmt = fmtIndian;

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica', color: '#1a1a1a' },
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#1a1a1a' },
  logo: { width: 44, height: 44, objectFit: 'contain', marginRight: 8 },
  companyName: { fontSize: 14, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  companyAddr: { fontSize: 7, color: '#666', marginTop: 2, maxWidth: 220 },
  badge: { backgroundColor: '#1d4ed8', color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 3, letterSpacing: 2, textAlign: 'center' },
  monthText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#444', marginTop: 4, textAlign: 'right' },
  // Employee details
  detailsTable: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 6 },
  detailRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e5e5e5' },
  detailLabel: { width: '15%', paddingVertical: 4, paddingHorizontal: 8, fontSize: 8, color: '#888', fontFamily: 'Helvetica-Bold' },
  detailValue: { width: '35%', paddingVertical: 4, paddingHorizontal: 4, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#333' },
  detailLabelR: { width: '15%', paddingVertical: 4, paddingHorizontal: 8, fontSize: 8, color: '#888', fontFamily: 'Helvetica-Bold', borderLeftWidth: 0.5, borderLeftColor: '#e5e5e5' },
  detailValueR: { width: '35%', paddingVertical: 4, paddingHorizontal: 4, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#333' },
  // Earnings / Deductions columns
  columnsRow: { flexDirection: 'row' },
  column: { width: '50%' },
  columnHeaderEarn: { backgroundColor: '#f0fdf4', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  columnHeaderDed: { backgroundColor: '#fde8e8', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  columnHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, paddingHorizontal: 8 },
  lineItemAlt: { backgroundColor: '#f9f9f9' },
  lineLabel: { fontSize: 8, color: '#555' },
  lineAmount: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#222' },
  totalRowEarn: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#f0fdf4', borderTopWidth: 0.5, borderTopColor: '#86efac' },
  totalRowDed: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#fde8e8', borderTopWidth: 0.5, borderTopColor: '#e53e3e' },
  totalLabelEarn: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#15803d' },
  totalLabelDed: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#7b1a1a' },
  // Net Pay
  netPayBox: { backgroundColor: '#1a1a2e', borderRadius: 6, padding: 12, marginHorizontal: 8, marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netPayLabel: { fontSize: 7, color: '#a0b4d0', textTransform: 'uppercase', letterSpacing: 1 },
  netPayAmount: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginTop: 2 },
  netPaySide: { fontSize: 8, color: '#ffffff', fontFamily: 'Helvetica-Bold', textAlign: 'right', marginBottom: 2 },
  // Attendance
  attendanceTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginHorizontal: 8 },
  attendanceRow: { flexDirection: 'row', marginHorizontal: 8, gap: 6 },
  attendanceBox: { flex: 1, borderRadius: 4, padding: 6, alignItems: 'center' },
  attendanceValue: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  attendanceLabel: { fontSize: 6, color: '#888', marginTop: 1 },
  // Footer
  footer: { textAlign: 'center', fontSize: 7, color: '#aaa', marginTop: 12, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#e5e5e5', marginHorizontal: 8 },
});

export function PayslipPDF({ data, companyName, companyAddress, logoUrl }: PayslipPDFProps) {
  const monthName = format(new Date(data.year, data.month - 1), 'MMMM yyyy');

  const earnings = [
    { label: 'Basic Salary', amount: safe(data.basic_salary) },
    { label: 'House Rent Allowance (HRA)', amount: safe(data.hra) },
    { label: 'Conveyance Allowance', amount: safe(data.conveyance_allowance) },
    { label: 'Medical Allowance', amount: safe(data.medical_allowance) },
    { label: 'Special Allowance', amount: safe(data.special_allowance) },
    ...(safe(data.overtime_pay) > 0 ? [{ label: `Overtime Pay (${safe(data.overtime_hours)}h)`, amount: safe(data.overtime_pay) }] : []),
    ...(safe(data.other_earnings) > 0 ? [{ label: 'Other Earnings', amount: safe(data.other_earnings) }] : []),
  ];

  const deductions = [
    { label: 'Provident Fund (PF)', amount: safe(data.pf_deduction) },
    { label: 'Professional Tax', amount: safe(data.professional_tax) },
    { label: 'Tax Deducted at Source (TDS)', amount: safe(data.tds) },
    ...(safe(data.esi) > 0 ? [{ label: 'ESI', amount: safe(data.esi) }] : []),
    ...(safe(data.lop_deduction) > 0 ? [{ label: `LOP Deduction (${safe(data.days_lop)} days)`, amount: safe(data.lop_deduction) }] : []),
    ...(safe(data.other_deductions) > 0 ? [{ label: 'Other Deductions', amount: safe(data.other_deductions) }] : []),
  ];

  const maxRows = Math.max(earnings.length, deductions.length);

  const attendance = [
    { label: 'Working Days', value: safe(data.working_days), bg: '#f3f4f6', color: '#333' },
    { label: 'Present', value: safe(data.days_present), bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Paid Leave', value: safe(data.paid_leave_days), bg: '#eff6ff', color: '#2563eb' },
    { label: 'LOP', value: safe(data.lop_leave_days), bg: '#fef2f2', color: '#dc2626' },
    { label: 'Late', value: safe(data.late_days), bg: '#fff7ed', color: '#ea580c' },
    { label: 'OT Hours', value: Number(safe(data.overtime_hours || 0).toFixed(1)), bg: '#faf5ff', color: '#9333ea' },
  ];

  return (
    <Document title={`Payslip_${data.employee_name}_${monthName}`} author={companyName}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            
            <View>
              <Text style={s.companyName}>{companyName}</Text>
              <Text style={s.companyAddr}>{companyAddress}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.badge}>SALARY SLIP</Text>
            <Text style={s.monthText}>{monthName}</Text>
          </View>
        </View>

        {/* Employee Details */}
        <View style={s.detailsTable}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Employee Name</Text>
            <Text style={s.detailValue}>{data.employee_name}</Text>
            <Text style={s.detailLabelR}>Employee ID</Text>
            <Text style={s.detailValueR}>{data.employee_id}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Designation</Text>
            <Text style={s.detailValue}>{data.designation}</Text>
            <Text style={s.detailLabelR}>Institution</Text>
            <Text style={s.detailValueR}>{data.institution_name || '-'}</Text>
          </View>
          {(data.bank_name || data.bank_account_number) && (
            <>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Bank Name</Text>
                <Text style={s.detailValue}>{data.bank_name || '-'}</Text>
                <Text style={s.detailLabelR}>Account No.</Text>
                <Text style={s.detailValueR}>{data.bank_account_number || '-'}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>IFSC Code</Text>
                <Text style={s.detailValue}>{data.bank_ifsc || '-'}</Text>
                <Text style={s.detailLabelR}>Branch</Text>
                <Text style={s.detailValueR}>{data.bank_branch || '-'}</Text>
              </View>
            </>
          )}
        </View>

        {/* Earnings & Deductions */}
        <View style={s.columnsRow}>
          {/* Earnings */}
          <View style={[s.column, { borderRightWidth: 0.5, borderRightColor: '#ccc' }]}>
            <View style={s.columnHeaderEarn}>
              <Text style={[s.columnHeaderText, { color: '#15803d' }]}>Earnings</Text>
            </View>
            {Array.from({ length: maxRows }).map((_, i) => {
              const item = earnings[i];
              return (
                <View key={`e-${i}`} style={[s.lineItem, i % 2 !== 0 && s.lineItemAlt]}>
                  <Text style={s.lineLabel}>{item?.label || ''}</Text>
                  <Text style={s.lineAmount}>{item ? fmt(item.amount) : ''}</Text>
                </View>
              );
            })}
            <View style={s.totalRowEarn}>
              <Text style={s.totalLabelEarn}>GROSS EARNINGS</Text>
              <Text style={s.totalLabelEarn}>{fmt(safe(data.gross_earnings))}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={s.column}>
            <View style={s.columnHeaderDed}>
              <Text style={[s.columnHeaderText, { color: '#7b1a1a' }]}>Deductions</Text>
            </View>
            {Array.from({ length: maxRows }).map((_, i) => {
              const item = deductions[i];
              return (
                <View key={`d-${i}`} style={[s.lineItem, i % 2 !== 0 && s.lineItemAlt]}>
                  <Text style={s.lineLabel}>{item?.label || ''}</Text>
                  <Text style={s.lineAmount}>{item ? fmt(item.amount) : ''}</Text>
                </View>
              );
            })}
            <View style={s.totalRowDed}>
              <Text style={s.totalLabelDed}>TOTAL DEDUCTIONS</Text>
              <Text style={s.totalLabelDed}>{fmt(safe(data.total_deductions))}</Text>
            </View>
          </View>
        </View>

        {/* Net Pay */}
        <View style={s.netPayBox}>
          <View>
            <Text style={s.netPayLabel}>Net Payable Amount</Text>
            <Text style={s.netPayAmount}>{fmt(safe(data.net_pay))}</Text>
          </View>
          <View>
            <Text style={s.netPaySide}>Gross: {fmt(safe(data.gross_earnings))}</Text>
            <Text style={s.netPaySide}>Deductions: {fmt(safe(data.total_deductions))}</Text>
          </View>
        </View>

        {/* Attendance Summary */}
        <Text style={s.attendanceTitle}>Attendance Summary</Text>
        <View style={s.attendanceRow}>
          {attendance.map((stat) => (
            <View key={stat.label} style={[s.attendanceBox, { backgroundColor: stat.bg }]}>  
              <Text style={[s.attendanceValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.attendanceLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text>This is a computer-generated payslip and does not require a signature.</Text>
          <Text style={{ marginTop: 2 }}>Generated on {format(new Date(), 'dd MMM yyyy, HH:mm')}</Text>
        </View>
      </Page>
    </Document>
  );
}
