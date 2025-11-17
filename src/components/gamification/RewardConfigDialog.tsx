import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RewardConfig } from "@/types/gamification";
import { toast } from "sonner";

interface RewardConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward?: RewardConfig;
  onSave: (reward: Partial<RewardConfig>) => void;
}

export const RewardConfigDialog = ({ open, onOpenChange, reward, onSave }: RewardConfigDialogProps) => {
  const [formData, setFormData] = useState<Partial<RewardConfig>>(reward || {
    name: '',
    description: '',
    type: 'certificate',
    points_required: 500,
    quantity_claimed: 0,
    is_active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    onSave(formData);
    toast.success(reward ? "Reward updated successfully" : "Reward created successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{reward ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
          <DialogDescription>
            Configure reward properties and redemption requirements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Reward Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Completion Certificate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the reward"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Reward Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="badge">Badge</SelectItem>
                  <SelectItem value="physical_reward">Physical Reward</SelectItem>
                  <SelectItem value="recognition">Recognition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points_required">Points Required</Label>
              <Input
                id="points_required"
                type="number"
                value={formData.points_required}
                onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_available">Quantity Available (Optional)</Label>
              <Input
                id="quantity_available"
                type="number"
                value={formData.quantity_available || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  quantity_available: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input
                id="image"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active Status</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {reward ? 'Update' : 'Create'} Reward
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
