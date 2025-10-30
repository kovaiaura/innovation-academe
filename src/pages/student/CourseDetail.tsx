import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Video, FileText, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { mockCourses, mockModules, mockContent, mockAssignments, mockQuizzes, mockSubmissions, mockQuizAttempts, mockQuizQuestions } from '@/data/mockCourseData';
import { useAuth } from '@/contexts/AuthContext';
import { useContentProgress } from '@/hooks/useContentProgress';
import { ContentViewerDialog } from '@/components/student/ContentViewerDialog';
import { SubmitAssignmentDialog } from '@/components/student/SubmitAssignmentDialog';
import { TakeQuizDialog } from '@/components/student/TakeQuizDialog';
import { CourseCompletionBanner } from '@/components/student/CourseCompletionBanner';
import { CertificatePreviewDialog } from '@/components/student/CertificatePreviewDialog';
import { checkCourseCompletion } from '@/utils/courseCompletionHelpers';
import { generateCourseCertificate, storeCertificate, getCertificateByCourse } from '@/utils/certificateGenerator';
import { AssignmentSubmission, QuizAttempt, CourseContent } from '@/types/course';
import { mockStudents } from '@/data/mockStudentData';
import { getOfficerByTenant } from '@/data/mockOfficerData';
import { toast } from 'sonner';

