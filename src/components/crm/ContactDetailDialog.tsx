import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Building2, MessageSquare, CheckCircle, ExternalLink } from "lucide-react";

interface Contact {
  id: string;
  institution_id: string;
  institution_name: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  type: 'lead' | 'customer' | 'partner';
  status: 'active' | 'inactive';
}

interface ContactDetailDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogCommunication?: (contact: Contact) => void;
  onAddTask?: (contact: Contact) => void;
}

export function ContactDetailDialog({
  contact,
  open,
  onOpenChange,
  onLogCommunication,
  onAddTask,
}: ContactDetailDialogProps) {
  if (!contact) return null;

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      lead: { label: 'Lead', variant: 'outline' },
      customer: { label: 'Customer', variant: 'default' },
      partner: { label: 'Partner', variant: 'secondary' },
    };
    const config = variants[type] || variants.lead;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">{contact.name}</DialogTitle>
              <p className="text-muted-foreground text-sm">{contact.designation}</p>
              <div className="flex gap-2">
                {getTypeBadge(contact.type)}
                <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                  {contact.status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{contact.institution_name}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onLogCommunication?.(contact);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Log Communication
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onAddTask?.(contact);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Add Follow-up Task
              </Button>
              <Button
                variant="outline"
                className="w-full col-span-2"
                onClick={() => {
                  // Navigate to institution detail (placeholder)
                  window.location.href = `/system-admin/institution/${contact.institution_id}`;
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Institution
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
