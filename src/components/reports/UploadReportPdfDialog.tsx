import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { REPORT_BUCKET } from '@/utils/reportPdf';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MAX_BYTES = 25 * 1024 * 1024;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UploadReportPdfDialog({ open, onOpenChange, onSuccess }: Props) {
  const now = new Date();
  const [institutionId, setInstitutionId] = useState('');
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [year, setYear] = useState(String(now.getFullYear()));
  const [reportDate, setReportDate] = useState(now.toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [publish, setPublish] = useState(true);
  const [saving, setSaving] = useState(false);

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions-for-report-upload'],
    queryFn: async () => {
      const { data, error } = await supabase.from('institutions').select('id, name, address').order('name');
      if (error) throw error;
      return data as { id: string; name: string; address?: any }[];
    },
    enabled: open,
  });

  const years = Array.from({ length: 6 }, (_, i) => String(now.getFullYear() + 1 - i));

  const reset = () => { setInstitutionId(''); setFile(null); setPublish(true); };

  const handleSubmit = async () => {
    if (!institutionId) return toast.error('Select a school');
    if (!reportDate) return toast.error('Select the submission date');
    if (!file) return toast.error('Choose a PDF file');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return toast.error('Only PDF files are allowed');
    if (file.size > MAX_BYTES) return toast.error('PDF must be 25 MB or smaller');

    const inst = institutions.find(i => i.id === institutionId);
    setSaving(true);
    const path = `${institutionId}/${crypto.randomUUID()}.pdf`;
    try {
      const { error: upErr } = await supabase.storage.from(REPORT_BUCKET).upload(path, file, { contentType: 'application/pdf' });
      if (upErr) throw upErr;
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('reports').insert({
        report_type: 'uploaded',
        report_month: `${month} ${year}`,
        report_date: reportDate,
        institution_id: institutionId,
        client_name: inst?.name || 'Institution',
        trainers: [],
        activities: [],
        status: 'final',
        uploaded_pdf_path: path,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        created_by: userData.user?.id,
      });
      if (error) {
        await supabase.storage.from(REPORT_BUCKET).remove([path]);
        throw error;
      }
      toast.success('Report uploaded');
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      console.error('Upload report failed:', e);
      toast.error('Failed to upload report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Upload Report PDF</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>School</Label>
            <Select value={institutionId} onValueChange={setInstitutionId}>
              <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
              <SelectContent>
                {institutions.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Report month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date of report submission</Label>
            <Input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>PDF file (max 25 MB)</Label>
            <Input type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="publish-now">Publish now (visible to school management)</Label>
            <Switch id="publish-now" checked={publish} onCheckedChange={setPublish} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
