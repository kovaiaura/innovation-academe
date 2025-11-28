import { PeriodConfig } from '@/types/institution';

const INSTITUTION_PERIODS_KEY = 'institution_periods';

// Initial mock data with correct IDs
const initialMockInstitutionPeriods: Record<string, PeriodConfig[]> = {
  'inst-msd-001': [
    {
      id: 'period-1',
      institution_id: 'inst-msd-001',
      label: 'Period 1',
      start_time: '08:00',
      end_time: '08:45',
      is_break: false,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-2',
      institution_id: 'inst-msd-001',
      label: 'Period 2',
      start_time: '08:45',
      end_time: '09:30',
      is_break: false,
      display_order: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-3',
      institution_id: 'inst-msd-001',
      label: 'Period 3',
      start_time: '09:30',
      end_time: '10:15',
      is_break: false,
      display_order: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'break-1',
      institution_id: 'inst-msd-001',
      label: 'Morning Break',
      start_time: '10:15',
      end_time: '10:30',
      is_break: true,
      display_order: 4,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-4',
      institution_id: 'inst-msd-001',
      label: 'Period 4',
      start_time: '10:30',
      end_time: '11:15',
      is_break: false,
      display_order: 5,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-5',
      institution_id: 'inst-msd-001',
      label: 'Period 5',
      start_time: '11:15',
      end_time: '12:00',
      is_break: false,
      display_order: 6,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'lunch',
      institution_id: 'inst-msd-001',
      label: 'Lunch Break',
      start_time: '12:00',
      end_time: '12:45',
      is_break: true,
      display_order: 7,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-6',
      institution_id: 'inst-msd-001',
      label: 'Period 6',
      start_time: '12:45',
      end_time: '13:30',
      is_break: false,
      display_order: 8,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'inst-kga-001': [
    {
      id: 'period-1',
      institution_id: 'inst-kga-001',
      label: 'Period 1',
      start_time: '08:30',
      end_time: '09:15',
      is_break: false,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-2',
      institution_id: 'inst-kga-001',
      label: 'Period 2',
      start_time: '09:15',
      end_time: '10:00',
      is_break: false,
      display_order: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'break-1',
      institution_id: 'inst-kga-001',
      label: 'Break',
      start_time: '10:00',
      end_time: '10:15',
      is_break: true,
      display_order: 3,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-3',
      institution_id: 'inst-kga-001',
      label: 'Period 3',
      start_time: '10:15',
      end_time: '11:00',
      is_break: false,
      display_order: 4,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-4',
      institution_id: 'inst-kga-001',
      label: 'Period 4',
      start_time: '11:00',
      end_time: '11:45',
      is_break: false,
      display_order: 5,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'lunch',
      institution_id: 'inst-kga-001',
      label: 'Lunch',
      start_time: '11:45',
      end_time: '12:30',
      is_break: true,
      display_order: 6,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'period-5',
      institution_id: 'inst-kga-001',
      label: 'Period 5',
      start_time: '12:30',
      end_time: '13:15',
      is_break: false,
      display_order: 7,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
};

// localStorage functions
export function loadInstitutionPeriods(): Record<string, PeriodConfig[]> {
  try {
    const stored = localStorage.getItem(INSTITUTION_PERIODS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading institution periods:', error);
  }
  // Initialize with mock data if not in localStorage
  saveInstitutionPeriods(initialMockInstitutionPeriods);
  return initialMockInstitutionPeriods;
}

export function saveInstitutionPeriods(periods: Record<string, PeriodConfig[]>): void {
  try {
    localStorage.setItem(INSTITUTION_PERIODS_KEY, JSON.stringify(periods));
  } catch (error) {
    console.error('Error saving institution periods:', error);
  }
}

export function getInstitutionPeriods(institutionId: string): PeriodConfig[] {
  const periods = loadInstitutionPeriods();
  return periods[institutionId] || [];
}

export function saveInstitutionPeriodsForInstitution(institutionId: string, periodConfigs: PeriodConfig[]): void {
  const periods = loadInstitutionPeriods();
  periods[institutionId] = periodConfigs;
  saveInstitutionPeriods(periods);
}

export function addPeriod(institutionId: string, period: PeriodConfig): void {
  const periods = loadInstitutionPeriods();
  if (!periods[institutionId]) {
    periods[institutionId] = [];
  }
  periods[institutionId].push(period);
  saveInstitutionPeriods(periods);
}

export function updatePeriod(institutionId: string, periodId: string, updates: Partial<PeriodConfig>): void {
  const periods = loadInstitutionPeriods();
  if (periods[institutionId]) {
    periods[institutionId] = periods[institutionId].map(p =>
      p.id === periodId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    saveInstitutionPeriods(periods);
  }
}

export function deletePeriod(institutionId: string, periodId: string): void {
  const periods = loadInstitutionPeriods();
  if (periods[institutionId]) {
    periods[institutionId] = periods[institutionId].filter(p => p.id !== periodId);
    saveInstitutionPeriods(periods);
  }
}

// Legacy export for backward compatibility
export const mockInstitutionPeriods = initialMockInstitutionPeriods;
