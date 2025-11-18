import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { StandaloneAssignment } from '@/types/assignment-management';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { Calendar, Clock, FileText, Target, Users, Building, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentDetailsDialogProps {
  assignment: StandaloneAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignmentDetailsDialog({ assignment, open, onOpenChange }: AssignmentDetailsDialogProps) {
  if (!assignment) return null;

  const submissionTypeLabels: Record<string, string> = {
    file_upload: 'File Upload',
    text_submission: 'Text Submission',
    url_submission: 'URL Submission',
    multi_question: 'Multi-Question',
  };

  const latePolicyLabels: Record<string, string> = {
    not_allowed: 'Not Allowed',
    allowed_with_penalty: `Allowed (${assignment.late_penalty_percentage}% penalty)`,
    allowed_no_penalty: 'Allowed (No Penalty)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{assignment.title}</DialogTitle>
              <DialogDescription className="mt-2">{assignment.description}</DialogDescription>
            </div>
            <AssignmentStatusBadge status={assignment.status} />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">
                      {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                      {assignment.due_time && ` at ${assignment.due_time}`}
                    </span>
                  </div>
                  {assignment.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{assignment.duration_minutes} minutes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Points:</span>
                    <span className="font-medium">{assignment.total_points}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{submissionTypeLabels[assignment.submission_type]}</Badge>
                  </div>
                </div>

                {assignment.instructions && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Instructions:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignment.instructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Submission Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submission Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground min-w-[140px]">Late Submission:</span>
                  <span>{latePolicyLabels[assignment.late_submission_policy]}</span>
                </div>
                {assignment.allowed_file_types && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground min-w-[140px]">Allowed File Types:</span>
                    <div className="flex flex-wrap gap-1">
                      {assignment.allowed_file_types.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {assignment.max_file_size_mb && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground min-w-[140px]">Max File Size:</span>
                    <span>{assignment.max_file_size_mb} MB</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rubric */}
            {assignment.rubric && assignment.rubric.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grading Rubric</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignment.rubric.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.criteria}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {item.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Questions (for multi-question assignments) */}
            {assignment.questions && assignment.questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Questions ({assignment.questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignment.questions.map((q, index) => (
                      <div key={q.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">
                            {index + 1}. {q.question_text}
                          </p>
                          <Badge variant="outline">{q.points} pts</Badge>
                        </div>
                        {q.options && (
                          <div className="ml-4 space-y-1">
                            {q.options.map((option, i) => (
                              <div key={i} className="text-sm flex items-center gap-2">
                                <span className="text-muted-foreground">{String.fromCharCode(65 + i)})</span>
                                <span>{option}</span>
                                {option === q.correct_answer && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Publishing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Published To
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.publishing.map((pub) => (
                    <div key={pub.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{pub.institution_name}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pub.class_names.map((className, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {className}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submission Stats */}
            {assignment.total_submissions !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Submission Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold">{assignment.total_submissions}</p>
                      <p className="text-sm text-muted-foreground">Total Submissions</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-2xl font-bold">{assignment.graded_submissions || 0}</p>
                      <p className="text-sm text-muted-foreground">Graded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {assignment.attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {file.size_mb} MB
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created by: {assignment.created_by_name}</p>
                  <p>Created at: {format(new Date(assignment.created_at), 'MMM dd, yyyy HH:mm')}</p>
                  {assignment.published_at && (
                    <p>Published at: {format(new Date(assignment.published_at), 'MMM dd, yyyy HH:mm')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
