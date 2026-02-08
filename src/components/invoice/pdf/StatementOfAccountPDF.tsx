import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles } from './InvoicePDFStyles';
import { formatCurrency, formatDate } from '@/services/pdf.service';
import type { Invoice } from '@/types/invoice';
import type { Payment } from '@/types/payment';

interface StatementOfAccountPDFProps {
  customerName: string;
  customerAddress?: string;
  customerGstin?: string;
  invoices: Invoice[];
  payments: Payment[];
  companyName: string;
  companyAddress?: string;
  companyGstin?: string;
  companyLogo?: string;
  asOfDate: string;
}

export function StatementOfAccountPDF({
  customerName,
  customerAddress,
  customerGstin,
  invoices,
  payments,
  companyName,
  companyAddress,
  companyGstin,
  companyLogo,
  asOfDate,
}: StatementOfAccountPDFProps) {
  // Calculate totals
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  // Combine and sort transactions
  type Transaction = {
    date: string;
    type: 'invoice' | 'payment';
    reference: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  };

  const transactions: Transaction[] = [];
  let runningBalance = 0;

  // Add invoices
  invoices.forEach((inv) => {
    transactions.push({
      date: inv.invoice_date,
      type: 'invoice',
      reference: inv.invoice_number,
      description: 'Invoice',
      debit: inv.total_amount,
      credit: 0,
      balance: 0,
    });
  });

  // Add payments
  payments.forEach((pmt) => {
    const inv = invoices.find((i) => i.id === pmt.invoice_id);
    transactions.push({
      date: pmt.payment_date,
      type: 'payment',
      reference: pmt.reference_number || pmt.id.slice(0, 8),
      description: `Payment - ${inv?.invoice_number || 'N/A'}`,
      debit: 0,
      credit: pmt.amount,
      balance: 0,
    });
  });

  // Sort by date and calculate running balance
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  transactions.forEach((txn) => {
    runningBalance += txn.debit - txn.credit;
    txn.balance = runningBalance;
  });

  return (
    <Document
      title={`Statement of Account - ${customerName}`}
      author={companyName}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>STATEMENT OF ACCOUNT</Text>
          <Text style={styles.subtitle}>As on {formatDate(asOfDate)}</Text>
        </View>

        {/* Company and Customer Info */}
        <View style={styles.companySection}>
          <View style={styles.companyBox}>
            {companyLogo && (
              <Image src={companyLogo} style={{ width: 80, height: 40, marginBottom: 8 }} />
            )}
            <Text style={styles.companyName}>{companyName}</Text>
            {companyAddress && <Text style={styles.companyDetail}>{companyAddress}</Text>}
            {companyGstin && <Text style={styles.companyDetail}>GSTIN: {companyGstin}</Text>}
          </View>
          <View style={styles.invoiceDetailsBox}>
            <Text style={styles.partyLabel}>Statement For</Text>
            <Text style={styles.partyName}>{customerName}</Text>
            {customerAddress && <Text style={styles.partyDetail}>{customerAddress}</Text>}
            {customerGstin && <Text style={styles.partyDetail}>GSTIN: {customerGstin}</Text>}
          </View>
        </View>

        {/* Summary Box */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#e0e0e0',
            borderRadius: 4,
          }}
        >
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRightWidth: 1,
              borderRightColor: '#e0e0e0',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 8, color: '#666666' }}>Total Invoiced</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>
              {formatCurrency(totalInvoiced)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRightWidth: 1,
              borderRightColor: '#e0e0e0',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 8, color: '#666666' }}>Total Paid</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 4, color: '#2e7d32' }}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
          <View style={{ flex: 1, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: '#666666' }}>Balance Outstanding</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                marginTop: 4,
                color: totalOutstanding > 0 ? '#c62828' : '#2e7d32',
              }}
            >
              {formatCurrency(totalOutstanding)}
            </Text>
          </View>
        </View>

        {/* Transaction Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Reference</Text>
            <Text style={[styles.tableHeaderCell, { width: '28%' }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
              Debit
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
              Credit
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
              Balance
            </Text>
          </View>

          {/* Opening Balance */}
          <View style={styles.tableRowAlt}>
            <Text style={[styles.tableCell, { width: '12%' }]}>-</Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>-</Text>
            <Text style={[styles.tableCellBold, { width: '28%' }]}>Opening Balance</Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>-</Text>
            <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>-</Text>
            <Text style={[styles.tableCellBold, { width: '15%', textAlign: 'right' }]}>
              {formatCurrency(0)}
            </Text>
          </View>

          {transactions.map((txn, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={[styles.tableCell, { width: '12%' }]}>
                {formatDate(txn.date)}
              </Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{txn.reference}</Text>
              <Text style={[styles.tableCell, { width: '28%' }]}>{txn.description}</Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                {txn.debit > 0 ? formatCurrency(txn.debit) : '-'}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { width: '15%', textAlign: 'right', color: '#2e7d32' },
                ]}
              >
                {txn.credit > 0 ? formatCurrency(txn.credit) : '-'}
              </Text>
              <Text style={[styles.tableCellBold, { width: '15%', textAlign: 'right' }]}>
                {formatCurrency(txn.balance)}
              </Text>
            </View>
          ))}

          {/* Closing Balance */}
          <View style={[styles.tableRowAlt, { backgroundColor: '#1a1a2e' }]}>
            <Text style={[styles.tableHeaderCell, { width: '12%' }]}></Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}></Text>
            <Text style={[styles.tableHeaderCell, { width: '28%' }]}>Closing Balance</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
              {formatCurrency(totalInvoiced)}
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
              {formatCurrency(totalPaid)}
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
              {formatCurrency(totalOutstanding)}
            </Text>
          </View>
        </View>

        {/* Outstanding Invoices */}
        {invoices.filter((inv) => (inv.total_amount - (inv.amount_paid || 0)) > 0).length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Outstanding Invoices</Text>
            <View style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 4 }}>
              {invoices
                .filter((inv) => (inv.total_amount - (inv.amount_paid || 0)) > 0)
                .map((inv, index) => (
                  <View
                    key={inv.id}
                    style={{
                      flexDirection: 'row',
                      padding: 8,
                      borderBottomWidth:
                        index <
                        invoices.filter((i) => (i.total_amount - (i.amount_paid || 0)) > 0)
                          .length -
                          1
                          ? 1
                          : 0,
                      borderBottomColor: '#e0e0e0',
                    }}
                  >
                    <Text style={{ width: '25%', fontSize: 8 }}>{inv.invoice_number}</Text>
                    <Text style={{ width: '20%', fontSize: 8 }}>
                      {formatDate(inv.invoice_date)}
                    </Text>
                    <Text style={{ width: '20%', fontSize: 8 }}>
                      Due: {inv.due_date ? formatDate(inv.due_date) : 'N/A'}
                    </Text>
                    <Text style={{ width: '15%', fontSize: 8, textAlign: 'right' }}>
                      {formatCurrency(inv.total_amount)}
                    </Text>
                    <Text
                      style={{
                        width: '20%',
                        fontSize: 8,
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: '#c62828',
                      }}
                    >
                      {formatCurrency(inv.total_amount - (inv.amount_paid || 0))}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 7, color: '#666666', textAlign: 'center' }}>
            This is a computer-generated statement and does not require a signature.
          </Text>
          <Text style={{ fontSize: 7, color: '#666666', textAlign: 'center', marginTop: 4 }}>
            For any discrepancies, please contact our accounts department.
          </Text>
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

export default StatementOfAccountPDF;
