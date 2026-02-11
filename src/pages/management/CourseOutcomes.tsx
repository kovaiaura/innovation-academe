import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CourseOutcomeAnalytics } from '@/components/course-outcomes/CourseOutcomeAnalytics';
import { useCourseOutcomeAnalytics } from '@/hooks/useCourseOutcomeAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const ManagementCourseOutcomes = () => {
  const { user } = useAuth();
  const institutionId = user?.institution_id;
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  
  const { classes } = useClasses(institutionId);
  const { students } = useStudents(institutionId);

  const filteredStudents = selectedClass !== 'all'
    ? (students || []).filter(s => s.class_id === selectedClass)
    : students || [];

  const { data, isLoading } = useCourseOutcomeAnalytics({
    institutionId,
    classId: selectedClass !== 'all' ? selectedClass : undefined,
    studentId: selectedStudent !== 'all' ? selectedStudent : undefined,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Course Outcome Analytics</h1>
          <p className="text-muted-foreground">Institution-wide student performance analysis by course topics</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Class</Label>
            <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudent('all'); }}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {(classes || []).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.class_name}{c.section ? ` - ${c.section}` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {filteredStudents.map(s => (
                  <SelectItem key={s.id} value={s.user_id || s.id}>{s.student_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CourseOutcomeAnalytics data={data || { courseAccuracies: [], moduleAccuracies: [], sessionAccuracies: [], strengths: [], weaknesses: [] }} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default ManagementCourseOutcomes;
