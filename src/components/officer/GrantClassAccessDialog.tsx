/**
 * Dialog for officers to grant class access to other officers
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateAccessGrant } from '@/hooks/useOfficerClassAccess';
import { toast } from 'sonner';

interface GrantClassAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grantingOfficerId: string;
  classId: string;
  className: string;
  institutionId: string;
  timetableAssignmentId?: string;
  availableOfficers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export function GrantClassAccessDialog({
  open,
  onOpenChange,
  grantingOfficerId,
  classId,
  className,
  institutionId,
  timetableAssignmentId,
  availableOfficers,
}: GrantClassAccessDialogProps) {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [accessType, setAccessType] = useState<'temporary' | 'permanent'>('temporary');
  const [validFrom, setValidFrom] = useState<Date>(new Date());
  const [validUntil, setValidUntil] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');

  const createGrantMutation = useCreateAccessGrant();

  const handleSubmit = async () => {
    if (!selectedOfficer) {
      toast.error('Please select an officer');
      return;
    }

    if (accessType === 'temporary' && !validUntil) {
      toast.error('Please select an end date for temporary access');
      return;
    }

    await createGrantMutation.mutateAsync({
      grantingOfficerId,
      grant: {
        receiving_officer_id: selectedOfficer,
        class_id: classId,
        institution_id: institutionId,
        timetable_assignment_id: timetableAssignmentId,
        access_type: accessType,
        valid_from: format(validFrom, 'yyyy-MM-dd'),
        valid_until: validUntil ? format(validUntil, 'yyyy-MM-dd') : undefined,
        reason: reason || undefined,
      },
    });

    // Reset form
    setSelectedOfficer('');
    setAccessType('temporary');
    setValidFrom(new Date());
    setValidUntil(undefined);
    setReason('');
    onOpenChange(false);
  };

  // Filter out the granting officer from the list
  const filteredOfficers = availableOfficers.filter(o => o.id !== grantingOfficerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Grant Class Access
          </DialogTitle>
          <DialogDescription>
            Allow another officer to take attendance for <span className="font-medium">{className}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Officer Selection */}
          <div className="space-y-2">
            <Label>Select Officer</Label>
            <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an officer" />
              </SelectTrigger>
              <SelectContent>
                {filteredOfficers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No other officers available
                  </div>
                ) : (
                  filteredOfficers.map(officer => (
                    <SelectItem key={officer.id} value={officer.id}>
                      <div className="flex flex-col">
                        <span>{officer.name}</span>
                        <span className="text-xs text-muted-foreground">{officer.email}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Access Type */}
          <div className="space-y-2">
            <Label>Access Duration</Label>
            <RadioGroup value={accessType} onValueChange={(v) => setAccessType(v as 'temporary' | 'permanent')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="temporary" id="temporary" />
                <Label htmlFor="temporary" className="font-normal">
                  Temporary (until specific date)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="permanent" id="permanent" />
                <Label htmlFor="permanent" className="font-normal">
                  Permanent (until revoked)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !validFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validFrom ? format(validFrom, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validFrom}
                    onSelect={(date) => date && setValidFrom(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {accessType === 'temporary' && (
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !validUntil && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {validUntil ? format(validUntil, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={validUntil}
                      onSelect={setValidUntil}
                      disabled={(date) => date < validFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              placeholder="e.g., On leave, Training session, Substitute teacher..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={createGrantMutation.isPending || !selectedOfficer}
            >
              {createGrantMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Granting...
                </>
              ) : (
                'Grant Access'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
