import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { CourseCard } from "./CourseCard";
import { CoursePerformanceDialog } from "./CoursePerformanceDialog";
import { useInstitutionCourseAssignments } from "@/hooks/useClassCourseAssignments";

interface ManagementCoursesViewProps {
  institutionId: string;
}

export function ManagementCoursesView({ institutionId }: ManagementCoursesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch courses assigned to this institution from Supabase
  const { data: institutionCourses, isLoading } = useInstitutionCourseAssignments(institutionId);

  // Apply filters
  const filteredCourses = (institutionCourses || []).filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleViewDetails = (courseId: string) => {
    setSelectedCourseId(courseId);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">STEM Course Catalog</h2>
        <p className="text-muted-foreground">
          View courses assigned to your institution
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ai_ml">AI/ML</SelectItem>
            <SelectItem value="web_dev">Web Development</SelectItem>
            <SelectItem value="iot">IoT</SelectItem>
            <SelectItem value="robotics">Robotics</SelectItem>
            <SelectItem value="data_science">Data Science</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== "all" || difficultyFilter !== "all"
              ? "No courses found matching your filters."
              : "No STEM courses assigned to this institution yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                title: course.title || '',
                course_code: course.course_code || '',
                description: course.description || '',
                category: course.category || 'general',
                difficulty: course.difficulty || 'beginner',
                thumbnail_url: course.thumbnail_url || null,
                duration_weeks: course.duration_weeks || 4,
                status: course.status || 'published',
                learning_outcomes: Array.isArray(course.learning_outcomes) ? course.learning_outcomes as string[] : [],
                classes: (course.classes || []).map((c: any) => c.class_name || 'Unknown'),
                total_enrollments: (course.classes || []).length,
                current_enrollments: (course.classes || []).length,
                avg_progress: 0,
                created_by: null,
                created_at: '',
                updated_at: '',
              }}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Course Performance Dialog */}
      <CoursePerformanceDialog
        courseId={selectedCourseId}
        institutionId={institutionId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}