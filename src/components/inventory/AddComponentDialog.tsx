import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectComponent } from '@/types/inventory';
import { Project } from '@/data/mockProjectData';
import { toast } from 'sonner';

interface AddComponentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (component: Partial<ProjectComponent>) => void;
  projects: Project[];
}

export const AddComponentDialog = ({ isOpen, onOpenChange, onSubmit, projects }: AddComponentDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'electronics' as ProjectComponent['category'],
    description: '',
    specifications: '',
    manufacturer: '',
    part_number: '',
    required_quantity: 1,
    unit: 'pieces',
    estimated_unit_price: 0,
    project_id: '',
    priority: 'medium' as ProjectComponent['priority'],
    justification: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return formData.required_quantity * formData.estimated_unit_price;
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Component name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (formData.required_quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (formData.estimated_unit_price <= 0) {
      toast.error('Unit price must be greater than 0');
      return;
    }

    const selectedProject = projects.find(p => p.id === formData.project_id);

    const componentData: Partial<ProjectComponent> = {
      ...formData,
      project_name: selectedProject?.title,
      estimated_total: calculateTotal(),
    };

    onSubmit(componentData);
    
    // Reset form
    setFormData({
      name: '',
      category: 'electronics',
      description: '',
      specifications: '',
      manufacturer: '',
      part_number: '',
      required_quantity: 1,
      unit: 'pieces',
      estimated_unit_price: 0,
      project_id: '',
      priority: 'medium',
      justification: ''
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Component</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Component Name */}
          <div>
            <Label htmlFor="name">Component Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Arduino Uno R3"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="sensors">Sensors</SelectItem>
                <SelectItem value="actuators">Actuators</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the component"
              rows={2}
            />
          </div>

          {/* Specifications */}
          <div>
            <Label htmlFor="specifications">Specifications (Optional)</Label>
            <Input
              id="specifications"
              value={formData.specifications}
              onChange={(e) => handleChange('specifications', e.target.value)}
              placeholder="e.g., 5V, 2A, ATmega328P"
            />
          </div>

          {/* Manufacturer & Part Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">Manufacturer (Optional)</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                placeholder="e.g., Arduino"
              />
            </div>
            <div>
              <Label htmlFor="part_number">Part Number (Optional)</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleChange('part_number', e.target.value)}
                placeholder="e.g., A000066"
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Required Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.required_quantity}
                onChange={(e) => handleChange('required_quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(val) => handleChange('unit', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="sets">Sets</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="grams">Grams</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Unit Price & Total */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_price">Estimated Unit Price (₹) *</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimated_unit_price}
                onChange={(e) => handleChange('estimated_unit_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Estimated Total (₹)</Label>
              <div className="h-10 flex items-center px-3 border rounded-md bg-muted font-semibold text-primary">
                ₹{calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Link to Project */}
          <div>
            <Label htmlFor="project">Link to Project (Optional)</Label>
            <Select value={formData.project_id || 'none'} onValueChange={(val) => handleChange('project_id', val === 'none' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select value={formData.priority} onValueChange={(val) => handleChange('priority', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justification */}
          <div>
            <Label htmlFor="justification">Justification (Optional)</Label>
            <Textarea
              id="justification"
              value={formData.justification}
              onChange={(e) => handleChange('justification', e.target.value)}
              placeholder="Why is this component needed?"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Component
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
