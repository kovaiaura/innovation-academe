import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { XPRule } from "@/types/gamification";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

interface XPRuleEditorProps {
  rules: XPRule[];
  onUpdate: (rule: XPRule) => void;
}

export const XPRuleEditor = ({ rules, onUpdate }: XPRuleEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<XPRule>>({});

  const activityLabels: Record<string, string> = {
    session_attendance: 'Session Attendance',
    assessment_completion: 'Assessment Completion',
    project_submission: 'Project Submission',
    assignment_submission: 'Assignment Submission',
    daily_login: 'Daily Login',
    perfect_score: 'Perfect Score',
    early_submission: 'Early Submission'
  };

  const handleEdit = (rule: XPRule) => {
    setEditingId(rule.id);
    setEditData(rule);
  };

  const handleSave = () => {
    if (editingId && editData) {
      onUpdate(editData as XPRule);
      toast.success("XP rule updated successfully");
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Multiplier</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => {
            const isEditing = editingId === rule.id;
            
            return (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">
                  {activityLabels[rule.activity]}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.points}
                      onChange={(e) => setEditData({ ...editData, points: parseInt(e.target.value) })}
                      className="w-20"
                    />
                  ) : (
                    <span className="text-primary font-semibold">{rule.points} XP</span>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editData.multiplier || ''}
                      onChange={(e) => setEditData({ ...editData, multiplier: parseFloat(e.target.value) })}
                      className="w-20"
                      placeholder="1.0"
                    />
                  ) : (
                    rule.multiplier ? `${rule.multiplier}x` : '-'
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">{rule.description}</span>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Switch
                      checked={editData.is_active}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                    />
                  ) : (
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(rule)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
