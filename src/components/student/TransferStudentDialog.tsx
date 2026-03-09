import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";
import { ClassWithStudentCount } from "@/hooks/useClasses";

interface TransferStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentId: string;
  currentClassId: string | null;
  currentClassName: string;
  institutionId: string;
  classes: ClassWithStudentCount[];
  onTransfer: (toClassId: string, reason: string) => Promise<void>;
  isTransferring?: boolean;
}

export function TransferStudentDialog({
  isOpen,
  onOpenChange,
  studentName,
  studentId,
  currentClassId,
  currentClassName,
  institutionId,
  classes,
  onTransfer,
  isTransferring = false,
}: TransferStudentDialogProps) {
  const [targetClassId, setTargetClassId] = useState("");
  const [reason, setReason] = useState("");

  const availableClasses = classes.filter((c) => c.id !== currentClassId);
  const targetClass = classes.find((c) => c.id === targetClassId);

  const handleTransfer = async () => {
    if (!targetClassId) return;
    await onTransfer(targetClassId, reason);
    setTargetClassId("");
    setReason("");
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTargetClassId("");
      setReason("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Transfer Student</DialogTitle>
          <DialogDescription>
            Transfer <strong>{studentName}</strong> to a different class. All
            existing progress, XP, projects, and assessments will be preserved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current class display */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Current Class</Label>
              <p className="font-medium">{currentClassName || "Unassigned"}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">New Class</Label>
              <p className="font-medium">
                {targetClass?.class_name || "Select..."}
              </p>
            </div>
          </div>

          {/* Target class selector */}
          <div className="space-y-2">
            <Label htmlFor="target-class">Transfer To</Label>
            <Select value={targetClassId} onValueChange={setTargetClassId}>
              <SelectTrigger id="target-class">
                <SelectValue placeholder="Select target class" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                    {cls.section ? ` - ${cls.section}` : ""}
                    {" "}({cls.student_count || 0} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Section change, Promotion, Correction..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isTransferring}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!targetClassId || isTransferring}
          >
            {isTransferring && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Transfer Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
