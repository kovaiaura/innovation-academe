import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { styles } from './ActivityReportStyles';
import { Report } from '@/types/report';
import { format } from 'date-fns';
import logoImage from '@/assets/logo.png';

interface ActivityReportPDFProps {
  report: Report;
}

export const ActivityReportPDF = ({ report }: ActivityReportPDFProps) => {
  const reportDate = report.report_date ? new Date(report.report_date) : new Date();
  const formattedDate = format(reportDate, 'dd.MM.yyyy');
  
  // Format attendance as comma-separated percentages
  const attendanceDisplay = report.trainers
    .filter(t => t.attendance !== undefined && t.attendance !== null)
    .map(t => `${t.attendance}%`)
    .join(' | ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo and Date */}
        <View style={styles.header}>
          <Image src={logoImage} style={styles.logo} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{report.report_month.toUpperCase()} Activity Report</Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Client Name */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Client Name</Text>
            <Text style={styles.detailValue}>: {report.client_name}</Text>
          </View>

          {/* Trainers */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trainer(s) Name and Designation</Text>
            <Text style={styles.detailValue}>:</Text>
          </View>
          {report.trainers.map((trainer, index) => (
            <Text key={index} style={styles.trainerItem}>
              • {trainer.name}, {trainer.designation}
            </Text>
          ))}

          {/* Attendance */}
          {attendanceDisplay && (
            <View style={[styles.detailRow, { marginTop: 10 }]}>
              <Text style={styles.detailLabel}>Trainer(s) Attendance</Text>
              <Text style={styles.detailValue}>: {attendanceDisplay}</Text>
            </View>
          )}

          {/* Hours Handled */}
          {report.hours_handled !== undefined && report.hours_handled !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>No. of hours handled</Text>
              <Text style={styles.detailValue}>
                : {report.hours_handled} {report.hours_unit || 'Hours (Sessions Handled)'}
              </Text>
            </View>
          )}

          {/* Portion Covered */}
          {report.portion_covered_percentage !== undefined && report.portion_covered_percentage !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Percentage of portion covered</Text>
              <Text style={styles.detailValue}>: {report.portion_covered_percentage}%</Text>
            </View>
          )}

          {/* Assessments */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>No. of Assessment completed</Text>
            <Text style={styles.detailValue}>: {report.assessments_completed || '-'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Results of assessment</Text>
            <Text style={styles.detailValue}>: {report.assessment_results || '-'}</Text>
          </View>
        </View>

        {/* Activities Table */}
        {report.activities && report.activities.length > 0 && (
          <View style={styles.activitiesSection}>
            <Text style={styles.activitiesTitle}>Details of other activities completed</Text>
            
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.colActivity}>
                  <Text style={styles.tableHeaderCell}>Activity</Text>
                </View>
                <View style={styles.colRemarks}>
                  <Text style={styles.tableHeaderCell}>Remarks</Text>
                </View>
              </View>

              {/* Table Rows */}
              {report.activities.map((activity, index) => (
                <View 
                  key={index} 
                  style={index === report.activities.length - 1 ? styles.tableRowLast : styles.tableRow}
                >
                  <View style={styles.colActivity}>
                    <Text style={styles.tableCell}>{activity.activity}</Text>
                  </View>
                  <View style={styles.colRemarks}>
                    <Text style={styles.tableCell}>{activity.remarks}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>-SD-</Text>
            <Text style={styles.signatureDesignation}>
              {report.signatory_designation || 'AGM - Metasage Alliance'}
            </Text>
            <Text style={styles.signatureName}>
              {report.signatory_name || 'Mr. Vasanthaseelan'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
