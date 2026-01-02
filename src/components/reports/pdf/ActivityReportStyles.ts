import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  dateText: {
    fontSize: 11,
    color: '#333333',
  },
  
  // Title
  titleSection: {
    textAlign: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textDecoration: 'underline',
  },
  
  // Details Section
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 220,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailValue: {
    flex: 1,
    fontSize: 11,
    color: '#333333',
  },
  
  // Trainer List
  trainerItem: {
    marginLeft: 20,
    fontSize: 11,
    color: '#333333',
    marginBottom: 2,
  },
  
  // Attendance row
  attendanceValue: {
    fontSize: 11,
    color: '#333333',
  },
  
  // Activities Table
  activitiesSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  activitiesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textDecoration: 'underline',
  },
  table: {
    border: '1 solid #333333',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1 solid #333333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #333333',
    minHeight: 30,
  },
  tableRowLast: {
    flexDirection: 'row',
    minHeight: 30,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    padding: 8,
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
    padding: 8,
    textAlign: 'left',
  },
  colActivity: {
    width: '40%',
    borderRight: '1 solid #333333',
  },
  colRemarks: {
    width: '60%',
  },
  
  // Signature Section
  signatureSection: {
    marginTop: 50,
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: 200,
    textAlign: 'center',
  },
  signatureLine: {
    fontSize: 14,
    marginBottom: 5,
  },
  signatureDesignation: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 11,
    color: '#333333',
  },
});
