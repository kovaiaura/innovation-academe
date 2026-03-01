import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Header
  header: {
    marginBottom: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLogoArea: {
    width: '50%',
  },
  headerTitleArea: {
    width: '50%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 2,
    color: '#0066cc',
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'right',
    color: '#666666',
  },
  
  // Logo styles
  logo: {
    maxWidth: 100,
    maxHeight: 50,
    objectFit: 'contain',
  },
  
  // Row and Column layouts
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  col2: {
    flex: 2,
  },
  
  // Company Info Section
  companySection: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyBox: {
    width: '55%',
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1a1a2e',
  },
  companyDetail: {
    fontSize: 8,
    marginBottom: 1,
    color: '#444444',
  },
  
  // Invoice Details Box
  invoiceDetailsBox: {
    width: '40%',
    border: '0.5 solid #cccccc',
    padding: 8,
    borderRadius: 3,
    backgroundColor: '#fafbfc',
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  invoiceDetailLabel: {
    width: 85,
    fontSize: 8,
    color: '#666666',
  },
  invoiceDetailValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
  
  // Parties Section
  partiesSection: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  partyBox: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 3,
    marginRight: 8,
  },
  partyBoxLast: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 3,
  },
  partyLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  partyName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1a1a2e',
  },
  partyDetail: {
    fontSize: 8,
    marginBottom: 1,
    color: '#444444',
  },
  
  // Table
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 24,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 24,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableCell: {
    fontSize: 9,
    color: '#444444',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  
  // Column widths for table - simplified layout matching sample
  colSNo: { width: '6%', textAlign: 'center' },
  colDescWide: { width: '60%', paddingRight: 4 },
  colHSN: { width: '14%', textAlign: 'center' },
  colAmountWide: { width: '20%', textAlign: 'right' },
  
  // Original column widths (kept for backwards compatibility)
  colDesc: { width: '35%', paddingRight: 4 },
  colQty: { width: '8%', textAlign: 'right' },
  colUnit: { width: '7%', textAlign: 'center' },
  colRate: { width: '12%', textAlign: 'right' },
  colTax: { width: '10%', textAlign: 'right' },
  colAmount: { width: '13%', textAlign: 'right' },
  
  // Totals Section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  totalRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 8,
    marginTop: 3,
    borderRadius: 2,
  },
  totalLabel: {
    fontSize: 9,
    color: '#666666',
  },
  totalValue: {
    fontSize: 9,
    color: '#1a1a2e',
  },
  totalLabelBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValueBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Amount in Words
  amountInWords: {
    backgroundColor: '#f0f4f8',
    padding: 8,
    borderRadius: 3,
    marginBottom: 10,
  },
  amountInWordsLabel: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  amountInWordsValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a2e',
    fontStyle: 'italic',
  },
  
  // Footer Section
  footerSection: {
    flexDirection: 'row',
    marginTop: 8,
  },
  bankDetailsBox: {
    flex: 1,
    marginRight: 12,
  },
  notesBox: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 3,
  },
  bankDetail: {
    fontSize: 8,
    marginBottom: 2,
    color: '#444444',
  },
  notes: {
    fontSize: 8,
    color: '#444444',
    lineHeight: 1.4,
  },
  
  // Terms Section
  termsSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  termsText: {
    fontSize: 7,
    color: '#666666',
    lineHeight: 1.4,
  },
  
  // Signature
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  signatureBox: {
    width: 160,
    textAlign: 'center',
  },
  signatureImage: {
    width: 80,
    height: 40,
    marginBottom: 4,
    marginTop: 8,
    objectFit: 'contain',
    alignSelf: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    marginBottom: 4,
    marginTop: 30,
  },
  signatureText: {
    fontSize: 8,
    color: '#666666',
  },
  signatureCompany: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 2,
  },
  
  // E-Invoice Section
  eInvoiceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    padding: 6,
    borderRadius: 3,
    marginBottom: 10,
  },
  eInvoiceLabel: {
    fontSize: 7,
    color: '#2e7d32',
  },
  eInvoiceValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  
  // Separator
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginVertical: 8,
  },
  
  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    fontSize: 7,
    textAlign: 'center',
    color: '#999999',
  },
});
