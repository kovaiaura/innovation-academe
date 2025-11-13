import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssignmentCard } from '@/components/assignment-management/AssignmentCard';
import { mockAssignments, mockSubmissions, mockStudentAssignmentSummary } from '@/data/mockAssignmentManagement';
import { StandaloneAssignment, StandaloneAssignmentSubmission } from '@/types/assignment-management';
import { formatDueDate, getDueDateCountdown, getGradePercentage } from '@/utils/assignmentHelpers';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Calendar, Award } from 'lucide-react';

export default function Assignments() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const summary = mockStudentAssignmentSummary;

  // Mock: Filter assignments for current student
  const pendingAssignments = mockAssignments.filter(a => a.status === 'ongoing');
  const submittedSubmissions = mockSubmissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = mockSubmissions.filter(s => s.status === 'graded');

  const handleStartAssignment = (assignment: StandaloneAssignment) => {
    // Navigate to take assignment page
    navigate(`/tenant/tenant-1/student/assignments/${assignment.id}/take`);
  };

  const handleViewFeedback = (submission: StandaloneAssignmentSubmission) => {
    // Navigate to feedback page
    navigate(`/tenant/tenant-1/student/assignments/${submission.assignment_id}/feedback`);
  };

  const renderSubmissionCard = (submission: StandaloneAssignmentSubmission) => {
    const assignment = mockAssignments.find(a => a.id === submission.assignment_id);
    if (!assignment) return null;

    const isGraded = submission.status === 'graded';
    const percentage = isGraded && submission.grade
      ? getGradePercentage(submission.grade, submission.max_grade)
      : 0;

    return (
      <Card key={submission.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {assignment.description}
              </p>
            </div>
            {isGraded ? (
              <Badge variant="default">
                {submission.grade}/{submission.max_grade}
              </Badge>
            ) : (
              <Badge variant="outline">Pending Review</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Submitted: {new Date(submission.submitted_at!).toLocaleDateString()}</span>
            </div>
            {submission.is_late && (
              <Badge variant="destructive" className="text-xs">
                Late
              </Badge>
            )}
          </div>

          {isGraded && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{percentage}%</span>
              </div>

              {submission.feedback && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Feedback:</p>
                  <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleViewFeedback(submission)}
              >
                <Award className="h-4 w-4 mr-2" />
                View Detailed Feedback
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground mt-1">
          View and complete your assignments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{summary.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{summary.submitted}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Graded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{summary.graded}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold">{summary.overdue}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search assignments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({summary.pending})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({summary.submitted})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Graded ({summary.graded})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                mode="student-view"
                onStart={handleStartAssignment}
              />
            ))}
          </div>

          {pendingAssignments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending assignments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Submitted Tab */}
        <TabsContent value="submitted" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submittedSubmissions.map(renderSubmissionCard)}
          </div>

          {submittedSubmissions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No submitted assignments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Graded Tab */}
        <TabsContent value="graded" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gradedSubmissions.map(renderSubmissionCard)}
          </div>

          {gradedSubmissions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No graded assignments yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </Layout>
  );
}
