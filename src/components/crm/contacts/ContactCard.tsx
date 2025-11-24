import { InstitutionContact } from "@/data/mockCRMContacts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  User, 
  Building2, 
  Star,
  Calendar,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface ContactCardProps {
  contact: InstitutionContact;
  onEdit: () => void;
  onViewDetails: () => void;
}

export function ContactCard({ contact, onEdit, onViewDetails }: ContactCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {contact.full_name}
              {contact.is_primary_contact && (
                <Star className="h-4 w-4 fill-primary text-primary" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {contact.designation}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Building2 className="h-3 w-3" />
              {contact.institution_name}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Contact Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleEmailClick}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handlePhoneClick}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          {contact.whatsapp && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleWhatsAppClick}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Contact Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{contact.phone}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last: {format(new Date(contact.last_contacted), 'MMM dd')}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {contact.total_interactions} interactions
          </div>
        </div>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{contact.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Decision Maker Badge */}
        {contact.is_decision_maker && (
          <Badge variant="outline" className="text-xs border-primary text-primary">
            Decision Maker
          </Badge>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onViewDetails}
            className="flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
