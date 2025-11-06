import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Video, FileText, CheckCircle, Clock, PlayCircle, Link as LinkIcon } from 'lucide-react';
import { mockCourses, mockModules, mockSessions, mockContent, mockAssignments, mockQuizzes } from '@/data/mockCourseData';
import { useAuth } from '@/contexts/AuthContext';
import { useContentProgress } from '@/hooks/useContentProgress';
import { ContentViewerDialog } from '@/components/student/ContentViewerDialog';
import { CourseCompletionBanner } from '@/components/student/CourseCompletionBanner';
import { CertificatePreviewDialog } from '@/components/student/CertificatePreviewDialog';
import { checkCourseCompletion } from '@/utils/courseCompletionHelpers';
import { generateCourseCertificate, storeCertificate, getCertificateByCourse } from '@/utils/certificateGenerator';
import { AssignmentSubmission, QuizAttempt, CourseContent, Assignment, Quiz } from '@/types/course';
import { mockStudents } from '@/data/mockStudentData';
import { getOfficerByTenant } from '@/data/mockOfficerData';
import { toast } from 'sonner';

export default function StudentCourseDetail() {
  const { courseId, tenantId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [courseCompleted, setCourseCompleted] = useState(false);

  const studentId = user?.id || 'springfield-8-A-001';
  const student = mockStudents.find(s => s.id === studentId);
  const officer = getOfficerByTenant(tenantId || 'springfield');
  
  const { completedContentIds, markContentComplete, isContentComplete } = useContentProgress(studentId, courseId || '');
  
  const course = mockCourses.find(c => c.id === courseId);
  const modules = mockModules.filter(m => m.course_id === courseId).sort((a, b) => a.order - b.order);
  const sessions = mockSessions.filter(s => s.course_id === courseId);
  const content = mockContent.filter(c => c.course_id === courseId);
  const assignments = mockAssignments.filter(a => a.course_id === courseId);
  const quizzes = mockQuizzes.filter(q => q.course_id === courseId);

  // Helper functions for session hierarchy
  const getModuleSessions = (moduleId: string) => {
    return sessions
      .filter(s => s.module_id === moduleId)
      .sort((a, b) => a.order - b.order);
  };

  const getSessionContent = (sessionId: string) => {
    return content
      .filter(c => c.session_id === sessionId)
      .sort((a, b) => a.order - b.order);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'youtube':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'ppt':
        return <FileText className="h-4 w-4" />;
      case 'link':
      case 'simulation':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

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
              const moduleSessions = getModuleSessions(module.id);
              return (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Module {module.order}: {module.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {moduleSessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sessions available</p>
                    ) : (
                      moduleSessions.map((session) => {
                        const sessionContent = getSessionContent(session.id);
                        return (
                          <div key={session.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium flex items-center gap-2">
                                  <PlayCircle className="h-4 w-4" />
                                  Session {session.order}: {session.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">{session.description}</p>
                                {session.duration_minutes && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {session.duration_minutes} min
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {session.learning_objectives && session.learning_objectives.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Learning Objectives:</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5 ml-4 list-disc">
                                  {session.learning_objectives.map((obj, idx) => (
                                    <li key={idx}>{obj}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="space-y-2 pt-2">
                              {sessionContent.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No content available</p>
                              ) : (
                                sessionContent.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-2">
                                      {getContentIcon(item.type)}
                                      <span className="text-sm">{item.title}</span>
                                      {isContentComplete(item.id) && (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => { 
                                        setSelectedContent(item); 
                                        setContentDialogOpen(true); 
                                      }}
                                    >
                                      {isContentComplete(item.id) ? 'Review' : 'View'}
                                    </Button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
