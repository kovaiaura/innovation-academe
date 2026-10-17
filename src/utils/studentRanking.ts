/**
 * Shared student ranking — the single source for class and institute ranks
 * across every role. Rank is based on the Overall performance score.
 */

export interface RankInput {
  assessment_avg: number; // 0-100 weighted assessment
  assignment_avg: number; // 0-100
  projects_count: number;
  total_xp: number;
  student_name: string;
}

/** Projects: 20 points each, capped at 100. */
export function projectScore(projectsCount: number): number {
  return Math.min(Math.max(projectsCount, 0) * 20, 100);
}

/** XP relative to the institute's top earner (0-100). */
export function xpScore(totalXp: number, maxXp: number): number {
  if (maxXp <= 0 || totalXp <= 0) return 0;
  return Math.min((totalXp / maxXp) * 100, 100);
}

/** Overall = Assessments 50% + Assignments 20% + Projects 20% + XP 10%. */
export function computeOverallScore(s: RankInput, maxXp: number): number {
  const raw =
    s.assessment_avg * 0.5 +
    s.assignment_avg * 0.2 +
    projectScore(s.projects_count) * 0.2 +
    xpScore(s.total_xp, maxXp) * 0.1;
  return Math.round(raw * 10) / 10;
}

/** Tie-break order: overall, assessment, assignment, XP, then name. */
export function compareStudents<T extends RankInput & { overall_score: number }>(a: T, b: T): number {
  return (
    b.overall_score - a.overall_score ||
    b.assessment_avg - a.assessment_avg ||
    b.assignment_avg - a.assignment_avg ||
    b.total_xp - a.total_xp ||
    a.student_name.localeCompare(b.student_name)
  );
}

function sameScore(a: RankInput & { overall_score: number }, b: RankInput & { overall_score: number }) {
  return (
    a.overall_score === b.overall_score &&
    a.assessment_avg === b.assessment_avg &&
    a.assignment_avg === b.assignment_avg &&
    a.total_xp === b.total_xp
  );
}

/** Sorts and assigns competition ranks (1, 2, 2, 4) — true ties share a rank. */
export function rankStudents<T extends RankInput & { overall_score: number }>(list: T[]): (T & { rank: number })[] {
  const sorted = [...list].sort(compareStudents);
  const out: (T & { rank: number })[] = [];
  sorted.forEach((s, i) => {
    const rank = i > 0 && sameScore(sorted[i - 1], s) ? out[i - 1].rank : i + 1;
    out.push({ ...s, rank });
  });
  return out;
}
