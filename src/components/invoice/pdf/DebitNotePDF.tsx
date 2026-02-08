import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles } from './InvoicePDFStyles';
import { formatCurrency, formatDate } from '@/services/pdf.service';
import type { CreditDebitNote } from '@/types/credit-debit-note';

interface DebitNotePDFProps {
  note: CreditDebitNote;
  companyName: string;
  companyAddress?: string;
  companyGstin?: string;
  companyLogo?: string;
  signatureUrl?: string;
}

export function DebitNotePDF({
  note,
  companyName,
  companyAddress,
  companyGstin,
  companyLogo,
  signatureUrl,
}: DebitNotePDFProps) {
  const isInterState = note.igst_rate > 0;

  return (
    <Document
      title={`Debit Note ${note.note_number}`}
      author={companyName}
      subject={`Debit Note for ${note.customer_name}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DEBIT NOTE</Text>
          <Text style={styles.subtitle}>
            (As per Section 34 of CGST/SGST Act)
          </Text>
        </View>

        {/* Company and Note Details */}
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
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Debit Note No:</Text>
              <Text style={styles.invoiceDetailValue}>{note.note_number}</Text>
            </View>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Date:</Text>
              <Text style={styles.invoiceDetailValue}>{formatDate(note.note_date)}</Text>
            </View>
            {note.original_invoice_id && (
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.invoiceDetailLabel}>Against Invoice:</Text>
                <Text style={styles.invoiceDetailValue}>
                  {note.original_invoice_id.slice(0, 8)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Customer Details */}
        <View style={[styles.partyBox, { marginBottom: 20 }]}>
          <Text style={styles.partyLabel}>Debit Note Issued To</Text>
          <Text style={styles.partyName}>{note.customer_name}</Text>
          {note.customer_address && (
            <Text style={styles.partyDetail}>{note.customer_address}</Text>
          )}
          {note.customer_gstin && (
            <Text style={styles.partyDetail}>GSTIN: {note.customer_gstin}</Text>
          )}
        </View>

        {/* Reason */}
        <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#fff3e0', borderRadius: 4 }}>
          <Text style={{ fontSize: 8, color: '#e65100' }}>Reason for Debit Note:</Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 4, color: '#bf360c' }}>
            {note.reason}
          </Text>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '5%', textAlign: 'center' }]}>#</Text>
            <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>
              HSN/SAC
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Amount</Text>
          </View>
          {note.line_items.map((item, index) => (
            <View
              key={item.id || index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={[styles.tableCell, { width: '5%', textAlign: 'center' }]}>
                {index + 1}
              </Text>
              <Text style={[styles.tableCell, { width: '35%' }]}>{item.description}</Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>
                {item.hsn_sac_code || '-'}
              </Text>
              <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                {formatCurrency(item.rate)}
              </Text>
              <Text style={[styles.tableCellBold, { width: '20%', textAlign: 'right' }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(note.subtotal)}</Text>
            </View>
            {isInterState ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>IGST @{note.igst_rate}%</Text>
                <Text style={styles.totalValue}>{formatCurrency(note.igst_amount)}</Text>
              </View>
            ) : (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>CGST @{note.cgst_rate}%</Text>
                  <Text style={styles.totalValue}>{formatCurrency(note.cgst_amount)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>SGST @{note.sgst_rate}%</Text>
                  <Text style={styles.totalValue}>{formatCurrency(note.sgst_amount)}</Text>
                </View>
              </>
            )}
            <View style={styles.totalRowLast}>
              <Text style={styles.totalLabelBold}>Total Debit Amount</Text>
              <Text style={styles.totalValueBold}>{formatCurrency(note.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {note.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{note.notes}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            {signatureUrl && (
              <Image src={signatureUrl} style={styles.signatureImage} />
            )}
            {!signatureUrl && <View style={styles.signatureLine} />}
            <Text style={styles.signatureText}>Authorized Signatory</Text>
            <Text style={styles.signatureCompany}>{companyName}</Text>
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

export default DebitNotePDF;
