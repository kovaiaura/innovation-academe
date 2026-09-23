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

export function getAcademicYearDateRange(academicYear: string): { start: string; end: string } {
  const normalized = normalizeAcademicYear(academicYear);
  const startYear = Number(normalized.slice(0, 4));
  return {
    start: `${startYear}-04-01T00:00:00.000Z`,
    end: `${startYear + 1}-04-01T00:00:00.000Z`,
  };
}