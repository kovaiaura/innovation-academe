import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    letterSpacing: 3,
  },
  levelHeading: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  sessionItem: {
    fontSize: 11,
    marginLeft: 16,
    marginBottom: 3,
    color: '#374151',
  },
  bullet: {
    fontFamily: 'Helvetica',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },
});
