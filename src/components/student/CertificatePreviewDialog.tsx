import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CertificateData } from '@/utils/certificateGenerator';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface CertificatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: CertificateData | null;
}

export function CertificatePreviewDialog({
  open,
  onOpenChange,
  certificate
}: CertificatePreviewDialogProps) {
  if (!certificate) return null;

  const handleDownload = () => {
    // In production, this would generate and download actual PDF
    toast.success('Certificate download started!');
    window.print();
  };

  const handleShare = () => {
    const text = `I've completed ${certificate.course_title}! 🎓`;
    const url = `https://verify-certificate.com/${certificate.verification_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Certificate',
        text,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success('Certificate link copied to clipboard!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificate of Completion</DialogTitle>
        </DialogHeader>

        <div className="certificate-preview border-4 border-primary/20 rounded-lg p-12 bg-gradient-to-br from-background to-muted">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="border-b-2 border-primary/20 pb-6">
              <h2 className="text-3xl font-bold text-primary mb-2">
                {certificate.institution_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                In collaboration with ATL Innovation Mission
              </p>
            </div>

            {/* Certificate Type */}
            <div>
              <h1 className="text-4xl font-serif text-primary mb-2">
                Certificate of Completion
              </h1>
              <p className="text-muted-foreground">This is to certify that</p>
            </div>

            {/* Student Name */}
            <div className="py-4">
              <p className="text-5xl font-bold tracking-wide border-b-2 border-primary inline-block px-8 pb-2">
                {certificate.student_name}
              </p>
            </div>

            {/* Course Details */}
            <div className="space-y-2">
              <p className="text-muted-foreground">has successfully completed the course</p>
              <h3 className="text-2xl font-semibold text-primary">
                {certificate.course_title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Course Code: {certificate.course_code}
              </p>
              {certificate.grade && (
                <p className="text-lg font-semibold text-primary mt-2">
                  Grade: {certificate.grade}
                </p>
              )}
            </div>

            {/* Date and Signature */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-primary/20">
              <div className="text-left">
                <p className="text-sm text-muted-foreground mb-2">Date of Completion</p>
                <p className="font-semibold">
                  {new Date(certificate.completion_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Issued By</p>
                <p className="font-semibold">{certificate.issued_by}</p>
                <p className="text-xs text-muted-foreground">Innovation Officer</p>
              </div>
            </div>

            {/* QR Code and Verification */}
            <div className="pt-6 border-t-2 border-primary/20">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <img 
                    src={certificate.qr_code_url} 
                    alt="QR Code" 
                    className="w-24 h-24 border-2 border-primary/20 rounded"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Verification Code</p>
                  <p className="font-mono text-sm font-semibold">
                    {certificate.verification_code}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scan QR code to verify authenticity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
