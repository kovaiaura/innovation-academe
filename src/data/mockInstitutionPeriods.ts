import { PeriodConfig } from '@/types/institution';

export const mockInstitutionPeriods: Record<string, PeriodConfig[]> = {
  '1': [
    {
      id: 'period-1',
      institution_id: '1',
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
      institution_id: '1',
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
      institution_id: '1',
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
      institution_id: '1',
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
      institution_id: '1',
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
      institution_id: '1',
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
      institution_id: '1',
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
      institution_id: '1',
      label: 'Period 6',
      start_time: '12:45',
      end_time: '13:30',
      is_break: false,
      display_order: 8,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  '2': [
    {
      id: 'period-1',
      institution_id: '2',
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
      institution_id: '2',
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
      institution_id: '2',
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
      institution_id: '2',
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
      institution_id: '2',
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
      institution_id: '2',
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
      institution_id: '2',
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

export const getInstitutionPeriods = (institutionId: string): PeriodConfig[] => {
  return mockInstitutionPeriods[institutionId] || [];
};
