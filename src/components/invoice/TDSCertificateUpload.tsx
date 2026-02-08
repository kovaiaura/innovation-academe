import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TDSCertificateUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  existingCertificate?: {
    certificate_number?: string;
    quarter?: string;
    certificate_url?: string;
  };
  onSuccess?: () => void;
}

const QUARTERS = [
  { value: 'Q1', label: 'Q1 (Apr-Jun)' },
  { value: 'Q2', label: 'Q2 (Jul-Sep)' },
  { value: 'Q3', label: 'Q3 (Oct-Dec)' },
  { value: 'Q4', label: 'Q4 (Jan-Mar)' },
];

const FINANCIAL_YEARS = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    const startYear = currentYear - i;
    years.push({
      value: `${startYear}-${startYear + 1}`,
      label: `FY ${startYear}-${(startYear + 1).toString().slice(-2)}`,
    });
  }
  return years;
};

export function TDSCertificateUpload({
  open,
  onOpenChange,
  invoiceId,
  existingCertificate,
  onSuccess,
}: TDSCertificateUploadProps) {
  const [loading, setLoading] = useState(false);
  const [certificateNumber, setCertificateNumber] = useState(
    existingCertificate?.certificate_number || ''
  );
  const [quarter, setQuarter] = useState(existingCertificate?.quarter || '');
  const [financialYear, setFinancialYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState(
    existingCertificate?.certificate_url || ''
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!certificateNumber) {
      toast.error('Please enter certificate number');
      return;
    }
    if (!quarter) {
      toast.error('Please select quarter');
      return;
    }

    setLoading(true);
    try {
      let certificateUrl = uploadedUrl;

      // Upload file if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `tds-certificates/${invoiceId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('invoice-assets')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('invoice-assets')
          .getPublicUrl(fileName);

        certificateUrl = urlData.publicUrl;
      }

      // Update invoice with TDS certificate info
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          tds_certificate_number: certificateNumber,
          tds_quarter: `${quarter} ${financialYear}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      toast.success('TDS Certificate details saved');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving TDS certificate:', error);
      toast.error('Failed to save TDS certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>TDS Certificate Details</DialogTitle>
          <DialogDescription>
            Upload TDS certificate received from the client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Certificate Number */}
          <div>
            <Label>Certificate Number (Form 16A)</Label>
            <Input
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="e.g., AXXXX12345XXXX"
            />
          </div>

          {/* Financial Year */}
          <div>
            <Label>Financial Year</Label>
            <Select value={financialYear} onValueChange={setFinancialYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select financial year" />
              </SelectTrigger>
              <SelectContent>
                {FINANCIAL_YEARS().map((fy) => (
                  <SelectItem key={fy.value} value={fy.value}>
                    {fy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quarter */}
          <div>
            <Label>Quarter</Label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger>
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                {QUARTERS.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <Label>Upload Certificate (PDF/Image)</Label>
            <div className="mt-2">
              {uploadedUrl && !file ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1 truncate">Certificate uploaded</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(uploadedUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedUrl('')}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : file ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload certificate
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Accepted formats: PDF, JPG, PNG (max 5MB)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? 'Saving...' : 'Save Certificate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
