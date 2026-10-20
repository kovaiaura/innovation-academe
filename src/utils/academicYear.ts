export function normalizeAcademicYear(value?: string | null): string {
  const match = value?.trim().match(/^(\d{4})-(\d{2}|\d{4})$/);
  if (!match) return getDefaultAcademicYear();

  const startYear = Number(match[1]);
  const endYear = Number(match[2].length === 2 ? `${String(startYear).slice(0, 2)}${match[2]}` : match[2]);
  return `${startYear}-${String(endYear).slice(-2)}`;
}

export function getDefaultAcademicYear(date = new Date()): string {
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export function getPreviousAcademicYear(academicYear: string): string {
  const normalized = normalizeAcademicYear(academicYear);
  const startYear = Number(normalized.slice(0, 4)) - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export interface AcademicYearPeriodConfig {
  academic_year: string;
  start_date: string;
  end_date: string;
}

export interface AcademicYearPeriodsConfig {
  current?: AcademicYearPeriodConfig;
  previous?: AcademicYearPeriodConfig;
}

export interface AcademicYearDateRange {
  start: string;
  end: string;
}

export function getDefaultAcademicYearPeriods(currentYear: string): Required<AcademicYearPeriodsConfig> {
  const current = normalizeAcademicYear(currentYear);
  const previous = getPreviousAcademicYear(current);
  const makePeriod = (label: string): AcademicYearPeriodConfig => {
    const startYear = Number(normalizeAcademicYear(label).slice(0, 4));
    return {
      academic_year: normalizeAcademicYear(label),
      start_date: `${startYear}-04-01`,
      end_date: `${startYear + 1}-03-31`,
    };
  };
  return { current: makePeriod(current), previous: makePeriod(previous) };
}

export function getAcademicYearDateRange(
  academicYear: string,
  periods?: AcademicYearPeriodsConfig,
): AcademicYearDateRange {
  const normalized = normalizeAcademicYear(academicYear);
  const period = [periods?.current, periods?.previous]
    .find((candidate) => candidate?.academic_year && normalizeAcademicYear(candidate.academic_year) === normalized);
  if (period?.start_date && period.end_date) {
    const exclusiveEnd = new Date(`${period.end_date}T00:00:00.000Z`);
    if (!Number.isNaN(exclusiveEnd.getTime())) {
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      return {
        start: `${period.start_date}T00:00:00.000Z`,
        end: exclusiveEnd.toISOString(),
      };
    }
  }

  const startYear = Number(normalized.slice(0, 4));
  return {
    start: `${startYear}-04-01T00:00:00.000Z`,
    end: `${startYear + 1}-04-01T00:00:00.000Z`,
  };
}
/** Both stored label formats for a year, e.g. ["2025-26", "2025-2026"]. */
export function academicYearLabelVariants(academicYear: string): string[] {
  const short = normalizeAcademicYear(academicYear);
  const start = Number(short.slice(0, 4));
  return [short, `${start}-${start + 1}`];
}
