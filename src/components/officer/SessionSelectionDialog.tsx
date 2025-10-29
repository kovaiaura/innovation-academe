import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, PlayCircle, TrendingUp } from 'lucide-react';
import { OfficerTimetableSlot } from '@/types/officer';
import { Course } from '@/types/course';
import { getOfficerTimetable } from '@/data/mockOfficerTimetable';
import { getSessionProgressByClass, createSession } from '@/utils/sessionHelpers';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SessionSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  officerId: string;
  onSessionStart: (sessionId: string, className: string, slotId?: string) => void;
}

export function SessionSelectionDialog({
  open,
  onOpenChange,
  course,
  officerId,
  onSessionStart,
}: SessionSelectionDialogProps) {
  const [manualClassName, setManualClassName] = useState('');
  const [timetableSlots, setTimetableSlots] = useState<OfficerTimetableSlot[]>([]);

  useEffect(() => {
    if (open && course && officerId) {
      // Load timetable slots that match this course
      const timetable = getOfficerTimetable(officerId);
      if (timetable) {
        const matchingSlots = timetable.slots.filter(slot => slot.course_id === course.id);
        setTimetableSlots(matchingSlots);
      }
    }
  }, [open, course, officerId]);

  const handleSelectSlot = (slot: OfficerTimetableSlot) => {
    if (!course) return;

    // Get existing progress for this class
    const existingProgress = getSessionProgressByClass(course.id, slot.class);
    
    // Create a new session
    const session = createSession({
      timetable_slot_id: slot.id,
      officer_id: officerId,
      course_id: course.id,
      class_name: slot.class,
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: slot.start_time,
      end_time: slot.end_time,
      current_module_id: existingProgress?.current_module_id || '',
      modules_covered: [],
      content_completed: [],
      students_present: [],
      total_students: 0,
      attendance_percentage: 0,
      status: 'in_progress',
    });

    toast.success(`Session started for ${slot.class}`);
    onSessionStart(session.id, slot.class, slot.id);
    onOpenChange(false);
  };

  const handleManualStart = () => {
    if (!course || !manualClassName.trim()) {
      toast.error('Please enter a class name');
      return;
    }

    // Get existing progress for this class
    const existingProgress = getSessionProgressByClass(course.id, manualClassName);

    // Create a new session without timetable slot
    const session = createSession({
      timetable_slot_id: '',
      officer_id: officerId,
      course_id: course.id,
      class_name: manualClassName,
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: format(new Date(), 'HH:mm'),
      end_time: '',
      current_module_id: existingProgress?.current_module_id || '',
      modules_covered: [],
      content_completed: [],
      students_present: [],
      total_students: 0,
      attendance_percentage: 0,
      status: 'in_progress',
    });

    toast.success(`Session started for ${manualClassName}`);
    onSessionStart(session.id, manualClassName);
    onOpenChange(false);
    setManualClassName('');
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Class Session</DialogTitle>
          <DialogDescription>
            Choose which class you're teaching for "{course.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scheduled Classes from Timetable */}
          {timetableSlots.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled Classes (This Week)
              </h4>
              <div className="space-y-2">
                {timetableSlots.map(slot => {
                  const progress = getSessionProgressByClass(course.id, slot.class);
                  
                  return (
                    <Card 
                      key={slot.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSelectSlot(slot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{slot.class}</p>
                              {slot.batch && (
                                <Badge variant="secondary" className="text-xs">
                                  {slot.batch}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {slot.day}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {slot.start_time} - {slot.end_time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {slot.room}
                              </span>
                            </div>
                            {progress && (
                              <div className="flex items-center gap-2 mt-2">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                  Progress: Module {progress.completed_modules}/{progress.total_modules} • 
                                  Last session: {format(new Date(progress.last_session_date), 'MMM dd')}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button size="sm" className="shrink-0">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Entry Option */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Or Enter Manually</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="manual-class">Class Name</Label>
                <Input 
                  id="manual-class"
                  placeholder="e.g., Class 8A, Batch B"
                  value={manualClassName}
                  onChange={(e) => setManualClassName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualStart();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleManualStart}
                variant="outline"
                className="w-full"
                disabled={!manualClassName.trim()}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Manual Session
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
