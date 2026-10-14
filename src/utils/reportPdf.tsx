import { pdf } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';
import { ActivityReportPDF } from '@/components/reports/pdf/ActivityReportPDF';
import { Report } from '@/types/report';

export const REPORT_BUCKET = 'activity-reports';

/** Returns the report PDF: the uploaded file if present, otherwise a generated one. */
export async function getReportPdfBlob(report: Report, reportSettings?: any): Promise<Blob> {
  if (report.uploaded_pdf_path) {
    const { data, error } = await supabase.storage.from(REPORT_BUCKET).download(report.uploaded_pdf_path);
    if (error || !data) throw error || new Error('File not found');
    return new Blob([data], { type: 'application/pdf' });
  }
  return pdf(<ActivityReportPDF report={report} reportSettings={reportSettings} />).toBlob();
}

/** Opens a PDF in a new tab. Call synchronously from a click handler. */
export function viewReportPdf(report: Report, reportSettings?: any) {
  const w = window.open('', '_blank');
  getReportPdfBlob(report, reportSettings)
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      if (w) w.location.href = url; else window.location.href = url;
    })
    .catch((e) => {
      w?.close();
      throw e;
    });
}
