import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InstitutionContact } from '@/data/mockCRMContacts';

const contactSchema = z.object({
  institution_id: z.string().min(1, 'Institution is required'),
  institution_name: z.string().min(1, 'Institution name is required'),
  full_name: z.string().min(2, 'Full name is required').max(100, 'Name must be less than 100 characters'),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string().min(2, 'Department is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  is_primary_contact: z.boolean().default(false),
  is_decision_maker: z.boolean().default(false),
  preferred_contact_method: z.enum(['email', 'phone', 'whatsapp', 'meeting']),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (contact: Omit<InstitutionContact, 'id' | 'date_added' | 'last_contacted' | 'total_interactions'>) => void;
  institutions: Array<{ id: string; name: string }>;
  editContact?: InstitutionContact | null;
}

export function AddContactDialog({
  open,
  onOpenChange,
  onSave,
  institutions,
  editContact,
}: AddContactDialogProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: editContact ? {
      institution_id: editContact.institution_id,
      institution_name: editContact.institution_name,
      full_name: editContact.full_name,
      designation: editContact.designation,
      department: editContact.department,
      email: editContact.email,
      phone: editContact.phone,
      mobile: editContact.mobile || '',
      whatsapp: editContact.whatsapp || '',
      is_primary_contact: editContact.is_primary_contact,
      is_decision_maker: editContact.is_decision_maker,
      preferred_contact_method: editContact.preferred_contact_method,
      linkedin_url: editContact.linkedin_url || '',
      notes: editContact.notes || '',
      tags: editContact.tags.join(', '),
    } : {
      is_primary_contact: false,
      is_decision_maker: false,
      preferred_contact_method: 'email',
    },
  });

  const handleInstitutionChange = (value: string) => {
    const institution = institutions.find((i) => i.id === value);
    if (institution) {
      form.setValue('institution_name', institution.name);
    }
  };

  const onSubmit = (data: ContactFormValues) => {
    const newContact: Omit<InstitutionContact, 'id' | 'date_added' | 'last_contacted' | 'total_interactions'> = {
      institution_id: data.institution_id,
      institution_name: data.institution_name,
      full_name: data.full_name,
      designation: data.designation,
      department: data.department,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      whatsapp: data.whatsapp,
      is_primary_contact: data.is_primary_contact,
      is_decision_maker: data.is_decision_maker,
      preferred_contact_method: data.preferred_contact_method,
      linkedin_url: data.linkedin_url,
      notes: data.notes,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      reporting_to: undefined,
    };

    onSave(newContact);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          <DialogDescription>
            {editContact ? 'Update contact information' : 'Add a new contact person for an institution'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Institution Selection */}
            <FormField
              control={form.control}
              name="institution_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleInstitutionChange(value);
                    }}
                    value={field.value}
                    disabled={!!editContact}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {institutions.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Personal Information</h4>
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dr. Meera Kapoor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Principal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Administration" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Contact Details</h4>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+91-XXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input placeholder="+91-XXXXX-XXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91-XXXXX-XXXXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include country code for WhatsApp direct messaging
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_contact_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Method *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status Flags */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Role & Status</h4>
              
              <FormField
                control={form.control}
                name="is_primary_contact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Primary Contact</FormLabel>
                      <FormDescription>
                        Main point of contact for this institution
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_decision_maker"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Decision Maker</FormLabel>
                      <FormDescription>
                        Has authority to make purchasing decisions
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Additional Information</h4>
              
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., tech-savvy, budget-approver, early-adopter" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated tags for categorization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this contact..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editContact ? 'Update Contact' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
