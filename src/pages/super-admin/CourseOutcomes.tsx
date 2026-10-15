import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CourseOutcomeAnalytics } from '@/components/course-outcomes/CourseOutcomeAnalytics';
import { useCourseOutcomeAnalytics } from '@/hooks/useCourseOutcomeAnalytics';
import { readOutcomeRows } from '@/services/course-outcomes.service';
import { getDefaultAcademicYear, getDefaultAcademicYearPeriods, type AcademicYearPeriodsConfig } from '@/utils/academicYear';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const AdminCourseOutcomes = () => {
  const [institutions, setInstitutions] = useState<{ id: string; name: string; settings: unknown }[]>([]);
  const [classes, setClasses] = useState<{ id: string; class_name: string; section: string | null }[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [yearMode, setYearMode] = useState<'current' | 'previous'>('current');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    let active = true;
    readOutcomeRows('institutions').then(data => { if (active) setInstitutions(data.sort((a, b) => a.name.localeCompare(b.name))); }).catch(() => { if (active) setInstitutions([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (selectedInstitution === 'all') { setClasses([]); return; }
    let active = true;
    setClasses([]);
    readOutcomeRows('classes', q => q.eq('institution_id', selectedInstitution)).then(data => { if (active) setClasses(data.sort((a, b) => a.class_name.localeCompare(b.class_name))); }).catch(() => { if (active) setClasses([]); });
    return () => { active = false; };
  }, [selectedInstitution]);

  const settings = institutions.find(i => i.id === selectedInstitution)?.settings as { academic_year?: string; academic_year_periods?: AcademicYearPeriodsConfig } | undefined;
  const defaults = getDefaultAcademicYearPeriods(settings?.academic_year || getDefaultAcademicYear());
  const periodLabel = (mode: 'current' | 'previous') => {
    if (selectedInstitution === 'all') return mode === 'current' ? 'Current year · Each institute' : 'Previous year · Each institute';
    const period = settings?.academic_year_periods?.[mode] || defaults[mode];
    return `${period.academic_year} (${mode === 'current' ? 'Current' : 'Previous'})`;
  };

  const { data, isLoading, isError, refetch } = useCourseOutcomeAnalytics({
    yearMode,
    institutionId: selectedInstitution !== 'all' ? selectedInstitution : undefined,
    classId: selectedClass !== 'all' ? selectedClass : undefined,
  });

  return (
    <Layout showAcademicYear={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Course Outcome Analytics</h1>
          <p className="text-muted-foreground">Cross-institution course performance overview</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-1 w-full sm:w-auto">
            <Label className="text-xs">Academic period</Label>
            <Select value={yearMode} onValueChange={v => setYearMode(v === 'previous' ? 'previous' : 'current')}><SelectTrigger className="w-full sm:w-[270px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="current">{periodLabel('current')}</SelectItem><SelectItem value="previous">{periodLabel('previous')}</SelectItem></SelectContent></Select>
          </div>
          <div className="space-y-1 w-full sm:w-auto">
            <Label className="text-xs">Institution</Label>
            <Select value={selectedInstitution} onValueChange={(v) => { setSelectedInstitution(v); setSelectedClass('all'); }}>
              <SelectTrigger className="w-full sm:w-[250px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedInstitution !== 'all' && (
            <div className="space-y-1 w-full sm:w-auto">
              <Label className="text-xs">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
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

        <CourseOutcomeAnalytics data={data} isLoading={isLoading} isError={isError} onRetry={() => { void refetch(); }} />
      </div>
    </Layout>
  );
};

export default AdminCourseOutcomes;
