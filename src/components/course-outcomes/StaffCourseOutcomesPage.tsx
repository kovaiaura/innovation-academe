import { useState } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CourseOutcomeAnalytics } from './CourseOutcomeAnalytics';
import { OutcomeAnalysing } from './OutcomeAnalysing';
import { useCourseOutcomeAnalytics } from '@/hooks/useCourseOutcomeAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props { subtitle: string }

export const StaffCourseOutcomesPage = ({ subtitle }: Props) => {
  const { user } = useAuth();
  const institutionId = user?.institution_id;
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [submitted, setSubmitted] = useState<{ classId: string; studentId?: string } | null>(null);

  const { classes } = useClasses(institutionId);
  const { students } = useStudents(institutionId);
  const filteredStudents = selectedClass ? (students || []).filter(s => s.class_id === selectedClass) : [];

  const { data, isFetching, isError, refetch } = useCourseOutcomeAnalytics({
    institutionId,
    enabled: !!institutionId && !!submitted,
    classId: submitted?.classId,
    studentId: submitted?.studentId,
  });

  const run = () => setSubmitted({ classId: selectedClass, studentId: selectedStudent !== 'all' ? selectedStudent : undefined });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Course Outcome Analytics</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <Label className="text-xs">1. Class</Label>
            <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setSelectedStudent('all'); setSubmitted(null); }}>
              <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="Choose a class" /></SelectTrigger>
              <SelectContent>
                {(classes || []).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.class_name}{c.section ? ` - ${c.section}` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full sm:w-auto">
            <Label className="text-xs">2. Student</Label>
            <Select value={selectedStudent} onValueChange={v => { setSelectedStudent(v); setSubmitted(null); }} disabled={!selectedClass}>
              <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All students</SelectItem>
                {filteredStudents.map(s => (
                  <SelectItem key={s.id} value={s.user_id || s.id}>{s.student_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={run} disabled={!selectedClass || isFetching} className="w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />{isFetching ? 'Analysing…' : 'Get outcome'}
          </Button>
        </div>

        {!submitted ? (
          <div className="py-16 text-center space-y-3">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Choose a class to begin</h2>
            <p className="text-sm text-muted-foreground">Pick a class, then a student or all students, and press Get outcome.</p>
          </div>
        ) : isFetching && !data ? (
          <OutcomeAnalysing />
        ) : (
          <CourseOutcomeAnalytics data={data} isLoading={false} isError={isError} onRetry={() => { void refetch(); }} />
        )}
      </div>
    </Layout>
  );
};
