import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommunicationLog } from "@/data/mockCRMData";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

const communicationSchema = z.object({
  institution_id: z.string().min(1, "Institution is required"),
  type: z.enum(['call', 'email', 'meeting', 'visit', 'follow_up']),
  date: z.string().min(1, "Date is required"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  contact_person: z.string().min(1, "Contact person is required"),
  contact_role: z.string().min(1, "Contact role is required"),
  conducted_by: z.string().min(1, "Conducted by is required"),
  notes: z.string().min(10, "Notes must be at least 10 characters"),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['completed', 'pending', 'follow_up_required']),
  next_action: z.string().optional(),
  next_action_date: z.string().optional(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface EditCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communication: CommunicationLog | null;
  onSave: (data: CommunicationLog) => void;
  institutions: { id: string; name: string }[];
}

export function EditCommunicationDialog({ 
  open, 
  onOpenChange, 
  communication, 
  onSave,
  institutions 
}: EditCommunicationDialogProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: communication ? {
      institution_id: communication.institution_id,
      type: communication.type,
      date: format(new Date(communication.date), 'yyyy-MM-dd'),
      subject: communication.subject,
      contact_person: communication.contact_person,
      contact_role: communication.contact_role,
      conducted_by: communication.conducted_by,
      notes: communication.notes,
      priority: communication.priority,
      status: communication.status,
      next_action: communication.next_action,
      next_action_date: communication.next_action_date ? format(new Date(communication.next_action_date), 'yyyy-MM-dd') : '',
    } : undefined
  });

  const onSubmit = (data: CommunicationFormData) => {
    if (!communication) return;
    
    const selectedInstitution = institutions.find(i => i.id === data.institution_id);
    
    const updatedCommunication: CommunicationLog = {
      ...communication,
      institution_id: data.institution_id,
      institution_name: selectedInstitution?.name || communication.institution_name,
      type: data.type,
      date: new Date(data.date).toISOString(),
      subject: data.subject,
      contact_person: data.contact_person,
      contact_role: data.contact_role,
      conducted_by: data.conducted_by,
      notes: data.notes,
      priority: data.priority,
      status: data.status,
      next_action: data.next_action || '',
      next_action_date: data.next_action_date ? new Date(data.next_action_date).toISOString() : '',
    };
    
    onSave(updatedCommunication);
  };

  if (!communication) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Communication Log</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution_id">Institution *</Label>
              <Select
                value={watch('institution_id')}
                onValueChange={(value) => setValue('institution_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.institution_id && (
                <p className="text-sm text-red-500">{errors.institution_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Communication Type *</Label>
              <Select
                value={watch('type')}
                onValueChange={(value: any) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="visit">Site Visit</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Communication Date *</Label>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="conducted_by">Conducted By *</Label>
              <Input {...register('conducted_by')} placeholder="Your name" />
              {errors.conducted_by && <p className="text-sm text-red-500">{errors.conducted_by.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input {...register('contact_person')} placeholder="Contact name" />
              {errors.contact_person && <p className="text-sm text-red-500">{errors.contact_person.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_role">Contact Role *</Label>
              <Input {...register('contact_role')} placeholder="e.g., Principal, IT Head" />
              {errors.contact_role && <p className="text-sm text-red-500">{errors.contact_role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value: any) => setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value: any) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input {...register('subject')} placeholder="Brief subject of the communication" />
            {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Communication Notes *</Label>
            <Textarea
              {...register('notes')}
              placeholder="Detailed notes about the communication..."
              rows={4}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="next_action">Next Action</Label>
              <Input {...register('next_action')} placeholder="What needs to be done next?" />
              {errors.next_action && <p className="text-sm text-red-500">{errors.next_action.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_action_date">Next Action Date</Label>
              <Input type="date" {...register('next_action_date')} />
              {errors.next_action_date && <p className="text-sm text-red-500">{errors.next_action_date.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
