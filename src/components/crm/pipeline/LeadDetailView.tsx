import { SalesLead, stageConfig } from '@/data/mockSalesPipeline';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, MapPin, Users, GraduationCap, Phone, Mail, User, 
  IndianRupee, Calendar, TrendingUp, Target, AlertTriangle, FileText,
  Clock, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LeadDetailViewProps {
  lead: SalesLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailView({ lead, open, onOpenChange }: LeadDetailViewProps) {
  if (!lead) return null;

  const config = stageConfig[lead.stage];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{lead.institution_name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{lead.institution_type.replace('_', ' ')}</Badge>
                <Badge className={config.color}>{config.label}</Badge>
                <Badge variant="secondary">{lead.probability}% probability</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold flex items-center justify-end gap-1">
                <IndianRupee className="h-5 w-5" />
                {(lead.estimated_deal_value / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {lead.proposed_contract_type} contract
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)]">
          <div className="space-y-6 pr-4">
            {/* Institution Details */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Institution Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{lead.location.city}, {lead.location.state}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{lead.student_strength.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span>Grades: {lead.grade_range}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Primary Contact */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Primary Contact
              </h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{lead.primary_contact_name}</div>
                <div className="text-muted-foreground">{lead.primary_contact_designation}</div>
                <div className="flex items-center gap-4">
                  <a href={`mailto:${lead.primary_contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="h-4 w-4" />
                    {lead.primary_contact_email}
                  </a>
                  <a href={`tel:${lead.primary_contact_phone}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Phone className="h-4 w-4" />
                    {lead.primary_contact_phone}
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sales Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sales Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Lead Source</div>
                  <div className="font-medium capitalize">{lead.lead_source.replace('_', ' ')}</div>
                  {lead.lead_source_details && (
                    <div className="text-xs text-muted-foreground mt-1">{lead.lead_source_details}</div>
                  )}
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Assigned To</div>
                  <div className="font-medium">{lead.assigned_to}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expected Close Date
                  </div>
                  <div className="font-medium">{format(new Date(lead.expected_close_date), 'MMM dd, yyyy')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Days in Current Stage
                  </div>
                  <div className="font-medium">{lead.days_in_current_stage} days</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Last Activity
                  </div>
                  <div className="font-medium">{format(new Date(lead.last_activity_date), 'MMM dd, yyyy')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Next Follow-up</div>
                  <div className="font-medium">{format(new Date(lead.next_follow_up_date), 'MMM dd, yyyy')}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pain Points & Decision Criteria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Pain Points
                </h3>
                <ul className="space-y-2 text-sm">
                  {lead.pain_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Decision Criteria
                </h3>
                <ul className="space-y-2 text-sm">
                  {lead.decision_criteria.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {lead.competitors && lead.competitors.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Competitors</h3>
                  <div className="flex gap-2 flex-wrap">
                    {lead.competitors.map((competitor, index) => (
                      <Badge key={index} variant="outline">{competitor}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {lead.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit Lead</Button>
            <Button>Log Activity</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
