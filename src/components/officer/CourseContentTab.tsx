import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Users,
  Clock,
  PlayCircle,
  BarChart3,
  FileText,
  Award,
  Search,
  Layers,
} from 'lucide-react';
import { mockCourses, mockModules, mockContent, mockEnrollments } from '@/data/mockCourseData';
import { useState } from 'react';

export function CourseContentTab() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get assigned courses (in real app, this would come from API)
  const assignedCourses = mockCourses.slice(0, 3);

  // Filter courses based on search and category
  const filteredCourses = assignedCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCourseStats = (courseId: string) => {
    const courseModules = mockModules.filter(m => m.course_id === courseId);
    const lessons = mockContent.filter(c => 
      courseModules.some(m => m.id === c.module_id)
    );
    const enrollments = mockEnrollments.filter(e => e.course_id === courseId);
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length
      : 0;
    
    // Calculate total duration from lessons
    const totalDuration = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
    const hours = Math.floor(totalDuration / 60);

    return {
      modules: courseModules.length,
      lessons: lessons.length,
      hours: hours || 8, // Default to 8 hours if no duration
      enrollments: enrollments.length,
      avgProgress: Math.round(avgProgress),
    };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="programming">Programming</SelectItem>
            <SelectItem value="data-science">Data Science</SelectItem>
            <SelectItem value="web-development">Web Development</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const stats = getCourseStats(course.id);
          
          return (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Course Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-20 w-20 text-primary/30" />
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="capitalize">
                    {course.category.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant={course.difficulty === 'beginner' ? 'default' : 'outline'}>
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.course_code} • {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Layers className="h-3 w-3" />
                      <span>Modules</span>
                    </div>
                    <p className="text-lg font-bold">{stats.modules}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>Lessons</span>
                    </div>
                    <p className="text-lg font-bold">{stats.lessons}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Hours</span>
                    </div>
                    <p className="text-lg font-bold">{stats.hours}</p>
                  </div>
                </div>

                {/* Enrollment Info */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Students Enrolled</span>
                    </div>
                    <span className="font-semibold">{stats.enrollments}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Average Progress</span>
                      <span className="font-semibold">{stats.avgProgress}%</span>
                    </div>
                    <Progress value={stats.avgProgress} className="h-2" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/tenant/${tenantId}/officer/courses/${course.id}/viewer`)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Launch Viewer
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {/* TODO: Open analytics */}}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search filters' : 'No courses have been assigned to you yet'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
