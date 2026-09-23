import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAcademicYear, getPreviousAcademicYear, normalizeAcademicYear } from '@/utils/academicYear';

interface AcademicYearContextValue {
  institutionId: string | undefined;
  currentYear: string;
  previousYear: string;
  selectedYear: string;
  availableYears: string[];
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

  const currentYear = normalizeAcademicYear(
    (institution?.settings as { academic_year?: string } | null)?.academic_year || getDefaultAcademicYear(),
  );
  const previousYear = getPreviousAcademicYear(currentYear);
  const availableYears = useMemo(() => [currentYear, previousYear], [currentYear, previousYear]);

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

  return (
    <AcademicYearContext.Provider
      value={{
        institutionId,
        currentYear,
        previousYear,
        selectedYear: selectedYear || currentYear,
        availableYears,
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