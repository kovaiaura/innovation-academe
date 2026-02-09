import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Header
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 15,
  },
  
  // Logo styles
  logoContainer: {
    width: 120,
    marginBottom: 10,
  },
  logo: {
    maxWidth: 120,
    maxHeight: 60,
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
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyBox: {
    width: '55%',
  },
  companyName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a2e',
  },
  companyDetail: {
    fontSize: 9,
    marginBottom: 2,
    color: '#444444',
  },
  
  // Invoice Details Box
  invoiceDetailsBox: {
    width: '40%',
    border: '1 solid #e0e0e0',
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  invoiceDetailLabel: {
    width: 100,
    fontSize: 9,
    color: '#666666',
  },
  invoiceDetailValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
  
  // Parties Section
  partiesSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  partyBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginRight: 10,
  },
  partyBoxLast: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  partyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a2e',
  },
  partyDetail: {
    fontSize: 9,
    marginBottom: 2,
    color: '#444444',
  },
  
  // Table
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 28,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 28,
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
  
  // Column widths for table - adjusted for better visibility
  colSNo: { width: '5%', textAlign: 'center' },
  colDesc: { width: '35%', paddingRight: 4 },
  colHSN: { width: '10%', textAlign: 'center' },
  colQty: { width: '8%', textAlign: 'right' },
  colUnit: { width: '7%', textAlign: 'center' },
  colRate: { width: '12%', textAlign: 'right' },
  colTax: { width: '10%', textAlign: 'right' },
  colAmount: { width: '13%', textAlign: 'right' },
  
  // Totals Section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  totalsBox: {
    width: 280,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  totalRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 10,
    marginTop: 4,
    borderRadius: 2,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalValue: {
    fontSize: 10,
    color: '#1a1a2e',
  },
  totalLabelBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValueBold: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Amount in Words
  amountInWords: {
    backgroundColor: '#f0f4f8',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  amountInWordsLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2,
  },
  amountInWordsValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  
  // Footer Section
  footerSection: {
    flexDirection: 'row',
    marginTop: 10,
  },
  bankDetailsBox: {
    flex: 1,
    marginRight: 15,
  },
  notesBox: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 6,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  bankDetail: {
    fontSize: 9,
    marginBottom: 3,
    color: '#444444',
  },
  notes: {
    fontSize: 9,
    color: '#444444',
    lineHeight: 1.5,
  },
  
  // Terms Section
  termsSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  termsText: {
    fontSize: 8,
    color: '#666666',
    lineHeight: 1.5,
  },
  
  // Signature
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 30,
  },
  signatureBox: {
    width: 180,
    textAlign: 'center',
  },
  signatureImage: {
    width: 100,
    height: 50,
    marginBottom: 5,
    marginTop: 10,
    objectFit: 'contain',
    alignSelf: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    marginBottom: 5,
    marginTop: 40,
  },
  signatureText: {
    fontSize: 9,
    color: '#666666',
  },
  signatureCompany: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 3,
  },
  
  // E-Invoice Section
  eInvoiceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 15,
  },
  eInvoiceLabel: {
    fontSize: 8,
    color: '#2e7d32',
  },
  eInvoiceValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  
  // Separator
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginVertical: 10,
  },
  
  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 8,
    textAlign: 'center',
    color: '#999999',
  },
});
