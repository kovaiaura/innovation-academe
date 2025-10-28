import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Upload, FileText, Video, Link as LinkIcon, Search, Filter, Edit, Trash2, Copy, BarChart3, Users, TrendingUp, Award, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { mockCourses, mockModules, mockContent, mockAssignments, mockQuizzes, mockCourseAssignments, mockCourseAnalytics } from '@/data/mockCourseData';

export default function CourseManagement() {
  const [activeTab, setActiveTab] = useState('all-courses');
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  // Course creation form state
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    title: '',
    description: '',
    category: 'ai_ml',
    difficulty: 'beginner',
    duration_weeks: 8,
    prerequisites: '',
    learning_outcomes: ['']
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courseStats = {
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    draft: courses.filter(c => c.status === 'draft').length,
    totalEnrollments: mockCourseAnalytics.reduce((sum, a) => sum + a.total_enrollments, 0)
  };

  const handleCreateCourse = () => {
    toast.success('Course created successfully!');
    setActiveTab('all-courses');
  };

  const categoryColors: Record<string, string> = {
    ai_ml: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    web_dev: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    iot: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    robotics: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    data_science: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and assign courses across institutions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all-courses">All Courses</TabsTrigger>
            <TabsTrigger value="create">Create Course</TabsTrigger>
            <TabsTrigger value="content">Content Library</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Tab 1: All Courses */}
          <TabsContent value="all-courses" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courseStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courseStats.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft Courses</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courseStats.draft}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courseStats.totalEnrollments}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Courses</CardTitle>
                    <CardDescription>Manage your course library</CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.course_code}</TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>
                            <Badge className={categoryColors[course.category] || ''}>
                              {course.category.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={difficultyColors[course.difficulty]}>
                              {course.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>{course.duration_weeks} weeks</TableCell>
                          <TableCell>
                            <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Create Course */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
                <CardDescription>Fill in the course details to create a new course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Course Code *</Label>
                    <Input
                      placeholder="e.g., AI101"
                      value={newCourse.course_code}
                      onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Title *</Label>
                    <Input
                      placeholder="e.g., Introduction to AI"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Provide a detailed course description..."
                    className="min-h-32"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={newCourse.category} onValueChange={(value) => setNewCourse({ ...newCourse, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_ml">AI/ML</SelectItem>
                        <SelectItem value="web_dev">Web Development</SelectItem>
                        <SelectItem value="iot">IoT</SelectItem>
                        <SelectItem value="robotics">Robotics</SelectItem>
                        <SelectItem value="data_science">Data Science</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty *</Label>
                    <Select value={newCourse.difficulty} onValueChange={(value) => setNewCourse({ ...newCourse, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (weeks) *</Label>
                    <Input
                      type="number"
                      value={newCourse.duration_weeks}
                      onChange={(e) => setNewCourse({ ...newCourse, duration_weeks: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Prerequisites</Label>
                  <Textarea
                    placeholder="List any prerequisites for this course..."
                    value={newCourse.prerequisites}
                    onChange={(e) => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Learning Outcomes</Label>
                  {newCourse.learning_outcomes.map((outcome, index) => (
                    <Input
                      key={index}
                      placeholder={`Learning outcome ${index + 1}`}
                      value={outcome}
                      onChange={(e) => {
                        const updated = [...newCourse.learning_outcomes];
                        updated[index] = e.target.value;
                        setNewCourse({ ...newCourse, learning_outcomes: updated });
                      }}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewCourse({ ...newCourse, learning_outcomes: [...newCourse.learning_outcomes, ''] })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Outcome
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleCreateCourse}>Save & Publish</Button>
                  <Button variant="outline">Save as Draft</Button>
                  <Button variant="ghost">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Content Library */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Content Library</CardTitle>
                    <CardDescription>Upload and manage course materials</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Course Content</DialogTitle>
                        <DialogDescription>
                          Upload files, videos, or add external links
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Course</Label>
                          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.course_code} - {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Content Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF Document</SelectItem>
                              <SelectItem value="ppt">PowerPoint</SelectItem>
                              <SelectItem value="video">Video Upload</SelectItem>
                              <SelectItem value="youtube">YouTube Link</SelectItem>
                              <SelectItem value="link">External Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input placeholder="Content title" />
                        </div>
                        <Button className="w-full">Upload</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockContent.map((content) => {
                        const course = courses.find(c => c.id === content.course_id);
                        return (
                          <TableRow key={content.id}>
                            <TableCell className="font-medium">{content.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {content.type === 'pdf' && <FileText className="h-4 w-4" />}
                                {content.type === 'video' && <Video className="h-4 w-4" />}
                                {content.type === 'youtube' && <Video className="h-4 w-4 text-red-500" />}
                                <span className="capitalize">{content.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>{course?.course_code}</TableCell>
                            <TableCell>{content.views_count}</TableCell>
                            <TableCell>{content.file_size_mb ? `${content.file_size_mb} MB` : '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Assessments */}
          <TabsContent value="assessments" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Assignments</CardTitle>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAssignments.map((assignment) => {
                      const course = courses.find(c => c.id === assignment.course_id);
                      return (
                        <div key={assignment.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                          <div>
                            <h4 className="font-medium">{assignment.title}</h4>
                            <p className="text-sm text-muted-foreground">{course?.course_code}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                              <span>{assignment.total_points} pts</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Quizzes</CardTitle>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockQuizzes.map((quiz) => {
                      const course = courses.find(c => c.id === quiz.course_id);
                      return (
                        <div key={quiz.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                          <div>
                            <h4 className="font-medium">{quiz.title}</h4>
                            <p className="text-sm text-muted-foreground">{course?.course_code}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {quiz.time_limit_minutes} min
                              </span>
                              <span>{quiz.attempts_allowed} attempts</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 5: Course Assignments */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Course Assignments</CardTitle>
                    <CardDescription>Assign courses to institutions and officers</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Class Level</TableHead>
                        <TableHead>Officer(s)</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCourseAssignments.map((assignment) => {
                        const course = courses.find(c => c.id === assignment.course_id);
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{course?.course_code}</TableCell>
                            <TableCell>{assignment.institution_name}</TableCell>
                            <TableCell>{assignment.class_level}</TableCell>
                            <TableCell>{assignment.officer_names.join(', ')}</TableCell>
                            <TableCell>
                              {assignment.current_enrollments}
                              {assignment.max_enrollments && ` / ${assignment.max_enrollments}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant={assignment.status === 'ongoing' ? 'default' : 'secondary'}>
                                {assignment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockCourseAnalytics.reduce((sum, a) => sum + a.total_enrollments, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(mockCourseAnalytics.reduce((sum, a) => sum + a.completion_rate, 0) / mockCourseAnalytics.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Course completion</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Assignment Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(mockCourseAnalytics.reduce((sum, a) => sum + a.average_assignment_score, 0) / mockCourseAnalytics.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Student performance</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Quiz Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(mockCourseAnalytics.reduce((sum, a) => sum + a.average_quiz_score, 0) / mockCourseAnalytics.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Assessment performance</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Detailed analytics for each course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Completion Rate</TableHead>
                        <TableHead>Avg Score</TableHead>
                        <TableHead>Submission Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCourseAnalytics.map((analytics) => (
                        <TableRow key={analytics.course_id}>
                          <TableCell className="font-medium">{analytics.course_title}</TableCell>
                          <TableCell>{analytics.total_enrollments}</TableCell>
                          <TableCell>{analytics.active_students}</TableCell>
                          <TableCell>{analytics.completed_students}</TableCell>
                          <TableCell>{analytics.completion_rate.toFixed(1)}%</TableCell>
                          <TableCell>{analytics.average_assignment_score.toFixed(1)}%</TableCell>
                          <TableCell>{analytics.assignment_submission_rate.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
