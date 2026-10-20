import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getDefaultAcademicYear } from '@/utils/academicYear';

export interface ClassAssessmentMapping {
  id: string;
  class_id: string;
  institution_id: string;
  academic_year: string;
  fa1_assessment_id: string | null;
  fa2_assessment_id: string | null;
  final_assessment_id: string | null;
  internal_assessment_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MappingWithDetails extends ClassAssessmentMapping {
  fa1_assessment?: { id: string; title: string } | null;
  fa2_assessment?: { id: string; title: string } | null;
  final_assessment?: { id: string; title: string } | null;
  internal_assessment?: { id: string; title: string } | null;
}

export function useClassAssessmentMapping(classId: string | undefined, academicYear: string = getDefaultAcademicYear()) {
  const queryClient = useQueryClient();

  const { data: mapping, isLoading, error } = useQuery({
    queryKey: ['class-assessment-mapping', classId, academicYear],
    queryFn: async (): Promise<MappingWithDetails | null> => {
      if (!classId) return null;

      // First get the mapping
      const { data: mappingData, error: mappingError } = await supabase
        .from('class_assessment_mapping')
        .select('*')
        .eq('class_id', classId)
        .eq('academic_year', academicYear)
        .maybeSingle();

      if (mappingError) {
        console.error('Error fetching mapping:', mappingError);
        return null;
      }

      if (!mappingData) return null;

      // Fetch assessment details separately
      const assessmentIds = [
        mappingData.fa1_assessment_id,
        mappingData.fa2_assessment_id,
        mappingData.final_assessment_id,
        mappingData.internal_assessment_id,
      ].filter(Boolean);

      let assessmentsMap: Record<string, { id: string; title: string }> = {};
      if (assessmentIds.length > 0) {
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id, title')
          .in('id', assessmentIds);
        
        assessmentsMap = Object.fromEntries(
          (assessments || []).map(a => [a.id, { id: a.id, title: a.title }])
        );
      }

      return {
        ...mappingData,
        fa1_assessment: mappingData.fa1_assessment_id ? assessmentsMap[mappingData.fa1_assessment_id] || null : null,
        fa2_assessment: mappingData.fa2_assessment_id ? assessmentsMap[mappingData.fa2_assessment_id] || null : null,
        final_assessment: mappingData.final_assessment_id ? assessmentsMap[mappingData.final_assessment_id] || null : null,
        internal_assessment: mappingData.internal_assessment_id ? assessmentsMap[mappingData.internal_assessment_id] || null : null,
      };
    },
    enabled: !!classId,
  });

  const saveMappingMutation = useMutation({
    mutationFn: async (data: {
      class_id: string;
      institution_id: string;
      academic_year: string;
      fa1_assessment_id: string | null;
      fa2_assessment_id: string | null;
      final_assessment_id: string | null;
      internal_assessment_id?: string | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await supabase
        .from('class_assessment_mapping')
        .upsert({
          ...data,
          created_by: user?.user?.id,
        }, {
          onConflict: 'class_id,academic_year',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-assessment-mapping'] });
      toast.success('Assessment mapping saved successfully');
    },
    onError: (error) => {
      console.error('Error saving mapping:', error);
      toast.error('Failed to save assessment mapping');
    },
  });

  return {
    mapping,
    isLoading,
    error,
    saveMapping: saveMappingMutation.mutate,
    isSaving: saveMappingMutation.isPending,
  };
}

export function useInstitutionMappings(institutionId: string | undefined, academicYear: string = getDefaultAcademicYear()) {
  return useQuery({
    queryKey: ['institution-assessment-mappings', institutionId, academicYear],
    queryFn: async (): Promise<MappingWithDetails[]> => {
      if (!institutionId) return [];

      const { data: mappings, error } = await supabase
        .from('class_assessment_mapping')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('academic_year', academicYear);

      if (error) {
        console.error('Error fetching mappings:', error);
        return [];
      }

      if (!mappings || mappings.length === 0) return [];

      // Collect all assessment IDs
      const assessmentIds = mappings.flatMap(m => [
        m.fa1_assessment_id,
        m.fa2_assessment_id,
        m.final_assessment_id,
        m.internal_assessment_id,
      ]).filter(Boolean) as string[];

      let assessmentsMap: Record<string, { id: string; title: string }> = {};
      if (assessmentIds.length > 0) {
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id, title')
          .in('id', [...new Set(assessmentIds)]);
        
        assessmentsMap = Object.fromEntries(
          (assessments || []).map(a => [a.id, { id: a.id, title: a.title }])
        );
      }

      return mappings.map(m => ({
        ...m,
        fa1_assessment: m.fa1_assessment_id ? assessmentsMap[m.fa1_assessment_id] || null : null,
        fa2_assessment: m.fa2_assessment_id ? assessmentsMap[m.fa2_assessment_id] || null : null,
        final_assessment: m.final_assessment_id ? assessmentsMap[m.final_assessment_id] || null : null,
        internal_assessment: m.internal_assessment_id ? assessmentsMap[m.internal_assessment_id] || null : null,
      }));
    },
    enabled: !!institutionId,
  });
}

export function useClassAssignedAssessments(
  classId: string | undefined,
  range?: { start: string; end: string },
) {
  return useQuery({
    queryKey: ['class-assigned-assessments', classId, range?.start, range?.end],
    queryFn: async () => {
      if (!classId) return [];

      // Find "sibling" classes (same class name across academic years, e.g. "Grade 1A - 2025-26")
      const { data: cls } = await supabase
        .from('classes')
        .select('id, class_name, institution_id')
        .eq('id', classId)
        .maybeSingle();
      const classIds = new Set<string>([classId]);
      if (cls) {
        const base = classBaseName(cls.class_name);
        const { data: siblings } = await supabase
          .from('classes')
          .select('id, class_name')
          .eq('institution_id', cls.institution_id);
        (siblings || []).forEach(s => { if (classBaseName(s.class_name) === base) classIds.add(s.id); });
      }

      const ids = new Set<string>();
      const { data: links, error } = await supabase
        .from('assessment_class_assignments')
        .select('assessment_id')
        .in('class_id', [...classIds]);
      if (error) console.error('Error fetching assigned assessments:', error);
      (links || []).forEach(l => ids.add(l.assessment_id));

      // Assessments taken by students of these classes within the selected year
      if (range) {
        let attemptsQuery = supabase
          .from('assessment_attempts')
          .select('assessment_id')
          .in('class_id', [...classIds])
          .gte('created_at', range.start)
          .lt('created_at', range.end)
          .limit(1000);
        const { data: attempts } = await attemptsQuery;
        (attempts || []).forEach(a => a.assessment_id && ids.add(a.assessment_id));
      }
      if (ids.size === 0) return [];

      const all: any[] = [];
      const list = [...ids];
      for (let i = 0; i < list.length; i += 200) {
        const { data } = await supabase
          .from('assessments')
          .select('id, title, status, duration_minutes, total_points, start_time, created_at')
          .in('id', list.slice(i, i + 200));
        all.push(...(data || []));
      }
      const filtered = range
        ? all.filter(a => isAssessmentInRange(a, range))
        : all;
      return filtered.sort((a, b) => String(b.start_time || b.created_at).localeCompare(String(a.start_time || a.created_at)));
    },
    enabled: !!classId,
  });
}

export function classBaseName(name: string) {
  return (name || '').split(/\s+-\s+\d{4}/)[0].trim().toLowerCase();
}

export function isAssessmentInRange(a: { start_time?: string | null; created_at?: string | null }, range: { start: string; end: string }) {
  const d = a.start_time || a.created_at;
  if (!d) return false;
  const t = new Date(d).getTime();
  return t >= new Date(range.start).getTime() && t < new Date(range.end).getTime();
}
