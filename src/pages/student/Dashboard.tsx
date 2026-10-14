import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { gamificationDbService } from '@/services/gamification-db.service';
import { useStudentStreak } from '@/hooks/useStudentStreak';
import { useAcademicYear } from '@/contexts/AcademicYearContext';
import { DashboardAchievements } from '@/components/student/DashboardAchievements';
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
    
    try {
      setLoading(true);
      
      // Get student profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, institution_id, class_id')
        .eq('id', user.id)
        .single();
      
      const studentId = profile?.id || user.id;
      const institutionId = profile?.institution_id;
      
      // Parallel data fetching
      // Use class-scoped leaderboard if student has a class
      const classId = profile?.class_id;
      
      const [
        totalXP,
        studentBadges,
        streak,
        allBadges,
        leaderboardData,
        projectData,
        courseData
      ] = await Promise.all([
        gamificationDbService.getStudentTotalXP(studentId),
        gamificationDbService.getStudentBadges(studentId),
        gamificationDbService.getStudentStreak(studentId),
        gamificationDbService.getBadges(),
        institutionId
          ? (classId
            ? gamificationDbService.getClassLeaderboard(institutionId, classId, 20)
            : gamificationDbService.getInstitutionLeaderboard(institutionId, 20))
          : Promise.resolve([]),
        loadProjectData(user.id),
        loadCourseData(studentId)
      ]);
      
      // Update streak separately (side effect, not data we need)
      gamificationDbService.updateStreak(user.id, institutionId || undefined);
      
      // Calculate weekly points (last 7 days)
      const weeklyPoints = await getWeeklyPoints(studentId);
      
      // Calculate rank
      const myRank = leaderboardData.findIndex(s => s.student_id === studentId) + 1 || leaderboardData.length + 1;
      
      // Get earned badge IDs
      const earnedBadgeIds = new Set(studentBadges.map(b => b.badge?.id));
      
      // Calculate locked badges with progress based on actual counts
      const counts = await gamificationDbService.getStudentActivityCounts(studentId);
      
      const lockedBadges = allBadges
        .filter(b => b.is_active && !earnedBadgeIds.has(b.id))
        .slice(0, 5)
        .map(b => {
          const criteria = b.unlock_criteria as any;
          const threshold = criteria?.threshold || 1;
          let current = 0;
          
          switch (criteria?.type) {
            case 'projects':
              current = counts.projects;
              break;
            case 'achievements':
              current = counts.achievements;
              break;
            case 'assessments':
              current = counts.assessments;
              break;
            case 'assignments':
              current = counts.assignments;
              break;
          }
          
          const progress = Math.min(100, Math.round((current / threshold) * 100));
          
          return {
            id: b.id,
            name: b.name,
            description: b.description || '',
            icon: b.icon,
            points_required: threshold,
            progress
          };
        });
      
      setGamification({
        total_points: totalXP,
        current_rank: myRank,
        streak_days: realtimeStreak?.current_streak || streak?.current_streak || 0,
        badges_earned: studentBadges.map(b => ({
          id: b.badge?.id || '',
          name: b.badge?.name || '',
          description: b.badge?.description || '',
          icon: b.badge?.icon || '🏆',
          earned_at: b.earned_at
        })),
        badges_locked: lockedBadges,
        weekly_points: weeklyPoints
      });
      
      setActiveProjects(projectData.active);
      setCompletedProjects(projectData.completed);
      setCoursesEnrolled(courseData);
      
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getWeeklyPoints = async (studentId: string): Promise<number> => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data } = await supabase
      .from('student_xp_transactions')
      .select('points_earned')
      .eq('student_id', studentId)
      .gte('earned_at', weekAgo.toISOString());
    
    return data?.reduce((sum, t) => sum + t.points_earned, 0) || 0;
  };

  const loadProjectData = async (authUserId: string) => {
    const yearRange = selectedRange;
    // First get the student record ID from the students table
    const { data: studentRecord } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', authUserId)
      .single();
    
    const studentRecordId = studentRecord?.id;
    if (!studentRecordId) {
      return { active: 0, completed: 0 };
    }
    
    const { data } = await supabase
      .from('project_members')
      .select('project_id, projects!inner(status, created_at)')
      .eq('student_id', studentRecordId)
      .gte('projects.created_at', yearRange.start)
      .lt('projects.created_at', yearRange.end);
    
    const projects = data || [];
    return {
      active: projects.filter(p => (p.projects as any)?.status === 'ongoing' || (p.projects as any)?.status === 'yet_to_start').length,
      completed: projects.filter(p => (p.projects as any)?.status === 'completed').length
    };
  };

  const loadCourseData = async (studentId: string) => {
    const yearRange = selectedRange;
    const { data: profile } = await supabase
      .from('profiles')
      .select('class_id')
      .eq('id', studentId)
      .single();
    
    if (!profile?.class_id) {
      setDashboardAssignmentIds([]);
      return 0;
    }
    
    const { data: assignments, count } = await supabase
      .from('course_class_assignments')
      .select('id', { count: 'exact' })
      .eq('class_id', profile.class_id)
      .gte('assigned_at', yearRange.start)
      .lt('assigned_at', yearRange.end);

    setDashboardAssignmentIds((assignments || []).map(assignment => assignment.id));

    // Compute session-based progress for this student
    try {
      const { data: studentRec } = await supabase
        .from('students').select('id').eq('user_id', studentId).maybeSingle();
      const assignmentIds = (assignments || []).map(a => a.id);
      if (studentRec?.id && assignmentIds.length) {
        const { buildSessionCompletionContexts, computeStudentSessionProgress } =
          await import('@/utils/courseProgressCalculations');
        const ctxMap = await buildSessionCompletionContexts(assignmentIds);
        const progress = await computeStudentSessionProgress(
          [studentRec.id],
          Array.from(ctxMap.values())
        );
        const p = progress.get(studentRec.id);
        setCourseProgress(p?.progressPercentage || 0);
      }
    } catch (e) {
      console.error('Failed to compute course progress', e);
    }

    return count || 0;
  };

  if (loading) {
    return (
      <Layout showAcademicYear={false}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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
        <DashboardAchievements
          badges={gamification?.badges_earned || []}
          rank={gamification?.current_rank || 0}
          achievementsPath={gamificationPath}
        />
      </div>
    </Layout>
  );
}
