import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, FileText, Clock, PlayCircle, Link as LinkIcon, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useClassCourseAssignments';
import { ContentViewerDialog } from '@/components/student/ContentViewerDialog';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  youtube_url?: string;
  file_path?: string;
  duration_minutes?: number;
  isCompleted?: boolean;
}

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);

  // Fetch student courses from Supabase
  const { data: assignedCourses, isLoading } = useStudentCourses(user?.id, user?.class_id);
  
  // Find the specific course assignment
  const courseAssignment = assignedCourses?.find(a => a.course_id === courseId);
  const course = courseAssignment?.course;
  const modules = courseAssignment?.modules || [];

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground text-center">
              This course is not available or has not been assigned to your class.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const learningOutcomes = Array.isArray(course.learning_outcomes) 
    ? course.learning_outcomes 
    : [];

  return (
    <Layout>
      <div className="space-y-6">
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
                    <p className="font-medium capitalize">{course.category?.replace('_', ' ')}</p>
                  </div>
                </div>
                {learningOutcomes.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Learning Outcomes</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {learningOutcomes.map((outcome: string, i: number) => (
                        <li key={i}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h3 className="font-medium mb-2">Available Content</h3>
                  <p className="text-muted-foreground">
                    {modules.length} module{modules.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {modules.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
                  <p className="text-muted-foreground text-center">
                    Content for this course has not been unlocked yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              modules.map((moduleAssignment) => {
                const module = moduleAssignment.module;
                const sessions = moduleAssignment.sessions || [];
                
                return (
                  <Card key={moduleAssignment.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {module?.title || 'Module'}
                      </CardTitle>
                      {module?.description && (
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sessions available</p>
                      ) : (
                        sessions.map((sessionAssignment) => {
                          const session = sessionAssignment.session;
                          const contentItems = sessionAssignment.content || [];
                          
                          return (
                            <div key={sessionAssignment.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4" />
                                    {session?.title || 'Session'}
                                  </h4>
                                  {session?.description && (
                                    <p className="text-sm text-muted-foreground">{session.description}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2 pt-2">
                                {contentItems.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No content available</p>
                                ) : (
                                  contentItems.map((item: ContentItem) => (
                                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/30">
                                      <div className="flex items-center gap-2">
                                        {getContentIcon(item.type)}
                                        <span className="text-sm">{item.title}</span>
                                        {item.duration_minutes && (
                                          <Badge variant="outline" className="text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {item.duration_minutes} min
                                          </Badge>
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
                                        View
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
              })
            )}
          </TabsContent>
        </Tabs>

        <ContentViewerDialog
          open={contentDialogOpen}
          onOpenChange={setContentDialogOpen}
          content={selectedContent}
          isCompleted={false}
          onMarkComplete={() => {}}
          viewOnly={true}
        />
      </div>
    </Layout>
  );
}