import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/components/course/StorageImage";
import { useCurrentUserInstitution } from "@/hooks/useCurrentUserInstitution";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ManagementCoursesView() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { institutionId } = useCurrentUserInstitution();

  // Fetch only courses assigned to this institution
  const { data: courses, isLoading } = useQuery({
    queryKey: ['institution-assigned-courses', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];

      // Get assignments for this institution
      const { data: assignments, error: assignErr } = await supabase
        .from('course_institution_assignments')
        .select('course_id, selected_module_ids, selected_session_ids')
        .eq('institution_id', institutionId);
      if (assignErr) throw assignErr;
      if (!assignments || assignments.length === 0) return [];

      const courseIds = assignments.map(a => a.course_id);

      // Fetch the assigned courses
      const { data: coursesData, error: coursesErr } = await supabase
        .from('courses')
        .select('id, title, course_code, description, category, difficulty, status, thumbnail_url, duration_weeks, learning_outcomes, created_at')
        .in('id', courseIds)
        .in('status', ['active', 'published'])
        .order('created_at', { ascending: false });
      if (coursesErr) throw coursesErr;
      if (!coursesData || coursesData.length === 0) return [];

      const BATCH_SIZE = 50;
      const fetchedCourseIds = coursesData.map(c => c.id);

      // Get modules
      const modules: any[] = [];
      for (let i = 0; i < fetchedCourseIds.length; i += BATCH_SIZE) {
        const batch = fetchedCourseIds.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase
          .from('course_modules')
          .select('id, course_id, title, description, display_order')
          .in('course_id', batch)
          .order('display_order', { ascending: true });
        if (error) throw error;
        if (data) modules.push(...data);
      }

      // Get sessions
      const moduleIds = modules.map(m => m.id);
      const sessions: any[] = [];
      for (let i = 0; i < moduleIds.length; i += BATCH_SIZE) {
        const batch = moduleIds.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase
          .from('course_sessions')
          .select('id, module_id, title, description, display_order')
          .in('module_id', batch)
          .order('display_order', { ascending: true });
        if (error) throw error;
        if (data) sessions.push(...data);
      }

      // Get content
      const sessionIds = sessions.map(s => s.id);
      const content: any[] = [];
      for (let i = 0; i < sessionIds.length; i += BATCH_SIZE) {
        const batch = sessionIds.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase
          .from('course_content')
          .select('id, course_id, module_id, session_id, title, type, file_path, youtube_url, duration_minutes, file_size_mb, display_order, views_count, created_at')
          .in('session_id', batch)
          .order('display_order', { ascending: true });
        if (error) throw error;
        if (data) content.push(...data);
      }

      // Build assignment lookup
      const assignmentMap = new Map(assignments.map(a => [a.course_id, a]));

      // Combine and filter by selected modules/sessions
      return coursesData.map(course => {
        const assignment = assignmentMap.get(course.id);
        const selectedModuleIds = assignment?.selected_module_ids as string[] | null;
        const selectedSessionIds = assignment?.selected_session_ids as string[] | null;

        const courseModules = modules
          .filter(m => m.course_id === course.id)
          .filter(m => !selectedModuleIds || selectedModuleIds.includes(m.id));

        return {
          ...course,
          modules: courseModules.map(m => ({
            id: m.id,
            module: { id: m.id, title: m.title, description: m.description },
            is_unlocked: true,
            sessions: sessions
              .filter(s => s.module_id === m.id)
              .filter(s => !selectedSessionIds || selectedSessionIds.includes(s.id))
              .map(s => ({
                id: s.id,
                session: { id: s.id, title: s.title, description: s.description },
                is_unlocked: true,
                content: content.filter(c => c.session_id === s.id),
              })),
          })),
        };
      });
    },
    enabled: !!institutionId,
  });

  // Apply search filter
  const filteredCourses = (courses || []).filter(course => {
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
        <h2 className="text-2xl font-bold">Assigned Courses</h2>
        <p className="text-muted-foreground">
          Courses assigned to your institution
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
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery
              ? "No courses found matching your search."
              : "No courses have been assigned to your institution yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(course.id)}>
              <div className="aspect-video bg-muted relative">
                {course.thumbnail_url ? (
                  <StorageImage
                    filePath={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <BookOpen className="h-12 w-12 text-primary/50" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2 mb-1">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{course.course_code}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {course.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {course.modules?.length || 0} modules
                  </span>
                  <Button size="sm" variant="outline">
                    View Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
