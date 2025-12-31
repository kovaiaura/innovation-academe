import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar, Search, Users, BarChart, Filter, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, isPast, isFuture } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface AssignmentWithClasses {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  submission_end_date: string;
  status: string;
  total_marks: number | null;
  classes: { id: string; name: string }[];
  submissions_count: number;
  graded_count: number;
}

export default function ManagementAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithClasses[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string }[]>([]);
  const institutionId = user?.institution_id || user?.tenant_id;

  useEffect(() => {
    if (institutionId) {
      loadAssignments();
    }
  }, [institutionId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      
      // Fetch assignment class assignments
      const { data: classAssignments } = await supabase
        .from('assignment_class_assignments')
        .select(`
          assignment_id,
          class_id,
          classes:class_id (class_name, section)
        `)
        .eq('institution_id', institutionId);

      if (!classAssignments || classAssignments.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      // Extract unique classes
      const classesMap = new Map<string, { id: string; name: string }>();
      classAssignments.forEach(ca => {
        const classInfo = ca.classes as any;
        if (classInfo) {
          const name = `${classInfo.class_name}${classInfo.section ? ' ' + classInfo.section : ''}`;
          classesMap.set(ca.class_id, { id: ca.class_id, name });
        }
      });
      setAvailableClasses(Array.from(classesMap.values()));

      // Get unique assignment IDs
      const assignmentIds = [...new Set(classAssignments.map(a => a.assignment_id))];

      // Fetch assignment details
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .in('id', assignmentIds);

      // Fetch submission counts
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('assignment_id, status')
        .eq('institution_id', institutionId);

      // Combine data
      const assignmentsWithClasses: AssignmentWithClasses[] = (assignmentData || []).map(assignment => {
        const assignedClassAssignments = classAssignments.filter(ca => ca.assignment_id === assignment.id);
        const classes = assignedClassAssignments
          .map(ca => {
            const classInfo = ca.classes as any;
            return classInfo ? { id: ca.class_id, name: `${classInfo.class_name}${classInfo.section ? ' ' + classInfo.section : ''}` } : null;
          })
          .filter(Boolean) as { id: string; name: string }[];

        const assignmentSubmissions = submissions?.filter(s => s.assignment_id === assignment.id) || [];
        const gradedSubmissions = assignmentSubmissions.filter(s => s.status === 'graded');

        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          start_date: assignment.start_date,
          submission_end_date: assignment.submission_end_date,
          status: assignment.status,
          total_marks: assignment.total_marks,
          classes,
          submissions_count: assignmentSubmissions.length,
          graded_count: gradedSubmissions.length,
        };
      });

      setAssignments(assignmentsWithClasses);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || a.classes.some(c => c.id === selectedClass);
    return matchesSearch && matchesClass;
  });

  const getStatusBadge = (assignment: AssignmentWithClasses) => {
    if (assignment.status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>;
    }
    const now = new Date();
    const start = new Date(assignment.start_date);
    const end = new Date(assignment.submission_end_date);
    
    if (isFuture(start)) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (isPast(end)) {
      return <Badge variant="destructive">Ended</Badge>;
    } else {
      return <Badge className="bg-green-500">Active</Badge>;
    }
  };

  // Stats
  const activeCount = assignments.filter(a => {
    const now = new Date();
    return a.status === 'published' && 
           new Date(a.start_date) <= now && 
           new Date(a.submission_end_date) >= now;
  }).length;

  const completedCount = assignments.filter(a => 
    isPast(new Date(a.submission_end_date))
  ).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments Overview</h1>
          <p className="text-muted-foreground">Monitor all assignments across your institution</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery ? 'Try adjusting your search' : 'No assignments have been created yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{assignment.title}</CardTitle>
                    {getStatusBadge(assignment)}
                  </div>
                  {assignment.description && (
                    <CardDescription className="line-clamp-2">
                      {assignment.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {format(new Date(assignment.submission_end_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{assignment.classes?.length || 0} classes assigned</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{assignment.submissions_count} submissions ({assignment.graded_count} graded)</span>
                  </div>
                  {assignment.total_marks && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart className="h-4 w-4" />
                      <span>Total marks: {assignment.total_marks}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
