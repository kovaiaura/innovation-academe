import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { CourseCard } from "./CourseCard";
import { useInstitutionCourseAssignments } from "@/hooks/useClassCourseAssignments";

interface ManagementCoursesViewProps {
  institutionId: string;
}

export function ManagementCoursesView({ institutionId }: ManagementCoursesViewProps) {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch courses assigned to this institution from Supabase
  const { data: institutionCourses, isLoading } = useInstitutionCourseAssignments(institutionId);

  // Apply search filter only
  const filteredCourses = (institutionCourses || []).filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleViewDetails = (courseId: string) => {
    navigate(`/tenant/${tenantId}/management/courses/${courseId}`);
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
        <h2 className="text-2xl font-bold">Courses Assigned to Your Institution</h2>
        <p className="text-muted-foreground">
          Browse and view all courses available for your classes
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No courses found matching your search."
              : "No courses assigned to this institution yet."}
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
    </div>
  );
}