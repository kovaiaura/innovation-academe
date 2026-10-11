import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  AcademicYearDateRange,
  AcademicYearPeriodsConfig,
  getAcademicYearDateRange,
  getDefaultAcademicYear,
  getDefaultAcademicYearPeriods,
  getPreviousAcademicYear,
  normalizeAcademicYear,
} from '@/utils/academicYear';

interface AcademicYearContextValue {
  institutionId: string | undefined;
  currentYear: string;
  previousYear: string;
  selectedYear: string;
  availableYears: string[];
  periods: Required<AcademicYearPeriodsConfig>;
  selectedRange: AcademicYearDateRange;
  isLoading: boolean;
  isHistorical: boolean;
  setSelectedYear: (year: string) => void;
}

const AcademicYearContext = createContext<AcademicYearContextValue | undefined>(undefined);

export function AcademicYearProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const institutionId = user?.institution_id || user?.tenant_id;
  const [selectedYear, setSelectedYearState] = useState('');

  const { data: institution, isLoading } = useQuery({
    queryKey: ['institution-academic-year', institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data, error } = await supabase
        .from('institutions')
        .select('settings')
        .eq('id', institutionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!institutionId,
    staleTime: 60 * 1000,
  });

  const settings = institution?.settings as {
    academic_year?: string;
    academic_year_periods?: AcademicYearPeriodsConfig;
  } | null;
  const currentYear = normalizeAcademicYear(settings?.academic_year || getDefaultAcademicYear());
  const previousYear = getPreviousAcademicYear(currentYear);
  const availableYears = useMemo(() => [currentYear, previousYear], [currentYear, previousYear]);
  const periods = useMemo(() => {
    const defaults = getDefaultAcademicYearPeriods(currentYear);
    const configured = settings?.academic_year_periods;
    return {
      current: configured?.current?.academic_year === currentYear
        ? configured.current
        : defaults.current,
      previous: configured?.previous?.academic_year === previousYear
        ? configured.previous
        : defaults.previous,
    };
  }, [currentYear, previousYear, settings?.academic_year_periods]);

  useEffect(() => {
    if (!institutionId) {
      setSelectedYearState('');
      return;
    }

    const storageKey = `selected-academic-year:${institutionId}`;
    const storedYear = window.localStorage.getItem(storageKey);
    setSelectedYearState(storedYear && availableYears.includes(storedYear) ? storedYear : currentYear);
  }, [institutionId, currentYear, availableYears]);

  const setSelectedYear = (year: string) => {
    if (!availableYears.includes(year)) return;
    setSelectedYearState(year);
    if (institutionId) {
      window.localStorage.setItem(`selected-academic-year:${institutionId}`, year);
    }
  };

  const selectedRange = useMemo(
    () => getAcademicYearDateRange(selectedYear || currentYear, periods),
    [selectedYear, currentYear, periods],
  );

  return (
    <AcademicYearContext.Provider
      value={{
        institutionId,
        currentYear,
        previousYear,
        selectedYear: selectedYear || currentYear,
        availableYears,
        periods,
        selectedRange,
        isLoading,
        isHistorical: (selectedYear || currentYear) !== currentYear,
        setSelectedYear,
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) throw new Error('useAcademicYear must be used within AcademicYearProvider');
  return context;
}