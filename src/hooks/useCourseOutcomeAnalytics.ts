import { useQuery } from '@tanstack/react-query';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { fetchCourseOutcomes, type OutcomeFilters } from '@/services/course-outcomes.service';
export type { CourseOutcomeData } from '@/services/course-outcomes.service';

export function useCourseOutcomeAnalytics(filters: OutcomeFilters) {
  const { selectedRange, isLoading } = useAcademicYear();
  return useQuery({
    queryKey: ['course-outcome-analytics', filters, selectedRange.start, selectedRange.end],
    queryFn: () => fetchCourseOutcomes(filters, selectedRange),
    enabled: filters.enabled !== false && !isLoading,
    staleTime: 0,
  });
}
