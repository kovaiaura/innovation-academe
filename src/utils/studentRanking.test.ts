import { describe, it, expect } from 'vitest';
import { computeOverallScore, rankStudents } from './studentRanking';

const s = (name: string, a: number, as: number, p: number, xp: number) => ({
  student_name: name, assessment_avg: a, assignment_avg: as, projects_count: p, total_xp: xp,
});

describe('studentRanking', () => {
  it('weights assessments 50, assignments 20, projects 20, XP 10', () => {
    expect(computeOverallScore(s('A', 100, 100, 5, 1000), 1000)).toBe(100);
    expect(computeOverallScore(s('A', 80, 0, 0, 0), 1000)).toBe(40);
    expect(computeOverallScore(s('A', 0, 0, 1, 0), 1000)).toBe(4);
  });

  it('scores XP relative to the top earner, not a fixed cap', () => {
    expect(computeOverallScore(s('A', 0, 0, 0, 15974), 15974)).toBe(10);
    expect(computeOverallScore(s('B', 0, 0, 0, 3700), 15974)).toBeLessThan(3);
  });

  it('breaks equal overall scores by XP', () => {
    const list = [s('Nirupa', 0, 0, 0, 3700), s('Aadheth', 0, 0, 0, 3704)].map(x => ({ ...x, overall_score: 30 }));
    const r = rankStudents(list);
    expect(r[0].student_name).toBe('Aadheth');
    expect(r[0].rank).toBe(1);
    expect(r[1].rank).toBe(2);
  });

  it('gives true ties the same rank and skips the next', () => {
    const list = [s('B', 0, 0, 0, 10), s('A', 0, 0, 0, 10), s('C', 0, 0, 0, 5)].map(x => ({ ...x, overall_score: 1 }));
    expect(rankStudents(list).map(x => x.rank)).toEqual([1, 1, 3]);
  });
});
