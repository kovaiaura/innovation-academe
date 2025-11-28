import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { AuditRecord, InventoryItem } from '@/types/inventory';

interface CreateAuditReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  institutionId: string;
  officerId: string;
  officerName: string;
  inventoryItems: InventoryItem[];
  onAuditCreated: (record: AuditRecord) => void;
}

export function CreateAuditReportDialog({
  isOpen,
  onOpenChange,
  institutionId,
  officerId,
  officerName,
  inventoryItems,
  onAuditCreated,
}: CreateAuditReportDialogProps) {
  const [formData, setFormData] = useState({
    audit_date: new Date().toISOString().split('T')[0],
    items_checked: inventoryItems.length.toString(),
    notes: '',
    status: 'completed' as AuditRecord['status'],
  });
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [damagedItems, setDamagedItems] = useState<string[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<string[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setAttachedFile(file);
    }
  };

  const handleItemToggle = (itemCode: string, list: 'missing' | 'damaged' | 'new') => {
    if (list === 'missing') {
      setMissingItems(prev => 
        prev.includes(itemCode) 
          ? prev.filter(i => i !== itemCode)
          : [...prev, itemCode]
      );
    } else if (list === 'damaged') {
      setDamagedItems(prev => 
        prev.includes(itemCode) 
          ? prev.filter(i => i !== itemCode)
          : [...prev, itemCode]
      );
    } else {
      setNewlyAdded(prev => 
        prev.includes(itemCode) 
          ? prev.filter(i => i !== itemCode)
          : [...prev, itemCode]
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.audit_date || !formData.items_checked) {
      toast.error('Please fill in all required fields');
      return;
    }

    const discrepancies = missingItems.length + damagedItems.length;
    
    const auditRecord: AuditRecord = {
      audit_id: `audit-${Date.now()}`,
      audit_date: formData.audit_date,
      audited_by: officerName,
      items_checked: parseInt(formData.items_checked),
      discrepancies,
      missing_items: missingItems,
      damaged_items: damagedItems,
      newly_added: newlyAdded,
      notes: formData.notes + (attachedFile ? `\n\n[Attachment: ${attachedFile.name}]` : ''),
      status: formData.status,
    };

    onAuditCreated(auditRecord);
    
    // Reset form
    setFormData({
      audit_date: new Date().toISOString().split('T')[0],
      items_checked: inventoryItems.length.toString(),
      notes: '',
      status: 'completed',
    });
    setMissingItems([]);
    setDamagedItems([]);
    setNewlyAdded([]);
    setAttachedFile(null);
    
    onOpenChange(false);
    toast.success('Audit report created successfully!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Audit Report</DialogTitle>
          <DialogDescription>
            Document the results of your inventory audit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audit_date">Audit Date *</Label>
                <Input
                  id="audit_date"
                  type="date"
                  value={formData.audit_date}
                  onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="items_checked">Items Checked *</Label>
                <Input
                  id="items_checked"
                  type="number"
                  value={formData.items_checked}
                  onChange={(e) => setFormData({ ...formData, items_checked: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Audited By</Label>
                <Input value={officerName} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: AuditRecord['status']) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Missing Items */}
            <div className="space-y-2">
              <Label>Missing Items (Select if any)</Label>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {inventoryItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inventory items available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {inventoryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`missing-${item.id}`}
                          checked={missingItems.includes(item.item_code)}
                          onCheckedChange={() => handleItemToggle(item.item_code, 'missing')}
                        />
                        <label htmlFor={`missing-${item.id}`} className="text-sm cursor-pointer">
                          {item.item_code} - {item.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {missingItems.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {missingItems.map((code) => (
                    <Badge key={code} variant="destructive" className="text-xs">
                      {code}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleItemToggle(code, 'missing')}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Damaged Items */}
            <div className="space-y-2">
              <Label>Damaged Items (Select if any)</Label>
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                {inventoryItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inventory items available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {inventoryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`damaged-${item.id}`}
                          checked={damagedItems.includes(item.item_code)}
                          onCheckedChange={() => handleItemToggle(item.item_code, 'damaged')}
                        />
                        <label htmlFor={`damaged-${item.id}`} className="text-sm cursor-pointer">
                          {item.item_code} - {item.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {damagedItems.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {damagedItems.map((code) => (
                    <Badge key={code} variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                      {code}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleItemToggle(code, 'damaged')}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Audit Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any observations, recommendations, or issues found during the audit..."
                rows={4}
              />
            </div>

            {/* File Attachment */}
            <div className="space-y-2">
              <Label>Attach Audit Report Document (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                {attachedFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm">{attachedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Audit Summary</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Items Checked</p>
                  <p className="font-bold text-lg">{formData.items_checked || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Missing</p>
                  <p className="font-bold text-lg text-red-500">{missingItems.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Damaged</p>
                  <p className="font-bold text-lg text-orange-500">{damagedItems.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Discrepancies</p>
                  <p className="font-bold text-lg">{missingItems.length + damagedItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Audit Report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