export default function StudentCourseDetail() {
  const { courseId, tenantId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [courseCompleted, setCourseCompleted] = useState(false);

  const studentId = user?.id || 'springfield-8-A-001';
  const student = mockStudents.find(s => s.id === studentId);
  const officer = getOfficerByTenant(tenantId || 'springfield');
  
  const { completedContentIds, markContentComplete, isContentComplete } = useContentProgress(studentId, courseId || '');
  
  const course = mockCourses.find(c => c.id === courseId);
  const modules = mockModules.filter(m => m.course_id === courseId);
  const content = mockContent.filter(c => c.course_id === courseId);
  const assignments = mockAssignments.filter(a => a.course_id === courseId);
  const quizzes = mockQuizzes.filter(q => q.course_id === courseId);

  useEffect(() => {
    if (!courseId) return;
    const key = `submissions_${courseId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    setSubmissions(stored);

    const quizKey = `quiz_attempts_${courseId}`;
    const storedAttempts = JSON.parse(localStorage.getItem(quizKey) || '[]');
    setQuizAttempts(storedAttempts);
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !student || !officer) return;
    
    const result = checkCourseCompletion(courseId, studentId, completedContentIds, content, submissions, assignments, quizAttempts, quizzes);
    
    if (result.completed && !courseCompleted) {
      setCourseCompleted(true);
      
      const existingCert = getCertificateByCourse(studentId, courseId);
      if (!existingCert) {
        const cert = generateCourseCertificate(student, course!, officer.name, student.institution_id, new Date().toISOString());
        storeCertificate(cert);
        toast.success('🎉 Certificate generated!');
      }
    }
  }, [completedContentIds, submissions, quizAttempts]);

  if (!course) return <Layout><div>Course not found</div></Layout>;

  const certificate = getCertificateByCourse(studentId, courseId || '');
  const { progressPercentage } = checkCourseCompletion(courseId || '', studentId, completedContentIds, content, submissions, assignments, quizAttempts, quizzes);

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = submissions.find(s => s.assignment_id === assignmentId && s.student_id === studentId);
    return submission;
  };

  const getQuizStatus = (quizId: string) => {
    const attempts = quizAttempts.filter(qa => qa.quiz_id === quizId && qa.student_id === studentId);
    return attempts.sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0];
  };

  return (
    <Layout>
      <div className="space-y-6">
        {courseCompleted && (
          <CourseCompletionBanner
            courseName={course.title}
            completionDate={new Date().toISOString()}
            onViewCertificate={() => setCertificateDialogOpen(true)}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{course.course_code}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <Badge className="mt-1">{course.difficulty}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{course.duration_weeks} weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{course.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Learning Outcomes</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {course.learning_outcomes.map((outcome, i) => (
                      <li key={i}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Course Progress</h3>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{progressPercentage}% Complete</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {modules.map((module) => {
              const moduleContent = content.filter(c => c.module_id === module.id);
              return (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {moduleContent.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.type === 'video' && <Video className="h-5 w-5" />}
                            {item.type === 'pdf' && <FileText className="h-5 w-5" />}
                            <span>{item.title}</span>
                            {isContentComplete(item.id) && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <Button size="sm" onClick={() => { setSelectedContent(item); setContentDialogOpen(true); }}>
                            {isContentComplete(item.id) ? 'Review' : 'View'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            {assignments.map((assignment) => {
              const submission = getSubmissionStatus(assignment.id);
              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{assignment.title}</span>
                      {submission?.status === 'pending' && <Badge variant="outline" className="bg-yellow-50"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>}
                      {submission?.status === 'graded' && <Badge variant="outline" className="bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Graded: {submission.grade}/{submission.total_points}</Badge>}
                      {!submission && <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Not Submitted</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{assignment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                        <p className="text-sm">Points: {assignment.total_points}</p>
                        {submission?.feedback && <p className="text-sm text-muted-foreground mt-2">Feedback: {submission.feedback}</p>}
                      </div>
                      {!submission && <Button onClick={() => { setSelectedAssignment(assignment); setAssignmentDialogOpen(true); }}>Submit</Button>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            {quizzes.map((quiz) => {
              const bestAttempt = getQuizStatus(quiz.id);
              const attemptCount = quizAttempts.filter(qa => qa.quiz_id === quiz.id && qa.student_id === studentId).length;
              const passed = bestAttempt && (bestAttempt.percentage || 0) >= quiz.pass_percentage;
              return (
                <Card key={quiz.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{quiz.title}</span>
                      {!bestAttempt && <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Not Attempted</Badge>}
                      {passed && <Badge variant="outline" className="bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Passed: {bestAttempt.percentage?.toFixed(1)}%</Badge>}
                      {bestAttempt && !passed && <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed: {bestAttempt.percentage?.toFixed(1)}%</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">{quiz.description}</p>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Time Limit</p>
                          <p className="font-medium">{quiz.time_limit_minutes} minutes</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Attempts</p>
                          <p className="font-medium">{attemptCount} of {quiz.attempts_allowed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pass %</p>
                          <p className="font-medium">{quiz.pass_percentage}%</p>
                        </div>
                      </div>
                      {attemptCount < quiz.attempts_allowed && (
                        <Button onClick={() => { setSelectedQuiz(quiz); setQuizDialogOpen(true); }}>
                          {attemptCount === 0 ? 'Start Quiz' : 'Retry Quiz'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Overall Progress</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Assignments</p>
                    <p className="text-2xl font-bold">1/2</p>
                    <p className="text-sm">Completed</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Quizzes</p>
                    <p className="text-2xl font-bold">1/1</p>
                    <p className="text-sm">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ContentViewerDialog
          open={contentDialogOpen}
          onOpenChange={setContentDialogOpen}
          content={selectedContent}
          isCompleted={selectedContent ? isContentComplete(selectedContent.id) : false}
          onMarkComplete={() => {
            if (selectedContent) markContentComplete(selectedContent.id);
          }}
        />

        {selectedAssignment && student && officer && (
          <SubmitAssignmentDialog
            open={assignmentDialogOpen}
            onOpenChange={setAssignmentDialogOpen}
            assignment={selectedAssignment}
            studentId={studentId}
            studentName={student.student_name}
            courseId={courseId || ''}
            officerId={officer.id}
            onSubmit={(sub) => setSubmissions([...submissions, sub])}
          />
        )}

        {selectedQuiz && student && officer && (
          <TakeQuizDialog
            open={quizDialogOpen}
            onOpenChange={setQuizDialogOpen}
            quiz={selectedQuiz}
            questions={mockQuizQuestions.filter(q => q.quiz_id === selectedQuiz.id)}
            studentId={studentId}
            studentName={student.student_name}
            courseId={courseId || ''}
            officerId={officer.id}
            attemptNumber={quizAttempts.filter(qa => qa.quiz_id === selectedQuiz.id && qa.student_id === studentId).length + 1}
            onSubmit={(attempt) => setQuizAttempts([...quizAttempts, attempt])}
          />
        )}

        {certificate && (
          <CertificatePreviewDialog
            open={certificateDialogOpen}
            onOpenChange={setCertificateDialogOpen}
            certificate={certificate}
          />
        )}
      </div>
    </Layout>
  );
}
