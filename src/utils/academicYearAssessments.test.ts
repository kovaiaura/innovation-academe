import { describe, it, expect } from 'vitest';
import { academicYearLabelVariants } from './academicYear';
import { isAssessmentInRange, classBaseName } from '@/hooks/useClassAssessmentMapping';

const range = { start: '2025-06-01T00:00:00.000Z', end: '2026-04-01T00:00:00.000Z' };

describe('previous-year assessments', () => {
  it('matches both year label formats', () => {
    expect(academicYearLabelVariants('2025-26')).toEqual(['2025-26', '2025-2026']);
  });
  it('picks assessments inside the selected year', () => {
    expect(isAssessmentInRange({ start_time: '2025-09-10T05:00:00Z' }, range)).toBe(true);
  });
  it('excludes assessments outside the selected year', () => {
    expect(isAssessmentInRange({ start_time: '2026-06-10T05:00:00Z' }, range)).toBe(false);
  });
  it('links the same class across years', () => {
    expect(classBaseName('Grade 1A - 2026-27')).toBe(classBaseName('Grade 1A - 2025-26'));
  });
});
