import { SalesLead } from '@/data/mockSalesPipeline';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, IndianRupee, Calendar, User, Phone, Mail, Eye, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface LeadCardProps {
  lead: SalesLead;
  onViewDetails: (lead: SalesLead) => void;
}

export function LeadCard({ lead, onViewDetails }: LeadCardProps) {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'bg-green-500/10 text-green-700 border-green-200';
    if (probability >= 40) return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    return 'bg-red-500/10 text-red-700 border-red-200';
  };

  const isHotLead = lead.probability >= 70 && new Date(lead.expected_close_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isStuck = lead.days_in_current_stage > 30;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onViewDetails(lead)}>
      <CardHeader className="pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {lead.institution_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {lead.institution_type.replace('_', ' ')}
              </Badge>
              {isHotLead && (
                <Badge className="bg-red-500 text-white text-xs">
                  🔥 Hot Lead
                </Badge>
              )}
              {isStuck && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Stuck
                </Badge>
              )}
            </div>
          </div>
          <Badge className={getProbabilityColor(lead.probability)}>
            {lead.probability}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold text-foreground">
              ₹{(lead.estimated_deal_value / 100000).toFixed(1)}L
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {lead.proposed_contract_type}
          </Badge>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{lead.primary_contact_name}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{lead.location.city}, {lead.location.state}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs">Close: {format(new Date(lead.expected_close_date), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {lead.days_in_current_stage} days in stage
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(lead);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>

        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${lead.primary_contact_phone}`;
            }}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `mailto:${lead.primary_contact_email}`;
            }}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
