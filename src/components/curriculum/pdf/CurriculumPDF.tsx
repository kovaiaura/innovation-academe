import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './CurriculumPDFStyles';
import type { CurriculumLevel } from '../CurriculumDisplay';

interface CurriculumPDFProps {
  data: CurriculumLevel[];
  filterLabel: string;
}

export function CurriculumPDF({ data, filterLabel }: CurriculumPDFProps) {
  return (
    <Document title={`MetaINNOVA Curriculum - ${filterLabel}`}>
      {data.map((level) => (
        <Page key={level.moduleId} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>METAINNOVA CURRICULUM</Text>
          </View>

          <Text style={styles.levelHeading}>{level.moduleTitle.toUpperCase()}</Text>

          {level.courses.map((course) => (
            <View key={course.courseId} wrap={false}>
              <Text style={styles.courseTitle}>{course.courseTitle}</Text>
              {course.sessions
                .sort((a, b) => a.display_order - b.display_order)
                .map((s, idx) => (
                  <Text key={s.id} style={styles.sessionItem}>
                    • Session {idx + 1}: {s.title}
                  </Text>
                ))}
            </View>
          ))}

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </Page>
      ))}
    </Document>
  );
}
