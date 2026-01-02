import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateOffer } from '@/hooks/useHRManagement';
import { JobApplication, JobPosting } from '@/types/hr';

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication & { job: JobPosting };
}

export function CreateOfferDialog({ open, onOpenChange, application }: CreateOfferDialogProps) {
  const createOffer = useCreateOffer();
  const [formData, setFormData] = useState({
    job_title: application.job?.job_title || '',
    department: application.job?.department || '',
    offered_salary: application.expected_salary || 0,
    joining_date: '',
    probation_period_months: 6,
    benefits: '',
    expiry_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer.mutate({
      application_id: application.id,
      ...formData,
      joining_date: formData.joining_date || undefined,
      expiry_date: formData.expiry_date || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Offer for {application.candidate_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Offered Salary (₹) *</Label>
              <Input type="number" value={formData.offered_salary} onChange={(e) => setFormData({ ...formData, offered_salary: parseFloat(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label>Probation (months)</Label>
              <Input type="number" value={formData.probation_period_months} onChange={(e) => setFormData({ ...formData, probation_period_months: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input type="date" value={formData.joining_date} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Offer Expiry Date</Label>
              <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Benefits</Label>
            <Textarea value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} placeholder="Health insurance, PF, etc." rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Offer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
