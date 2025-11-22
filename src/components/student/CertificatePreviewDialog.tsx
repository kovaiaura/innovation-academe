import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StudentCertificate } from '@/types/gamification';
import { mockCertificateTemplates } from '@/data/mockCertificateTemplates';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface CertificatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: StudentCertificate;
}

export function CertificatePreviewDialog({
  open,
  onOpenChange,
  certificate
}: CertificatePreviewDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open && certificate) {
      drawCertificate();
    }
  }, [open, certificate]);

  const drawCertificate = () => {
    const template = mockCertificateTemplates.find(t => t.id === certificate.template_id);
    if (!template || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 900;
      ctx.drawImage(img, 0, 0, 1200, 900);
      
      ctx.font = `${template.name_position.fontSize}px ${template.name_position.fontFamily}`;
      ctx.fillStyle = template.name_position.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(certificate.student_name, template.name_position.x, template.name_position.y);
    };
    img.src = template.template_image_url;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificate.verification_code}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/verify/${certificate.verification_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${certificate.activity_name}`,
          text: `Check out my certificate for ${certificate.activity_name}`,
          url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Certificate link copied to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Certificate Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <canvas ref={canvasRef} className="w-full border rounded" />
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">{certificate.activity_name}</p>
              <p className="text-xs text-muted-foreground">
                Verification Code: {certificate.verification_code}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
