import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Calendar, Search, Users, Eye, Plus, Pencil, Trash2, Clock, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { assignmentService, AssignmentFormData, AssignmentWithClasses, OfficerAssignableClass } from '@/services/assignment.service';
import { format, isPast, isFuture } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AssignmentSubmissionsDialog } from '@/components/assignments/AssignmentSubmissionsDialog';
import { ManagementAssignmentFormDialog } from '@/components/assignments/ManagementAssignmentFormDialog';
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

export default function OfficerAssignments() {
  const { user } = useAuth();
  const institutionId = user?.institution_id || user?.tenant_id;
  const [assignments, setAssignments] = useState<AssignmentWithClasses[]>([]);
  const [assignableClasses, setAssignableClasses] = useState<OfficerAssignableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentWithClasses | null>(null);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithClasses | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<AssignmentWithClasses | null>(null);
  const { selectedYear, selectedRange } = useAcademicYear();
  const classIds = useMemo(() => assignableClasses.map((classItem) => classItem.id), [assignableClasses]);

  const loadAssignments = useCallback(async () => {
    if (!user?.id || !institutionId) {
      setAssignments([]);
      setAssignableClasses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const classes = await assignmentService.getOfficerAssignableClasses(user.id, institutionId);
      setAssignableClasses(classes);
      const data = await assignmentService.getOfficerAssignments(
        institutionId,
        classes.map((classItem) => classItem.id),
        selectedYear,
        selectedRange,
      );
      setAssignments(data);
    } catch (error) {
      console.error('Error loading officer assignments:', error);
      toast.error('Could not load assignments for your assigned classes');
      setAssignments([]);
      setAssignableClasses([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, institutionId, selectedYear, selectedRange]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (assignment: AssignmentWithClasses) => {
    if (assignment.status === 'draft') return <Badge variant="secondary">Draft</Badge>;
    const start = new Date(assignment.start_date);
    const end = new Date(assignment.submission_end_date);

    if (isFuture(start)) return <Badge variant="outline">Upcoming</Badge>;
    if (isPast(end)) return <Badge variant="destructive">Ended</Badge>;
    return <Badge className="bg-green-500">Active</Badge>;
  };

  const handleSaveAssignment = async (formData: AssignmentFormData, role: string) => {
    if (editingAssignment) {
      await assignmentService.updateAssignment(editingAssignment.id, formData);
      toast.success('Assignment updated');
    } else {
      await assignmentService.createAssignment(formData, role);
      toast.success('Assignment created');
    }
    setEditingAssignment(null);
    await loadAssignments();
  };

  const handleDeleteAssignment = async () => {
    if (!deletingAssignment) return;
    try {
      await assignmentService.deleteAssignment(deletingAssignment.id);
      toast.success('Assignment deleted');
      setDeleteDialogOpen(false);
      setDeletingAssignment(null);
      await loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Could not delete this assignment');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground">Create work, review submissions, and grade your assigned classes</p>
          </div>
          <Button
            onClick={() => {
              setEditingAssignment(null);
              setFormDialogOpen(true);
            }}
            disabled={loading || assignableClasses.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create assignment
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">
                {searchQuery ? 'No matching assignments' : 'No assignments for your assigned classes'}
              </h3>
              <p className="max-w-lg text-muted-foreground">
                {searchQuery
                  ? 'Try another search.'
                  : assignableClasses.length === 0
                    ? 'You can create assignments when classes are added to your timetable or delegated to you.'
                    : 'Create an assignment for one of your classes to get started.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map((assignment) => {
              const isOwnAssignment = assignment.created_by === user?.id && assignment.created_by_role === 'officer';

              return (
                <Card key={assignment.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-lg">{assignment.title}</CardTitle>
                      {getStatusBadge(assignment)}
                    </div>
                    {assignment.description && (
                      <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {format(new Date(assignment.submission_end_date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{assignment.classes?.length || 0} assigned classes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{assignment.submissions_count || 0} submissions</span>
                    </div>
                    {assignment.total_marks ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>Total marks: {assignment.total_marks}</span>
                      </div>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setSubmissionsDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View submissions
                    </Button>
                    {isOwnAssignment && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingAssignment(assignment);
                            setFormDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingAssignment(assignment);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label={`Delete ${assignment.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {assignableClasses.length === 0 && !loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Assignment access follows your timetable and active class delegations.
          </p>
        ) : null}

        <ManagementAssignmentFormDialog
          open={formDialogOpen}
          onOpenChange={(open) => {
            setFormDialogOpen(open);
            if (!open) setEditingAssignment(null);
          }}
          institutionId={institutionId || ''}
          assignment={editingAssignment}
          availableClasses={assignableClasses}
          creatorRole="officer"
          onSubmit={handleSaveAssignment}
        />

        <AssignmentSubmissionsDialog
          open={submissionsDialogOpen}
          onOpenChange={setSubmissionsDialogOpen}
          assignment={selectedAssignment}
          allowedClassIds={classIds}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
              <AlertDialogDescription>
                Deleting “{deletingAssignment?.title}” also removes its student submissions and grades. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingAssignment(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAssignment}>Delete assignment</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}