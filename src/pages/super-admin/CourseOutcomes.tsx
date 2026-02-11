import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CourseOutcomeAnalytics } from '@/components/course-outcomes/CourseOutcomeAnalytics';
import { useCourseOutcomeAnalytics } from '@/hooks/useCourseOutcomeAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const AdminCourseOutcomes = () => {
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; class_name: string; section: string | null }[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    supabase.from('institutions').select('id, name').order('name').then(({ data }) => setInstitutions(data || []));
  }, []);

  useEffect(() => {
    if (selectedInstitution === 'all') { setClasses([]); return; }
    supabase.from('classes').select('id, class_name, section').eq('institution_id', selectedInstitution).order('class_name')
      .then(({ data }) => setClasses(data || []));
  }, [selectedInstitution]);

  const { data, isLoading } = useCourseOutcomeAnalytics({
    institutionId: selectedInstitution !== 'all' ? selectedInstitution : undefined,
    classId: selectedClass !== 'all' ? selectedClass : undefined,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Course Outcome Analytics</h1>
          <p className="text-muted-foreground">Cross-institution course performance overview</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Institution</Label>
            <Select value={selectedInstitution} onValueChange={(v) => { setSelectedInstitution(v); setSelectedClass('all'); }}>
              <SelectTrigger className="w-[250px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedInstitution !== 'all' && (
            <div className="space-y-1">
              <Label className="text-xs">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.class_name}{c.section ? ` - ${c.section}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <CourseOutcomeAnalytics data={data || { courseAccuracies: [], moduleAccuracies: [], sessionAccuracies: [], strengths: [], weaknesses: [] }} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default AdminCourseOutcomes;
