import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { mockCourses, mockModules, mockContent, mockAssignments, mockQuizzes, mockCourseAssignments, mockCourseAnalytics } from '@/data/mockCourseData';
import { ModuleBuilder } from '@/components/course/ModuleBuilder';
import { CreateAssignmentDialog } from '@/components/course/CreateAssignmentDialog';
import { CreateQuizDialog } from '@/components/course/CreateQuizDialog';
import { AssignCourseDialog } from '@/components/course/AssignCourseDialog';
import { courseService } from '@/services/course.service';
import { Assignment, Quiz, CourseAssignmentRequest } from '@/types/course';

export default function CourseManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all-courses');
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignments, setAssignments] = useState(mockAssignments);
  const [quizzes, setQuizzes] = useState(mockQuizzes);
  const [courseAssignments, setCourseAssignments] = useState(mockCourseAssignments);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [assignCourseDialogOpen, setAssignCourseDialogOpen] = useState(false);
  
  // Course creation form state
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    title: '',
    description: '',
    category: 'ai_ml',
    thumbnail_url: '',
    difficulty: 'beginner',
    duration_weeks: 8,
    prerequisites: '',
    learning_outcomes: [''],
    modules: [] as any[]
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

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

  const handleCreateCourse = (isDraft = false) => {
    if (!newCourse.title || !newCourse.course_code) {
      toast.error("Please fill in course title and code");
      return;
    }

    console.log("Creating course:", { ...newCourse, status: isDraft ? 'draft' : 'active' });
    toast.success(`Course ${isDraft ? 'saved as draft' : 'created and published'} successfully!`);
    
    // Reset form after creation
    setNewCourse({
      course_code: '',
      title: '',
      description: '',
      category: 'ai_ml',
      thumbnail_url: '',
      difficulty: 'beginner',
      duration_weeks: 8,
      prerequisites: '',
      learning_outcomes: [''],
      modules: []
    });
    setThumbnailPreview('');
    setActiveTab('all-courses');
  };

  const handleCreateAssignment = async (data: Partial<Assignment>) => {
    try {
      const response = await courseService.createAssignment(data.course_id!, data);
      if (response.success) {
        setAssignments([...assignments, response.data]);
        toast.success('Assignment created successfully!');
        setAssignmentDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to create assignment');
      console.error(error);
    }
  };

  const handleCreateQuiz = async (data: Partial<Quiz>) => {
    try {
      const response = await courseService.createQuiz(data.course_id!, data);
      if (response.success) {
        setQuizzes([...quizzes, response.data]);
        toast.success('Quiz created successfully!');
        setQuizDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to create quiz');
      console.error(error);
    }
  };

  const handleAssignCourse = async (data: CourseAssignmentRequest) => {
    try {
      const response = await courseService.assignCourse(data);
      if (response.success) {
        setCourseAssignments([...courseAssignments, response.data]);
        toast.success('Course assigned successfully!');
        setAssignCourseDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to assign course');
      console.error(error);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
      setNewCourse({ ...newCourse, thumbnail_url: reader.result as string });
    };
    reader.readAsDataURL(file);

    toast.success('Thumbnail uploaded successfully');
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-courses">All Courses</TabsTrigger>
            <TabsTrigger value="create">Create Course</TabsTrigger>
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

{filteredCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTerm 
                        ? `No courses match "${searchTerm}"`
                        : "Get started by creating your first course"
                      }
                    </p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Course
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCourses.map((course) => (
                      <Card 
                        key={course.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                        onClick={() => navigate(`/system-admin/courses/${course.id}`)}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={course.thumbnail_url || '/placeholder.svg'}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <Badge 
                            className="absolute top-2 right-2" 
                            variant={course.status === 'active' ? 'default' : 'secondary'}
                          >
                            {course.status}
                          </Badge>
                        </div>

                        {/* Card Content */}
                        <CardContent className="p-4 space-y-3">
                          {/* Category Badge */}
                          <Badge className={categoryColors[course.category] || ''}>
                            {course.category.replace('_', ' ').toUpperCase()}
                          </Badge>

                          {/* Course Info */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{course.course_code}</p>
                            <h3 className="font-semibold text-lg line-clamp-2 mb-2">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          </div>

                          {/* Stats */}
                          <Separator />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.duration_weeks}w
                              </span>
                              <Badge variant="outline" className={difficultyColors[course.difficulty]}>
                                {course.difficulty}
                              </Badge>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/system-admin/courses/${course.id}`);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.success('Course duplicated');
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.success('Course deleted');
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Create Course */}
          <TabsContent value="create" className="space-y-6">
            {/* Basic Course Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Course Information</CardTitle>
                <CardDescription>Enter the fundamental details of your course</CardDescription>
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

                <div className="space-y-2">
                  <Label>Course Thumbnail</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload a cover image for your course (Recommended: 1280x720px, Max: 5MB)
                  </p>
                  
                  {!thumbnailPreview ? (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label htmlFor="thumbnail-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Course thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setThumbnailPreview('');
                          setNewCourse({ ...newCourse, thumbnail_url: '' });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  )}
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
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Learning outcome ${index + 1}`}
                        value={outcome}
                        onChange={(e) => {
                          const updated = [...newCourse.learning_outcomes];
                          updated[index] = e.target.value;
                          setNewCourse({ ...newCourse, learning_outcomes: updated });
                        }}
                      />
                      {newCourse.learning_outcomes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const updated = newCourse.learning_outcomes.filter((_, i) => i !== index);
                            setNewCourse({ ...newCourse, learning_outcomes: updated });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
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
              </CardContent>
            </Card>

            {/* Course Structure - Modules and Content */}
            <Card>
              <CardHeader>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>
                  Build your course by adding modules and uploading content (PDFs, videos, presentations, YouTube links, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModuleBuilder
                  modules={newCourse.modules}
                  onChange={(modules) => setNewCourse({ ...newCourse, modules })}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button onClick={() => handleCreateCourse(false)} className="flex-1">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Save & Publish Course
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleCreateCourse(true)}>
                    Save as Draft
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setNewCourse({
                        course_code: '',
                        title: '',
                        description: '',
                        category: 'ai_ml',
                        thumbnail_url: '',
                        difficulty: 'beginner',
                        duration_weeks: 8,
                        prerequisites: '',
                        learning_outcomes: [''],
                        modules: []
                      });
                      setThumbnailPreview('');
                      setActiveTab('all-courses');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
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

      <CreateAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        courses={courses}
        modules={mockModules}
        onSubmit={handleCreateAssignment}
      />

      <CreateQuizDialog
        open={quizDialogOpen}
        onOpenChange={setQuizDialogOpen}
        courses={courses}
        modules={mockModules}
        onSubmit={handleCreateQuiz}
      />

      <AssignCourseDialog
        open={assignCourseDialogOpen}
        onOpenChange={setAssignCourseDialogOpen}
        courses={courses}
        onSubmit={handleAssignCourse}
      />
    </Layout>
  );
}
