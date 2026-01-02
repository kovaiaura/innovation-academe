import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScheduleInterview } from '@/hooks/useHRManagement';
import { InterviewStage } from '@/types/hr';

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  jobId: string;
  stages: InterviewStage[];
}

export function ScheduleInterviewDialog({ open, onOpenChange, applicationId, jobId, stages }: ScheduleInterviewDialogProps) {
  const scheduleInterview = useScheduleInterview();
  const [formData, setFormData] = useState({
    stage_id: '',
    interview_type: 'online',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    location: '',
    meeting_link: '',
    interviewer_names: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleInterview.mutate({
      application_id: applicationId,
      stage_id: formData.stage_id,
      interview_type: formData.interview_type as any,
      scheduled_date: formData.scheduled_date,
      scheduled_time: formData.scheduled_time,
      duration_minutes: formData.duration_minutes,
      location: formData.location || undefined,
      meeting_link: formData.meeting_link || undefined,
      interviewer_names: formData.interviewer_names.split(',').map(s => s.trim()).filter(Boolean),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Interview Stage *</Label>
            <Select value={formData.stage_id} onValueChange={(v) => setFormData({ ...formData, stage_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.stage_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select value={formData.interview_type} onValueChange={(v) => setFormData({ ...formData, interview_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Meeting Link / Location</Label>
            <Input value={formData.meeting_link || formData.location} onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })} placeholder="Paste meeting link or enter location" />
          </div>
          <div className="space-y-2">
            <Label>Interviewers (comma-separated names)</Label>
            <Input value={formData.interviewer_names} onChange={(e) => setFormData({ ...formData, interviewer_names: e.target.value })} placeholder="John Doe, Jane Smith" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
