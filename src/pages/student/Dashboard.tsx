import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { gamificationDbService } from '@/services/gamification-db.service';
import { useStudentStreak } from '@/hooks/useStudentStreak';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { DashboardAchievements } from '@/components/student/DashboardAchievements';
import { DashboardWidgets } from '@/components/student/dashboard/DashboardWidgets';
import { DashboardLearningHub } from '@/components/student/DashboardLearningHub';
import '@/components/student/studentDashboard.css';

interface StudentGamification {
  total_points: number;
  current_rank: number;
  streak_days: number;
  badges_earned: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  badges_locked: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    points_required: number;
    progress: number;
  }>;
  weekly_points: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { selectedYear, selectedRange } = useAcademicYear();
  const [rankInfo, setRankInfo] = useState<{ classSize: number; instituteRank: number; instituteSize: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamification, setGamification] = useState<StudentGamification | null>(null);
  const [coursesEnrolled, setCoursesEnrolled] = useState(0);
  const [courseProgress, setCourseProgress] = useState(0);
  const [dashboardAssignmentIds, setDashboardAssignmentIds] = useState<string[]>([]);
  const [activeProjects, setActiveProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  
  // Use realtime streak hook
  const { streak: realtimeStreak } = useStudentStreak(user?.id, user?.institution_id);

  const gamificationPath = tenantId ? `/tenant/${tenantId}/student/gamification` : '/student/gamification';

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, selectedYear, selectedRange]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    const yearRange = selectedRange;
    const institutionId = user.institution_id;
    const classId = user.class_id;
    const studentId = user.id;
    try {
      setLoading(true);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const studentRecP = supabase.from('students').select('id').eq('user_id', user.id).maybeSingle();
      const assignmentsP = classId
        ? supabase.from('course_class_assignments').select('id', { count: 'exact' }).eq('class_id', classId).gte('assigned_at', yearRange.start).lt('assigned_at', yearRange.end)
        : Promise.resolve({ data: [] as { id: string }[], count: 0 } as any);

      const [totalXP, studentBadges, streak, allBadges, counts, weekly, snapRes, studentRec, assignRes] = await Promise.all([
        gamificationDbService.getStudentTotalXP(studentId),
        gamificationDbService.getStudentBadges(studentId),
        gamificationDbService.getStudentStreak(studentId),
        gamificationDbService.getBadges(),
        gamificationDbService.getStudentActivityCounts(studentId),
        supabase.from('student_xp_transactions').select('points_earned').eq('student_id', studentId).gte('earned_at', weekAgo.toISOString()),
        institutionId
          ? supabase.from('student_rank_snapshots').select('class_rank, class_size, institute_rank, institute_size').eq('institution_id', institutionId).eq('academic_year', selectedYear).eq('student_user_id', user.id).maybeSingle()
          : Promise.resolve({ data: null } as any),
        studentRecP,
        assignmentsP,
      ]);
      gamificationDbService.updateStreak(user.id, institutionId || undefined);

      const studentRecordId = studentRec.data?.id as string | undefined;
      const assignmentIds = ((assignRes.data || []) as { id: string }[]).map(a => a.id);
      setDashboardAssignmentIds(assignmentIds);
      setCoursesEnrolled(assignRes.count || 0);

      const snap = snapRes.data;
      setRankInfo(snap ? { classSize: snap.class_size || 0, instituteRank: snap.institute_rank || 0, instituteSize: snap.institute_size || 0 } : null);

      const earnedBadgeIds = new Set(studentBadges.map(b => b.badge?.id));
      const lockedBadges = allBadges
        .filter(b => b.is_active && !earnedBadgeIds.has(b.id))
        .slice(0, 5)
        .map(b => {
          const criteria = b.unlock_criteria as any;
          const threshold = criteria?.threshold || 1;
          const current = (counts as any)[criteria?.type] || 0;
          return { id: b.id, name: b.name, description: b.description || '', icon: b.icon, points_required: threshold, progress: Math.min(100, Math.round((current / threshold) * 100)) };
        });

      setGamification({
        total_points: totalXP,
        current_rank: snap?.class_rank || 0,
        streak_days: streak?.current_streak || 0,
        badges_earned: studentBadges.map(b => ({ id: b.badge?.id || '', name: b.badge?.name || '', description: b.badge?.description || '', icon: b.badge?.icon || '🏆', earned_at: b.earned_at })),
        badges_locked: lockedBadges,
        weekly_points: (weekly.data || []).reduce((sum: number, t: any) => sum + t.points_earned, 0),
      });
      setLoading(false);

      // Projects + course progress in background (do not block the page)
      if (studentRecordId) {
        supabase.from('project_members').select('project_id, projects!inner(status, created_at)').eq('student_id', studentRecordId)
          .gte('projects.created_at', yearRange.start).lt('projects.created_at', yearRange.end)
          .then(({ data }) => {
            const projects = data || [];
            setActiveProjects(projects.filter(p => ['ongoing', 'yet_to_start'].includes((p.projects as any)?.status)).length);
            setCompletedProjects(projects.filter(p => (p.projects as any)?.status === 'completed').length);
          });
        if (assignmentIds.length) {
          import('@/utils/courseProgressCalculations').then(async ({ buildSessionCompletionContexts, computeStudentSessionProgress }) => {
            const ctxMap = await buildSessionCompletionContexts(assignmentIds);
            const progress = await computeStudentSessionProgress([studentRecordId], Array.from(ctxMap.values()));
            setCourseProgress(progress.get(studentRecordId)?.progressPercentage || 0);
          }).catch(e => console.error('Failed to compute course progress', e));
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const studentPath = tenantId ? `/tenant/${tenantId}/student` : '/student';

  return (
    <Layout showAcademicYear={false}>
      <div className="student-dashboard space-y-6">
        <DashboardLearningHub
          name={user?.name}
          userId={user?.id}
          classId={user?.class_id}
          tenantId={tenantId}
          assignmentIds={dashboardAssignmentIds}
          coursesEnrolled={coursesEnrolled}
          courseProgress={courseProgress}
          activeProjects={activeProjects}
          completedProjects={completedProjects}
          points={gamification?.total_points || 0}
          weeklyPoints={gamification?.weekly_points || 0}
          rank={gamification?.current_rank || 0}
          streak={realtimeStreak?.current_streak || gamification?.streak_days || 0}
          badgesEarned={gamification?.badges_earned.length || 0}
          badgesLocked={gamification?.badges_locked.length || 0}
          nextBadge={gamification?.badges_locked.slice().sort((a, b) => b.progress - a.progress)[0]}
        />
        <DashboardWidgets
          loading={loading}
          studentPath={studentPath}
          classId={user?.class_id}
          nextBadge={gamification?.badges_locked.slice().sort((a, b) => b.progress - a.progress)[0]}
          badgesEarned={gamification?.badges_earned.length || 0}
          activeProjects={activeProjects}
          completedProjects={completedProjects}
          rank={gamification?.current_rank || 0}
          classSize={rankInfo?.classSize || 0}
          instituteRank={rankInfo?.instituteRank || 0}
          instituteSize={rankInfo?.instituteSize || 0}
          weeklyPoints={gamification?.weekly_points || 0}
          points={gamification?.total_points || 0}
          streak={realtimeStreak?.current_streak || gamification?.streak_days || 0}
        />
        <DashboardAchievements
          badges={gamification?.badges_earned || []}
          rank={gamification?.current_rank || 0}
          classSize={rankInfo?.classSize || 0}
          instituteRank={rankInfo?.instituteRank || 0}
          instituteSize={rankInfo?.instituteSize || 0}
          achievementsPath={gamificationPath}
        />
      </div>
    </Layout>
  );
}
