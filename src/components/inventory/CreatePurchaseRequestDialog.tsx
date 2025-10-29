import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PurchaseRequestItem } from '@/types/inventory';

interface CreatePurchaseRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    items: PurchaseRequestItem[];
    justification: string;
    priority: 'urgent' | 'normal' | 'low';
  }) => void;
}

export function CreatePurchaseRequestDialog({ isOpen, onOpenChange, onSubmit }: CreatePurchaseRequestDialogProps) {
  const [items, setItems] = useState<PurchaseRequestItem[]>([
    { item_name: '', category: 'technology', quantity: 1, unit: 'units', estimated_unit_price: 0, estimated_total: 0 }
  ]);
  const [justification, setJustification] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'normal' | 'low'>('normal');

  const handleAddItem = () => {
    setItems([...items, { item_name: '', category: 'technology', quantity: 1, unit: 'units', estimated_unit_price: 0, estimated_total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseRequestItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate estimated_total
    if (field === 'quantity' || field === 'estimated_unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) : newItems[index].quantity;
      const unitPrice = field === 'estimated_unit_price' ? parseFloat(value) : newItems[index].estimated_unit_price;
      newItems[index].estimated_total = quantity * unitPrice;
    }
    
    setItems(newItems);
  };

  const getTotalCost = () => {
    return items.reduce((sum, item) => sum + item.estimated_total, 0);
  };

  const handleSubmit = () => {
    // Validation
    if (items.some(item => !item.item_name || item.quantity <= 0 || item.estimated_unit_price <= 0)) {
      toast.error('Please fill in all item details with valid values');
      return;
    }
    
    if (!justification.trim()) {
      toast.error('Please provide a justification for this request');
      return;
    }

    onSubmit({ items, justification, priority });
    
    // Reset form
    setItems([{ item_name: '', category: 'technology', quantity: 1, unit: 'units', estimated_unit_price: 0, estimated_total: 0 }]);
    setJustification('');
    setPriority('normal');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Request</DialogTitle>
          <DialogDescription>
            Request new equipment or supplies for your lab
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Items Requested</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label>Item Name *</Label>
                    <Input
                      value={item.item_name}
                      onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                      placeholder="e.g., Arduino Mega Boards"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select 
                      value={item.category}
                      onValueChange={(value) => handleItemChange(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="consumables">Consumables</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select 
                      value={item.unit}
                      onValueChange={(value) => handleItemChange(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="units">Units</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="sets">Sets</SelectItem>
                        <SelectItem value="rolls">Rolls</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Price (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.estimated_unit_price}
                      onChange={(e) => handleItemChange(index, 'estimated_unit_price', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Item Total:</span>
                  <span className="font-semibold">₹{item.estimated_total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total Cost */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-lg font-semibold">Total Estimated Cost:</span>
            <span className="text-2xl font-bold">₹{getTotalCost().toLocaleString()}</span>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority Level *</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Urgent</Badge>
                    <span className="text-sm">Immediate need</span>
                  </div>
                </SelectItem>
                <SelectItem value="normal">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Normal</Badge>
                    <span className="text-sm">Standard processing</span>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Low</Badge>
                    <span className="text-sm">Can wait</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label>Justification *</Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why these items are needed, how they will be used, and the benefits to the lab..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide a clear justification to help expedite approval
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
