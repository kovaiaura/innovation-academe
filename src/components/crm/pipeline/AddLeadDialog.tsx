import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SalesLead } from '@/data/mockSalesPipeline';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lead: Omit<SalesLead, 'id' | 'created_date' | 'stage_updated_date' | 'days_in_current_stage' | 'last_activity_date' | 'communication_ids'>) => void;
}

export function AddLeadDialog({ open, onOpenChange, onSave }: AddLeadDialogProps) {
  const [formData, setFormData] = useState({
    institution_name: '',
    institution_type: 'school' as SalesLead['institution_type'],
    city: '',
    state: '',
    country: 'India',
    student_strength: '',
    grade_range: '',
    primary_contact_name: '',
    primary_contact_designation: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    lead_source: 'website' as SalesLead['lead_source'],
    lead_source_details: '',
    stage: 'lead' as SalesLead['stage'],
    estimated_deal_value: '',
    proposed_contract_type: 'standard' as SalesLead['proposed_contract_type'],
    expected_close_date: '',
    probability: 15,
    assigned_to: '',
    next_follow_up_date: '',
    competitors: '',
    pain_points: '',
    decision_criteria: '',
    status: 'active' as SalesLead['status'],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lead: Omit<SalesLead, 'id' | 'created_date' | 'stage_updated_date' | 'days_in_current_stage' | 'last_activity_date' | 'communication_ids'> = {
      institution_name: formData.institution_name,
      institution_type: formData.institution_type,
      location: {
        city: formData.city,
        state: formData.state,
        country: formData.country,
      },
      student_strength: parseInt(formData.student_strength),
      grade_range: formData.grade_range,
      primary_contact_name: formData.primary_contact_name,
      primary_contact_designation: formData.primary_contact_designation,
      primary_contact_email: formData.primary_contact_email,
      primary_contact_phone: formData.primary_contact_phone,
      lead_source: formData.lead_source,
      lead_source_details: formData.lead_source_details || undefined,
      stage: formData.stage,
      estimated_deal_value: parseInt(formData.estimated_deal_value),
      proposed_contract_type: formData.proposed_contract_type,
      expected_close_date: formData.expected_close_date,
      probability: formData.probability,
      assigned_to: formData.assigned_to,
      next_follow_up_date: formData.next_follow_up_date,
      competitors: formData.competitors ? formData.competitors.split(',').map(c => c.trim()) : undefined,
      pain_points: formData.pain_points.split(',').map(p => p.trim()).filter(Boolean),
      decision_criteria: formData.decision_criteria.split(',').map(d => d.trim()).filter(Boolean),
      status: formData.status,
      notes: formData.notes,
    };

    onSave(lead);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      institution_name: '',
      institution_type: 'school',
      city: '',
      state: '',
      country: 'India',
      student_strength: '',
      grade_range: '',
      primary_contact_name: '',
      primary_contact_designation: '',
      primary_contact_email: '',
      primary_contact_phone: '',
      lead_source: 'website',
      lead_source_details: '',
      stage: 'lead',
      estimated_deal_value: '',
      proposed_contract_type: 'standard',
      expected_close_date: '',
      probability: 15,
      assigned_to: '',
      next_follow_up_date: '',
      competitors: '',
      pain_points: '',
      decision_criteria: '',
      status: 'active',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the details of the new sales lead
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Institution Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Institution Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution_name">Institution Name *</Label>
                  <Input
                    id="institution_name"
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution_type">Type *</Label>
                  <Select value={formData.institution_type} onValueChange={(value: SalesLead['institution_type']) => setFormData({ ...formData, institution_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="coaching">Coaching</SelectItem>
                      <SelectItem value="corporate_training">Corporate Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_strength">Student Strength *</Label>
                  <Input
                    id="student_strength"
                    type="number"
                    value={formData.student_strength}
                    onChange={(e) => setFormData({ ...formData, student_strength: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade_range">Grade Range *</Label>
                  <Input
                    id="grade_range"
                    placeholder="e.g., K-12, 9-12"
                    value={formData.grade_range}
                    onChange={(e) => setFormData({ ...formData, grade_range: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Primary Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Full Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.primary_contact_name}
                    onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_designation">Designation *</Label>
                  <Input
                    id="contact_designation"
                    value={formData.primary_contact_designation}
                    onChange={(e) => setFormData({ ...formData, primary_contact_designation: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.primary_contact_email}
                    onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone *</Label>
                  <Input
                    id="contact_phone"
                    value={formData.primary_contact_phone}
                    onChange={(e) => setFormData({ ...formData, primary_contact_phone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sales Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Sales Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead_source">Lead Source *</Label>
                  <Select value={formData.lead_source} onValueChange={(value: SalesLead['lead_source']) => setFormData({ ...formData, lead_source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="marketing_campaign">Marketing Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead_source_details">Source Details</Label>
                  <Input
                    id="lead_source_details"
                    placeholder="e.g., Referred by XYZ School"
                    value={formData.lead_source_details}
                    onChange={(e) => setFormData({ ...formData, lead_source_details: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_deal_value">Deal Value (₹) *</Label>
                  <Input
                    id="estimated_deal_value"
                    type="number"
                    value={formData.estimated_deal_value}
                    onChange={(e) => setFormData({ ...formData, estimated_deal_value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_type">Contract Type *</Label>
                  <Select value={formData.proposed_contract_type} onValueChange={(value: SalesLead['proposed_contract_type']) => setFormData({ ...formData, proposed_contract_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_close_date">Expected Close Date *</Label>
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assigned To *</Label>
                  <Input
                    id="assigned_to"
                    placeholder="Sales rep name"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_follow_up">Next Follow-up Date *</Label>
                  <Input
                    id="next_follow_up"
                    type="date"
                    value={formData.next_follow_up_date}
                    onChange={(e) => setFormData({ ...formData, next_follow_up_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competitors">Competitors (comma-separated)</Label>
                  <Input
                    id="competitors"
                    placeholder="e.g., Competitor A, Competitor B"
                    value={formData.competitors}
                    onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pain_points">Pain Points (comma-separated) *</Label>
                  <Input
                    id="pain_points"
                    placeholder="e.g., Need better engagement, Current system outdated"
                    value={formData.pain_points}
                    onChange={(e) => setFormData({ ...formData, pain_points: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decision_criteria">Decision Criteria (comma-separated) *</Label>
                  <Input
                    id="decision_criteria"
                    placeholder="e.g., Price, Features, Support"
                    value={formData.decision_criteria}
                    onChange={(e) => setFormData({ ...formData, decision_criteria: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this lead..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Lead</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
