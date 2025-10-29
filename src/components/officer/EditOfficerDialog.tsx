import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { OfficerDetails } from '@/services/systemadmin.service';

interface EditOfficerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  officer: OfficerDetails;
  onSaveSuccess: (updatedOfficer: Partial<OfficerDetails>) => void;
}

export default function EditOfficerDialog({
  isOpen,
  onOpenChange,
  officer,
  onSaveSuccess,
}: EditOfficerDialogProps) {
  const [formData, setFormData] = useState<Partial<OfficerDetails>>({});

  useEffect(() => {
    if (officer) {
      setFormData({
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        date_of_birth: officer.date_of_birth,
        address: officer.address,
        emergency_contact_name: officer.emergency_contact_name,
        emergency_contact_phone: officer.emergency_contact_phone,
        employment_type: officer.employment_type,
        salary: officer.salary,
        department: officer.department,
        status: officer.status,
      });
    }
  }, [officer]);

  const handleChange = (field: keyof OfficerDetails, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveSuccess(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Officer Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Emergency Contact</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Employment Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Employment Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select
                  value={formData.employment_type || ''}
                  onValueChange={(value) => handleChange('employment_type', value)}
                >
                  <SelectTrigger id="employment_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary">Annual Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary || ''}
                  onChange={(e) => handleChange('salary', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Banking Information Section */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Banking Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_account_number">Bank Account Number</Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number || ''}
                  onChange={(e) => handleChange('bank_account_number', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name || ''}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_ifsc">IFSC Code</Label>
                <Input
                  id="bank_ifsc"
                  value={formData.bank_ifsc || ''}
                  onChange={(e) => handleChange('bank_ifsc', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="bank_branch">Branch</Label>
                <Input
                  id="bank_branch"
                  value={formData.bank_branch || ''}
                  onChange={(e) => handleChange('bank_branch', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Statutory Information Section */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Statutory Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pf_number">PF Number</Label>
                <Input
                  id="pf_number"
                  value={formData.statutory_info?.pf_number || ''}
                  onChange={(e) => handleChange('statutory_info', {
                    ...(formData.statutory_info || { pf_applicable: true, esi_applicable: false, pt_applicable: true }),
                    pf_number: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="uan_number">UAN Number</Label>
                <Input
                  id="uan_number"
                  value={formData.statutory_info?.uan_number || ''}
                  onChange={(e) => handleChange('statutory_info', {
                    ...(formData.statutory_info || { pf_applicable: true, esi_applicable: false, pt_applicable: true }),
                    uan_number: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="esi_number">ESI Number</Label>
                <Input
                  id="esi_number"
                  value={formData.statutory_info?.esi_number || ''}
                  onChange={(e) => handleChange('statutory_info', {
                    ...(formData.statutory_info || { pf_applicable: true, esi_applicable: false, pt_applicable: true }),
                    esi_number: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="pan_number">PAN Number</Label>
                <Input
                  id="pan_number"
                  value={formData.statutory_info?.pan_number || ''}
                  onChange={(e) => handleChange('statutory_info', {
                    ...(formData.statutory_info || { pf_applicable: true, esi_applicable: false, pt_applicable: true }),
                    pan_number: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Applicability</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pf_applicable"
                    checked={formData.statutory_info?.pf_applicable ?? true}
                    onCheckedChange={(checked) => handleChange('statutory_info', {
                      ...(formData.statutory_info || { esi_applicable: false, pt_applicable: true }),
                      pf_applicable: checked as boolean
                    })}
                  />
                  <Label htmlFor="pf_applicable" className="font-normal">PF Applicable</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="esi_applicable"
                    checked={formData.statutory_info?.esi_applicable ?? false}
                    onCheckedChange={(checked) => handleChange('statutory_info', {
                      ...(formData.statutory_info || { pf_applicable: true, pt_applicable: true }),
                      esi_applicable: checked as boolean
                    })}
                  />
                  <Label htmlFor="esi_applicable" className="font-normal">ESI Applicable</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pt_applicable"
                    checked={formData.statutory_info?.pt_applicable ?? true}
                    onCheckedChange={(checked) => handleChange('statutory_info', {
                      ...(formData.statutory_info || { pf_applicable: true, esi_applicable: false }),
                      pt_applicable: checked as boolean
                    })}
                  />
                  <Label htmlFor="pt_applicable" className="font-normal">PT Applicable</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
