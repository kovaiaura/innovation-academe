import { describe, expect, it } from 'vitest';
import { getOfficerAssignableClassIds } from './officerAssignmentAccess';

describe('getOfficerAssignableClassIds', () => {
  it('includes timetable classes and only active delegations valid today', () => {
    const classIds = getOfficerAssignableClassIds(
      ['timetable-class', 'timetable-class'],
      [
        {
          class_id: 'valid-delegated-class',
          is_active: true,
          valid_from: '2026-11-01',
          valid_until: '2026-11-26',
        },
        {
          class_id: 'expired-class',
          is_active: true,
          valid_from: '2026-10-01',
          valid_until: '2026-11-25',
        },
        {
          class_id: 'inactive-class',
          is_active: false,
          valid_from: '2026-11-01',
          valid_until: null,
        },
        {
          class_id: 'future-class',
          is_active: true,
          valid_from: '2026-11-27',
          valid_until: null,
        },
      ],
      '2026-11-26',
    );

    expect(classIds).toEqual(['timetable-class', 'valid-delegated-class']);
  });
});