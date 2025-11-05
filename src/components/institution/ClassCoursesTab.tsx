import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InstitutionClass, ClassCourseAssignment } from '@/types/institution';
import { AssignCourseToClassDialog } from './AssignCourseToClassDialog';
import { BookOpen, Plus, Lock, Unlock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ClassCoursesTabProps {
  classId: string;
  classData: InstitutionClass;
  courseAssignments: ClassCourseAssignment[];
  onAssignCourse: (assignment: any) => Promise<void>;
  onUpdateAssignment: (assignmentId: string, data: any) => Promise<void>;
  onRemoveAssignment: (assignmentId: string) => Promise<void>;
  onUnlockModule: (assignmentId: string, moduleId: string) => Promise<void>;
}

export function ClassCoursesTab({
  classId,
  classData,
  courseAssignments,
  onAssignCourse,
  onUpdateAssignment,
  onRemoveAssignment,
  onUnlockModule
}: ClassCoursesTabProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ClassCourseAssignment | null>(null);

  const handleAssignCourse = async (assignment: any) => {
    await onAssignCourse(assignment);
    setShowAssignDialog(false);
  };

  const handleUnlockModule = async (assignmentId: string, moduleId: string) => {
    try {
      await onUnlockModule(assignmentId, moduleId);
      toast.success('Module unlocked successfully');
    } catch (error) {
      toast.error('Failed to unlock module');
    }
  };

  const handleDeleteAssignment = async () => {
    if (assignmentToDelete) {
      await onRemoveAssignment(assignmentToDelete.id);
      setAssignmentToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Assignments</CardTitle>
              <CardDescription>
                Manage courses and modules assigned to {classData.class_name}
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAssignDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Course
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseAssignments.length > 0 ? (
            <div className="space-y-4">
              {courseAssignments.map((assignment) => {
                const totalModules = assignment.assigned_modules.length;
                const unlockedModules = assignment.assigned_modules.filter(m => m.is_unlocked).length;
                const progressPercent = (unlockedModules / totalModules) * 100;

                return (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{assignment.course_title}</h3>
                              <Badge variant="secondary" className="capitalize">
                                {assignment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {assignment.course_category}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {totalModules} modules assigned
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {unlockedModules} unlocked
                              </span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Assignment
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setAssignmentToDelete(assignment)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Assignment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Module List */}
                      <div className="space-y-2">
                        {assignment.assigned_modules.map((module) => {
                          const completionPercent = module.students_completed 
                            ? Math.round((module.students_completed / (classData.capacity || 1)) * 100)
                            : 0;

                          return (
                            <div 
                              key={module.module_id}
                              className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                              <div className="flex-shrink-0">
                                {module.is_unlocked ? (
                                  <Unlock className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      Module {module.module_order}: {module.module_title}
                                    </span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {module.unlock_mode}
                                    </Badge>
                                  </div>
                                  {!module.is_unlocked && module.unlock_mode === 'manual' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleUnlockModule(assignment.id, module.module_id)}
                                    >
                                      Unlock
                                    </Button>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>
                                      {module.students_completed || 0} / {classData.capacity} students completed
                                    </span>
                                    <span>•</span>
                                    <span>{completionPercent}%</span>
                                  </div>
                                  <Progress value={completionPercent} className="h-1" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Assignment Info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <span>Start: {new Date(assignment.start_date).toLocaleDateString()}</span>
                        {assignment.expected_end_date && (
                          <>
                            <span>•</span>
                            <span>End: {new Date(assignment.expected_end_date).toLocaleDateString()}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{assignment.assigned_officers.length} officers assigned</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No courses assigned to this class yet
              </p>
              <Button onClick={() => setShowAssignDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign First Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Dialogs */}
    <AssignCourseToClassDialog
      isOpen={showAssignDialog}
      onOpenChange={setShowAssignDialog}
      classData={classData}
      onAssignCourse={handleAssignCourse}
    />

    <AlertDialog open={!!assignmentToDelete} onOpenChange={() => setAssignmentToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Course Assignment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {assignmentToDelete?.course_title} from {classData.class_name}? Students will lose access to this course.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteAssignment}>Remove</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
