import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles } from './InvoicePDFStyles';
import { formatCurrency, formatDate } from '@/services/pdf.service';
import type { Payment } from '@/types/payment';
import type { Invoice } from '@/types/invoice';

interface PaymentReceiptPDFProps {
  payment: Payment;
  invoice: Invoice;
  companyLogo?: string;
  receiptNumber?: string;
}

export function PaymentReceiptPDF({
  payment,
  invoice,
  companyLogo,
  receiptNumber,
}: PaymentReceiptPDFProps) {
  const paymentModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      bank_transfer: 'Bank Transfer (NEFT/RTGS/IMPS)',
      cheque: 'Cheque',
      upi: 'UPI',
      cash: 'Cash',
      card: 'Credit/Debit Card',
      online: 'Online Payment',
    };
    return labels[mode] || mode;
  };

  return (
    <Document
      title={`Payment Receipt - ${receiptNumber || payment.id.slice(0, 8)}`}
      author={invoice.from_company_name}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PAYMENT RECEIPT</Text>
          <Text style={styles.subtitle}>
            Receipt No: {receiptNumber || `PR-${payment.id.slice(0, 8).toUpperCase()}`}
          </Text>
        </View>

        {/* Company Info */}
        <View style={styles.companySection}>
          <View style={styles.companyBox}>
            {companyLogo && (
              <Image src={companyLogo} style={{ width: 80, height: 40, marginBottom: 8 }} />
            )}
            <Text style={styles.companyName}>{invoice.from_company_name}</Text>
            <Text style={styles.companyDetail}>{invoice.from_company_address}</Text>
            <Text style={styles.companyDetail}>
              {invoice.from_company_city}, {invoice.from_company_state} - {invoice.from_company_pincode}
            </Text>
            {invoice.from_company_gstin && (
              <Text style={styles.companyDetail}>GSTIN: {invoice.from_company_gstin}</Text>
            )}
          </View>
          <View style={styles.invoiceDetailsBox}>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Receipt Date:</Text>
              <Text style={styles.invoiceDetailValue}>
                {formatDate(payment.payment_date)}
              </Text>
            </View>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Invoice No:</Text>
              <Text style={styles.invoiceDetailValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Invoice Date:</Text>
              <Text style={styles.invoiceDetailValue}>
                {formatDate(invoice.invoice_date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Received From */}
        <View style={[styles.partyBox, { marginBottom: 20 }]}>
          <Text style={styles.partyLabel}>Received From</Text>
          <Text style={styles.partyName}>{invoice.to_company_name}</Text>
          {invoice.to_company_address && (
            <Text style={styles.partyDetail}>{invoice.to_company_address}</Text>
          )}
          <Text style={styles.partyDetail}>
            {[invoice.to_company_city, invoice.to_company_state, invoice.to_company_pincode]
              .filter(Boolean)
              .join(', ')}
          </Text>
          {invoice.to_company_gstin && (
            <Text style={styles.partyDetail}>GSTIN: {invoice.to_company_gstin}</Text>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: '30%', textAlign: 'center' }]}>
              Payment Mode
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>
              Amount
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '40%' }]}>
              Payment against Invoice {invoice.invoice_number}
            </Text>
            <Text style={[styles.tableCell, { width: '30%', textAlign: 'center' }]}>
              {paymentModeLabel(payment.payment_mode)}
            </Text>
            <Text style={[styles.tableCellBold, { width: '30%', textAlign: 'right' }]}>
              {formatCurrency(payment.amount)}
            </Text>
          </View>
          {payment.tds_deducted && payment.tds_amount > 0 && (
            <View style={styles.tableRowAlt}>
              <Text style={[styles.tableCell, { width: '40%' }]}>TDS Deducted</Text>
              <Text style={[styles.tableCell, { width: '30%', textAlign: 'center' }]}>-</Text>
              <Text style={[styles.tableCell, { width: '30%', textAlign: 'right' }]}>
                {formatCurrency(payment.tds_amount)}
              </Text>
            </View>
          )}
        </View>

        {/* Reference Details */}
        {(payment.reference_number || payment.cheque_number || payment.bank_name) && (
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Reference Details</Text>
            {payment.reference_number && (
              <Text style={styles.bankDetail}>
                Reference/Transaction No: {payment.reference_number}
              </Text>
            )}
            {payment.cheque_number && (
              <Text style={styles.bankDetail}>Cheque No: {payment.cheque_number}</Text>
            )}
            {payment.bank_name && (
              <Text style={styles.bankDetail}>Bank: {payment.bank_name}</Text>
            )}
          </View>
        )}

        {/* Total Received */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRowLast}>
              <Text style={styles.totalLabelBold}>Total Received</Text>
              <Text style={styles.totalValueBold}>{formatCurrency(payment.amount)}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Summary */}
        <View style={styles.amountInWords}>
          <Text style={styles.amountInWordsLabel}>Invoice Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 8 }}>Invoice Amount: {formatCurrency(invoice.total_amount)}</Text>
            <Text style={{ fontSize: 8 }}>Total Paid: {formatCurrency(invoice.amount_paid || 0)}</Text>
            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>
              Balance Due: {formatCurrency(invoice.total_amount - (invoice.amount_paid || 0))}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {payment.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{payment.notes}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Authorized Signatory</Text>
            <Text style={styles.signatureCompany}>{invoice.from_company_name}</Text>
          </View>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

export default PaymentReceiptPDF;
