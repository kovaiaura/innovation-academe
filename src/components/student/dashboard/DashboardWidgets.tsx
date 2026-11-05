import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Award, CalendarClock, ClipboardList, FileText, Flame, Rocket, Sparkles, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface WidgetsProps {
  loading: boolean;
  studentPath: string;
  classId?: string;
  nextBadge?: { name: string; description: string; progress: number };
  badgesEarned: number;
  activeProjects: number;
  completedProjects: number;
  rank: number;
  classSize: number;
  instituteRank: number;
  instituteSize: number;
  weeklyPoints: number;
  points: number;
  streak: number;
}

type UpcomingItem = { id: string; title: string; due: string; kind: 'assessment' | 'assignment' };

function useUpcoming(classId?: string) {
  return useQuery({
    queryKey: ['student-dashboard-upcoming', classId],
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<UpcomingItem[]> => {
      const now = new Date().toISOString();
      const [a, s] = await Promise.all([
        supabase.from('assessment_class_assignments').select('assessment_id, assessments!inner(id, title, end_time, status)').eq('class_id', classId!).gte('assessments.end_time', now).limit(10),
        supabase.from('assignment_class_assignments').select('assignment_id, assignments!inner(id, title, submission_end_date, status)').eq('class_id', classId!).gte('assignments.submission_end_date', now).limit(10),
      ]);
      const items: UpcomingItem[] = [];
      (a.data || []).forEach((r: any) => r.assessments?.status !== 'draft' && items.push({ id: r.assessments.id, title: r.assessments.title, due: r.assessments.end_time, kind: 'assessment' }));
      (s.data || []).forEach((r: any) => r.assignments?.status !== 'draft' && items.push({ id: r.assignments.id, title: r.assignments.title, due: r.assignments.submission_end_date, kind: 'assignment' }));
      return items.sort((x, y) => x.due.localeCompare(y.due)).slice(0, 3);
    },
  });
}

const fmtDue = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export function DashboardWidgets(p: WidgetsProps) {
  const upcoming = useUpcoming(p.classId);
  const sk = <div className="space-y-3"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-10 w-full" /><Skeleton className="h-4 w-2/3" /></div>;

  return (
    <div className="learning-widgets">
      <section className="learning-widget learning-tone-gold" aria-label="Next achievement">
        <div className="learning-widget-head"><span className="learning-kicker">NEXT ACHIEVEMENT</span><Sparkles className="h-4 w-4" /></div>
        {p.loading ? sk : (<>
          <div className="learning-widget-row"><div className="learning-widget-icon"><Award className="h-6 w-6" /></div>
            <div className="min-w-0"><h3>{p.nextBadge?.name || (p.badgesEarned > 0 ? 'Look at you shine!' : 'Your first badge awaits')}</h3>
              <p>{p.nextBadge?.description || 'Every discovery is a step forward.'}</p></div></div>
          {p.nextBadge && <div className="mt-auto"><div className="learning-course-progress-label"><span>Badge progress</span><strong>{p.nextBadge.progress}%</strong></div><Progress value={p.nextBadge.progress} className="learning-progress h-2" /></div>}
        </>)}
        <Link className="learning-widget-link" to={`${p.studentPath}/gamification`}>Explore achievements <ArrowRight className="h-3.5 w-3.5" /></Link>
      </section>

      <section className="learning-widget learning-tone-teal" aria-label="My projects">
        <div className="learning-widget-head"><span className="learning-kicker">MY PROJECTS</span><Rocket className="h-4 w-4" /></div>
        {p.loading ? sk : (
          <div className="learning-widget-split">
            <div><strong>{p.activeProjects}</strong><span>Active</span></div>
            <div><strong>{p.completedProjects}</strong><span>Completed</span></div>
          </div>
        )}
        <p className="learning-widget-note">{p.activeProjects > 0 ? 'Keep building — your team is counting on you.' : 'Join a project to start innovating.'}</p>
        <Link className="learning-widget-link" to={`${p.studentPath}/projects`}>View projects <ArrowRight className="h-3.5 w-3.5" /></Link>
      </section>

      <section className="learning-widget learning-tone-berry" aria-label="My rank">
        <div className="learning-widget-head"><span className="learning-kicker">MY RANK</span><Trophy className="h-4 w-4" /></div>
        {p.loading ? sk : p.rank > 0 ? (
          <div className="learning-widget-split">
            <div><strong>#{p.rank}</strong><span>{p.classSize > 0 ? `of ${p.classSize} in class` : 'In class'}</span></div>
            <div><strong>{p.instituteRank > 0 ? `#${p.instituteRank}` : '—'}</strong><span>{p.instituteSize > 0 ? `of ${p.instituteSize} in institute` : 'In institute'}</span></div>
          </div>
        ) : <p className="learning-widget-note">Your rank appears once your teachers review class performance.</p>}
        <Link className="learning-widget-link" to={`${p.studentPath}/gamification`}>See leaderboard <ArrowRight className="h-3.5 w-3.5" /></Link>
      </section>

      <section className="learning-widget learning-tone-coral learning-widget-wide" aria-label="This week">
        <div className="learning-widget-head"><span className="learning-kicker">THIS WEEK</span><Zap className="h-4 w-4" /></div>
        {p.loading ? sk : (
          <div className="learning-widget-split learning-widget-split-3">
            <div><strong>+{p.weeklyPoints}</strong><span>XP this week</span></div>
            <div><strong><Flame className="inline h-5 w-5 -mt-1" /> {p.streak}</strong><span>{p.streak === 1 ? 'day streak' : 'days streak'}</span></div>
            <div><strong>{p.points.toLocaleString()}</strong><span>Total XP</span></div>
          </div>
        )}
        <p className="learning-widget-note">{p.weeklyPoints > 0 ? 'Great momentum — keep it going!' : 'Complete a session or task to earn XP this week.'}</p>
      </section>

      <section className="learning-widget learning-tone-teal learning-widget-wide" aria-label="Coming up">
        <div className="learning-widget-head"><span className="learning-kicker">COMING UP</span><CalendarClock className="h-4 w-4" /></div>
        {upcoming.isLoading && p.classId ? sk : (upcoming.data?.length ? (
          <ul className="learning-upcoming">
            {upcoming.data.map(item => (
              <li key={`${item.kind}-${item.id}`}>
                <Link to={`${p.studentPath}/${item.kind === 'assessment' ? 'assessments' : 'assignments'}`}>
                  <span className="learning-widget-icon learning-widget-icon-sm">{item.kind === 'assessment' ? <ClipboardList className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <span className="learning-upcoming-due">Due {fmtDue(item.due)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="learning-widget-note">Nothing due right now. Enjoy exploring your courses!</p>)}
        <div className="flex gap-2 mt-auto">
          <Button variant="ghost" size="sm" asChild><Link to={`${p.studentPath}/assessments`}>Assessments</Link></Button>
          <Button variant="ghost" size="sm" asChild><Link to={`${p.studentPath}/assignments`}>Assignments</Link></Button>
        </div>
      </section>
    </div>
  );
}
