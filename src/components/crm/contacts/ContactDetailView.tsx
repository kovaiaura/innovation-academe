import { InstitutionContact } from "@/data/mockCRMContacts";
import { CommunicationLog } from "@/data/mockCRMData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Building2, 
  User,
  Calendar,
  ExternalLink,
  Edit,
  Star,
  Briefcase,
  Users,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";

interface ContactDetailViewProps {
  contact: InstitutionContact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  communicationLogs: CommunicationLog[];
}

export function ContactDetailView({
  contact,
  open,
  onOpenChange,
  onEdit,
  communicationLogs,
}: ContactDetailViewProps) {
  if (!contact) return null;

  // Filter communications for this contact
  const contactCommunications = communicationLogs.filter(
    log => log.institution_id === contact.institution_id &&
           log.contact_person === contact.full_name
  );

  const handleEmailClick = () => {
    window.location.href = `mailto:${contact.email}`;
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${contact.phone}`;
  };

  const handleWhatsAppClick = () => {
    if (contact.whatsapp) {
      window.open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleLinkedInClick = () => {
    if (contact.linkedin_url) {
      window.open(contact.linkedin_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {contact.full_name}
                {contact.is_primary_contact && (
                  <Star className="h-5 w-5 fill-primary text-primary" />
                )}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {contact.designation} • {contact.department}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Building2 className="h-4 w-4" />
                {contact.institution_name}
              </div>
            </div>
            <Button size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEmailClick}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" onClick={handlePhoneClick}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            {contact.whatsapp && (
              <Button variant="outline" onClick={handleWhatsAppClick}>
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            )}
            {contact.linkedin_url && (
              <Button variant="outline" onClick={handleLinkedInClick}>
                <ExternalLink className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            )}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{contact.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm">{contact.phone}</p>
                </div>
                {contact.mobile && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                    <p className="text-sm">{contact.mobile}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {contact.whatsapp && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                    <p className="text-sm">{contact.whatsapp}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Preferred Contact Method</label>
                  <p className="text-sm capitalize">{contact.preferred_contact_method}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role & Status */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Role & Status
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {contact.is_primary_contact && (
                <Badge variant="default">Primary Contact</Badge>
              )}
              {contact.is_decision_maker && (
                <Badge variant="default" className="bg-green-600">Decision Maker</Badge>
              )}
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Activity Summary
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold">{contact.total_interactions}</p>
                <p className="text-sm text-muted-foreground">Total Interactions</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold">
                  {format(new Date(contact.last_contacted), 'MMM dd')}
                </p>
                <p className="text-sm text-muted-foreground">Last Contacted</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-2xl font-bold">
                  {format(new Date(contact.date_added), 'MMM yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">Added On</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Notes</h3>
                <p className="text-sm text-muted-foreground">{contact.notes}</p>
              </div>
            </>
          )}

          {/* Recent Communications */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Recent Communications ({contactCommunications.length})
            </h3>
            
            {contactCommunications.length > 0 ? (
              <div className="space-y-3">
                {contactCommunications.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {log.type}
                          </Badge>
                          <span className="text-sm font-medium">{log.subject}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(log.date), 'PPP')} • By {log.conducted_by}
                        </p>
                        <p className="text-sm mt-2 line-clamp-2">{log.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No communications logged with this contact yet.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
