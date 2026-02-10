import { supabase } from '@/integrations/supabase/client';
import { BadgeConfig, XPRule, GamificationStats, ActivityLog, StudentPerformance, LeaderboardConfig } from '@/types/gamification';
import { format, subDays } from 'date-fns';

export interface DBBadge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  unlock_criteria: Record<string, any>;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface DBXPRule {
  id: string;
  activity: string;
  points: number;
  multiplier: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DBCertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  template_image_url: string | null;
  default_width: number;
  default_height: number;
  name_position: Record<string, any>;
  date_position: Record<string, any>;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

// ============ FIXED XP VALUES ============
const XP_VALUES = {
  project_membership: 100,
  project_award: 200,
  daily_streak: 1,
  assessment_completion: 50,
  assessment_perfect_score: 100, // replaces the 50
  assignment_submission: 50,
  assignment_perfect_score: 100, // replaces the 50
};

// ============ FIXED BADGE DEFINITIONS ============
const BADGE_DEFINITIONS = [
  { name: '1 Project', category: 'project', icon: '🎯', type: 'projects' as const, threshold: 1, description: 'Joined your first project' },
  { name: '5 Projects', category: 'project', icon: '🎯', type: 'projects' as const, threshold: 5, description: 'Joined 5 projects' },
  { name: '10 Projects', category: 'project', icon: '🎯', type: 'projects' as const, threshold: 10, description: 'Joined 10 projects' },
  { name: '15 Projects', category: 'project', icon: '🎯', type: 'projects' as const, threshold: 15, description: 'Joined 15 projects' },
  { name: '20 Projects', category: 'project', icon: '🎯', type: 'projects' as const, threshold: 20, description: 'Joined 20 projects' },
  { name: '1 Achievement', category: 'achievement', icon: '🏆', type: 'achievements' as const, threshold: 1, description: 'First project award' },
  { name: '5 Achievements', category: 'achievement', icon: '🏆', type: 'achievements' as const, threshold: 5, description: '5 project awards' },
  { name: '10 Achievements', category: 'achievement', icon: '🏆', type: 'achievements' as const, threshold: 10, description: '10 project awards' },
  { name: '20 Achievements', category: 'achievement', icon: '🏆', type: 'achievements' as const, threshold: 20, description: '20 project awards' },
  { name: '5 Assessments', category: 'assessment', icon: '📝', type: 'assessments' as const, threshold: 5, description: 'Completed 5 assessments' },
  { name: '10 Assessments', category: 'assessment', icon: '📝', type: 'assessments' as const, threshold: 10, description: 'Completed 10 assessments' },
  { name: '15 Assessments', category: 'assessment', icon: '📝', type: 'assessments' as const, threshold: 15, description: 'Completed 15 assessments' },
  { name: '20 Assessments', category: 'assessment', icon: '📝', type: 'assessments' as const, threshold: 20, description: 'Completed 20 assessments' },
  { name: '5 Assignments', category: 'assignment', icon: '📄', type: 'assignments' as const, threshold: 5, description: 'Completed 5 assignments' },
  { name: '10 Assignments', category: 'assignment', icon: '📄', type: 'assignments' as const, threshold: 10, description: 'Completed 10 assignments' },
  { name: '15 Assignments', category: 'assignment', icon: '📄', type: 'assignments' as const, threshold: 15, description: 'Completed 15 assignments' },
  { name: '20 Assignments', category: 'assignment', icon: '📄', type: 'assignments' as const, threshold: 20, description: 'Completed 20 assignments' },
];

export const gamificationDbService = {
  // ============ BADGES ============
  async getBadges(): Promise<DBBadge[]> {
    const { data, error } = await supabase
      .from('gamification_badges')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as unknown as DBBadge[];
  },

  async createBadge(badge: Partial<DBBadge>): Promise<DBBadge> {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('gamification_badges')
      .insert({
        name: badge.name || '',
        description: badge.description,
        icon: badge.icon || 'Award',
        category: badge.category || 'achievement',
        unlock_criteria: badge.unlock_criteria || {},
        xp_reward: 0, // No XP for badges
        is_active: badge.is_active ?? true,
        created_by: user?.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as DBBadge;
  },

  async updateBadge(id: string, badge: Partial<DBBadge>): Promise<DBBadge> {
    const { data, error } = await supabase
      .from('gamification_badges')
      .update({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        unlock_criteria: badge.unlock_criteria,
        xp_reward: 0, // No XP for badges
        is_active: badge.is_active
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as DBBadge;
  },

  async deleteBadge(id: string): Promise<void> {
    const { error } = await supabase
      .from('gamification_badges')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ============ XP RULES (read-only, fixed values) ============
  async getXPRules(): Promise<DBXPRule[]> {
    const { data, error } = await supabase
      .from('xp_rules')
      .select('*')
      .order('activity');
    
    if (error) throw error;
    return (data || []) as DBXPRule[];
  },

  async updateXPRule(id: string, rule: Partial<DBXPRule>): Promise<DBXPRule> {
    const { data, error } = await supabase
      .from('xp_rules')
      .update(rule)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ STUDENT XP ============
  async getStudentTotalXP(studentId: string): Promise<number> {
    const { data, error } = await supabase
      .from('student_xp_transactions')
      .select('points_earned')
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data?.reduce((sum, t) => sum + t.points_earned, 0) || 0;
  },

  async getStudentXPBreakdown(studentId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('student_xp_transactions')
      .select('activity_type, points_earned')
      .eq('student_id', studentId);
    
    if (error) throw error;
    
    const breakdown: Record<string, number> = {};
    data?.forEach(t => {
      breakdown[t.activity_type] = (breakdown[t.activity_type] || 0) + t.points_earned;
    });
    return breakdown;
  },

  // Get categorized breakdown for display
  getCategorizedBreakdown(xpBreakdown: Record<string, number>): {
    projects: number;
    achievements: number;
    assessments: number;
    assignments: number;
    daily_login: number;
  } {
    return {
      projects: xpBreakdown['project_membership'] || 0,
      achievements: xpBreakdown['project_award'] || 0,
      assessments: (xpBreakdown['assessment_completion'] || 0) + (xpBreakdown['assessment_perfect_score'] || 0),
      assignments: (xpBreakdown['assignment_submission'] || 0) + (xpBreakdown['assignment_perfect_score'] || 0),
      daily_login: xpBreakdown['daily_streak'] || 0,
    };
  },

  async awardXP(params: {
    studentId: string;
    institutionId: string;
    activityType: string;
    activityId?: string;
    points: number;
    description?: string;
  }): Promise<void> {
    // Check for existing transaction to prevent duplicates
    if (params.activityId) {
      const { data: existing } = await supabase
        .from('student_xp_transactions')
        .select('id')
        .eq('student_id', params.studentId)
        .eq('activity_type', params.activityType)
        .eq('activity_id', params.activityId)
        .maybeSingle();

      if (existing) {
        console.log('XP already awarded for this activity:', params.activityType, params.activityId);
        return;
      }
    }

    const { error } = await supabase
      .from('student_xp_transactions')
      .insert({
        student_id: params.studentId,
        institution_id: params.institutionId,
        activity_type: params.activityType,
        activity_id: params.activityId,
        points_earned: params.points,
        description: params.description
      });
    
    if (error) throw error;

    // Check and award badges after XP transaction
    await this.checkAndAwardBadges(params.studentId, params.institutionId);
  },

  // Deterministic badge check based on actual counts from source tables
  async checkAndAwardBadges(studentId: string, institutionId: string): Promise<void> {
    try {
      // Get student's current badges
      const studentBadges = await this.getStudentBadges(studentId);
      const earnedBadgeNames = new Set(studentBadges.map(b => b.badge?.name));
      
      // Get all active badges from DB
      const allBadges = await this.getBadges();
      
      // Get actual counts from source tables
      const counts = await this.getStudentActivityCounts(studentId);
      
      for (const badge of allBadges) {
        if (!badge.is_active || earnedBadgeNames.has(badge.name)) continue;
        
        const criteria = badge.unlock_criteria as any;
        if (!criteria?.type || !criteria?.threshold) continue;
        
        let currentCount = 0;
        switch (criteria.type) {
          case 'projects':
            currentCount = counts.projects;
            break;
          case 'achievements':
            currentCount = counts.achievements;
            break;
          case 'assessments':
            currentCount = counts.assessments;
            break;
          case 'assignments':
            currentCount = counts.assignments;
            break;
        }
        
        if (currentCount >= criteria.threshold) {
          await this.awardBadge(studentId, badge.id, institutionId);
          console.log('Badge awarded:', badge.name, 'to student:', studentId);
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  },

  // Get real counts from source tables (not XP transactions)
  async getStudentActivityCounts(studentId: string): Promise<{
    projects: number;
    achievements: number;
    assessments: number;
    assignments: number;
  }> {
    // Get student record ID (students table uses different ID than profiles)
    const { data: studentRecord } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', studentId)
      .maybeSingle();
    
    const studentRecordId = studentRecord?.id;
    
    // Count projects
    let projectCount = 0;
    if (studentRecordId) {
      const { count } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentRecordId);
      projectCount = count || 0;
    }
    
    // Count achievements/awards across all projects the student is in
    let achievementCount = 0;
    if (studentRecordId) {
      const { data: memberProjects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('student_id', studentRecordId);
      
      if (memberProjects && memberProjects.length > 0) {
        const projectIds = memberProjects.map(p => p.project_id);
        const { count } = await supabase
          .from('project_achievements')
          .select('*', { count: 'exact', head: true })
          .in('project_id', projectIds);
        achievementCount = count || 0;
      }
    }
    
    // Count completed assessments
    const { count: assessmentCount } = await supabase
      .from('assessment_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .in('status', ['submitted', 'auto_submitted', 'evaluated', 'completed']);
    
    // Count completed assignments
    const { count: assignmentCount } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .in('status', ['submitted', 'graded']);
    
    return {
      projects: projectCount,
      achievements: achievementCount,
      assessments: assessmentCount || 0,
      assignments: assignmentCount || 0,
    };
  },

  // ============ STUDENT BADGES ============
  async getStudentBadges(studentId: string): Promise<{ badge: DBBadge; earned_at: string }[]> {
    const { data, error } = await supabase
      .from('student_badges')
      .select(`
        earned_at,
        gamification_badges (*)
      `)
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data?.map(d => ({
      badge: d.gamification_badges as unknown as DBBadge,
      earned_at: d.earned_at
    })) || [];
  },

  async awardBadge(studentId: string, badgeId: string, institutionId: string): Promise<void> {
    const { error } = await supabase
      .from('student_badges')
      .insert({
        student_id: studentId,
        badge_id: badgeId,
        institution_id: institutionId
      });
    
    if (error && error.code !== '23505') throw error; // Ignore duplicate key error
  },

  // ============ STUDENT STREAK ============
  async getStudentStreak(studentId: string): Promise<{ current_streak: number; longest_streak: number } | null> {
    const { data, error } = await supabase
      .from('student_streaks')
      .select('current_streak, longest_streak')
      .eq('student_id', studentId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateStreak(studentId: string, institutionId?: string): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data: existing } = await supabase
      .from('student_streaks')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (!existing) {
      await supabase
        .from('student_streaks')
        .insert({
          student_id: studentId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today
        });
      
      // Award 1 XP for first streak day
      if (institutionId) {
        const alreadyAwarded = await this.hasStreakXPToday(studentId, today);
        if (!alreadyAwarded) {
          await this.awardXP({
            studentId,
            institutionId,
            activityType: 'daily_streak',
            points: XP_VALUES.daily_streak,
            description: 'Daily login (Day 1)'
          });
        }
      }
      return;
    }
    
    const lastDate = existing.last_activity_date;
    if (lastDate === today) return;
    
    const yesterday = subDays(new Date(), 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    
    let newStreak = existing.current_streak;
    if (lastDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    
    await supabase
      .from('student_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, existing.longest_streak),
        last_activity_date: today
      })
      .eq('student_id', studentId);
    
    // Award 1 XP for daily login - no milestone bonuses
    if (institutionId) {
      const alreadyAwarded = await this.hasStreakXPToday(studentId, today);
      if (!alreadyAwarded) {
        await this.awardXP({
          studentId,
          institutionId,
          activityType: 'daily_streak',
          points: XP_VALUES.daily_streak,
          description: `Daily login (Day ${newStreak})`
        });
      }
    }
  },

  async hasStreakXPToday(studentId: string, today: string): Promise<boolean> {
    const { data } = await supabase
      .from('student_xp_transactions')
      .select('id')
      .eq('student_id', studentId)
      .eq('activity_type', 'daily_streak')
      .gte('earned_at', `${today}T00:00:00`)
      .lt('earned_at', `${today}T23:59:59.999`)
      .limit(1);
    
    return (data && data.length > 0);
  },

  // ============ ACTIVITY LOGS ============
  async getRecentActivity(limit: number = 10, institutionId?: string): Promise<ActivityLog[]> {
    let query = supabase
      .from('student_xp_transactions')
      .select(`
        id,
        earned_at,
        activity_type,
        points_earned,
        description,
        student_id,
        institution_id,
        profiles!student_id (name),
        institutions (name)
      `)
      .order('earned_at', { ascending: false })
      .limit(limit);
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data?.map(d => ({
      id: d.id,
      timestamp: d.earned_at,
      student_name: (d.profiles as any)?.name || 'Unknown',
      institution_name: (d.institutions as any)?.name || 'Unknown',
      activity_type: d.activity_type,
      points_earned: d.points_earned,
      description: d.description || ''
    })) || [];
  },

  // ============ LEADERBOARD ============
  async getLeaderboard(institutionId?: string, limit: number = 10, classId?: string): Promise<StudentPerformance[]> {
    let query = supabase
      .from('student_xp_transactions')
      .select(`
        student_id,
        points_earned,
        activity_type,
        institution_id,
        profiles!student_id (id, name, class_id, institution_id),
        institutions (name)
      `);
    
    if (institutionId) {
      query = query.eq('institution_id', institutionId);
    }
    
    const { data: transactions, error } = await query;
    if (error) throw error;
    
    const studentMap = new Map<string, {
      student_id: string;
      student_name: string;
      institution_id: string;
      institution_name: string;
      class_id: string | null;
      total_points: number;
      points_breakdown: Record<string, number>;
    }>();
    
    transactions?.forEach(t => {
      const studentId = t.student_id;
      const studentClassId = (t.profiles as any)?.class_id;
      
      if (classId && studentClassId !== classId) return;
      
      const existing = studentMap.get(studentId);
      
      if (existing) {
        existing.total_points += t.points_earned;
        existing.points_breakdown[t.activity_type] = (existing.points_breakdown[t.activity_type] || 0) + t.points_earned;
      } else {
        studentMap.set(studentId, {
          student_id: studentId,
          student_name: (t.profiles as any)?.name || 'Unknown',
          institution_id: t.institution_id || '',
          institution_name: (t.institutions as any)?.name || 'Unknown',
          class_id: studentClassId,
          total_points: t.points_earned,
          points_breakdown: { [t.activity_type]: t.points_earned }
        });
      }
    });
    
    const sorted = Array.from(studentMap.values())
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit);
    
    const studentIds = sorted.map(s => s.student_id);
    if (studentIds.length === 0) return [];
    
    const { data: badgesData } = await supabase
      .from('student_badges')
      .select('student_id')
      .in('student_id', studentIds);
    
    const badgeCounts: Record<string, number> = {};
    badgesData?.forEach(b => {
      badgeCounts[b.student_id] = (badgeCounts[b.student_id] || 0) + 1;
    });
    
    const { data: streaksData } = await supabase
      .from('student_streaks')
      .select('student_id, current_streak')
      .in('student_id', studentIds);
    
    const streakMap: Record<string, number> = {};
    streaksData?.forEach(s => {
      streakMap[s.student_id] = s.current_streak;
    });

    const classIds = [...new Set(sorted.map(s => s.class_id).filter(Boolean))] as string[];
    const classNameMap: Record<string, string> = {};
    if (classIds.length > 0) {
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, class_name')
        .in('id', classIds);
      classesData?.forEach(c => {
        classNameMap[c.id] = c.class_name;
      });
    }
    
    return sorted.map((s, index) => ({
      student_id: s.student_id,
      student_name: s.student_name,
      institution_id: s.institution_id,
      institution_name: s.institution_name,
      class_id: s.class_id || '',
      class_name: s.class_id ? classNameMap[s.class_id] || '' : '',
      total_points: s.total_points,
      rank: index + 1,
      badges_earned: badgeCounts[s.student_id] || 0,
      streak_days: streakMap[s.student_id] || 0,
      last_activity: new Date().toISOString(),
      points_breakdown: this.getCategorizedBreakdown(s.points_breakdown)
    }));
  },

  async getClassLeaderboard(institutionId: string, classId: string, limit: number = 10): Promise<StudentPerformance[]> {
    return this.getLeaderboard(institutionId, limit, classId);
  },

  async getInstitutionLeaderboard(institutionId: string, limit: number = 10): Promise<StudentPerformance[]> {
    return this.getLeaderboard(institutionId, limit);
  },

  // ============ STATS ============
  async getGamificationStats(): Promise<GamificationStats> {
    const { data: studentData } = await supabase
      .from('student_xp_transactions')
      .select('student_id')
      .limit(1000);
    
    const uniqueStudents = new Set(studentData?.map(s => s.student_id));
    
    const { data: pointsData } = await supabase
      .from('student_xp_transactions')
      .select('points_earned');
    
    const totalPoints = pointsData?.reduce((sum, p) => sum + p.points_earned, 0) || 0;
    
    const { count: activeBadges } = await supabase
      .from('gamification_badges')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: certificatesIssued } = await supabase
      .from('student_certificates')
      .select('*', { count: 'exact', head: true });
    
    const { data: instData } = await supabase
      .from('student_xp_transactions')
      .select(`
        institution_id,
        points_earned,
        student_id,
        institutions (name)
      `);
    
    const instMap = new Map<string, { name: string; totalPoints: number; students: Set<string> }>();
    instData?.forEach(d => {
      if (!d.institution_id) return;
      const existing = instMap.get(d.institution_id);
      if (existing) {
        existing.totalPoints += d.points_earned;
        existing.students.add(d.student_id);
      } else {
        instMap.set(d.institution_id, {
          name: (d.institutions as any)?.name || 'Unknown',
          totalPoints: d.points_earned,
          students: new Set([d.student_id])
        });
      }
    });
    
    const topInstitutions = Array.from(instMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        avg_points: data.students.size > 0 ? Math.round(data.totalPoints / data.students.size) : 0,
        total_students: data.students.size
      }))
      .sort((a, b) => b.avg_points - a.avg_points)
      .slice(0, 5);
    
    return {
      total_students: uniqueStudents.size,
      total_points_distributed: totalPoints,
      active_badges: activeBadges || 0,
      total_rewards_claimed: certificatesIssued || 0,
      top_institutions: topInstitutions
    };
  },

  // ============ LEADERBOARD CONFIG ============
  async getLeaderboardConfigs(): Promise<LeaderboardConfig[]> {
    const { data, error } = await supabase
      .from('leaderboard_configs')
      .select(`
        *,
        institutions (name)
      `);
    
    if (error) throw error;
    
    return data?.map(d => ({
      id: d.id,
      institution_id: d.institution_id,
      institution_name: (d.institutions as any)?.name || 'Unknown',
      scope: d.scope as 'institution' | 'class' | 'course',
      time_period: d.time_period as 'all_time' | 'monthly' | 'weekly',
      top_n_display: d.top_n_display,
      is_public: d.is_public,
      reset_schedule: d.reset_schedule as 'none' | 'weekly' | 'monthly' | undefined
    })) || [];
  },

  async updateLeaderboardConfig(institutionId: string, config: Partial<LeaderboardConfig>): Promise<void> {
    const { error } = await supabase
      .from('leaderboard_configs')
      .upsert({
        institution_id: institutionId,
        scope: config.scope,
        time_period: config.time_period,
        top_n_display: config.top_n_display,
        is_public: config.is_public,
        reset_schedule: config.reset_schedule
      });
    
    if (error) throw error;
  },

  // ============ CERTIFICATE TEMPLATES ============
  async getCertificateTemplates(): Promise<DBCertificateTemplate[]> {
    const { data, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as unknown as DBCertificateTemplate[];
  },

  async createCertificateTemplate(template: Partial<DBCertificateTemplate>): Promise<DBCertificateTemplate> {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('certificate_templates')
      .insert({
        name: template.name || '',
        description: template.description,
        category: template.category || 'course',
        template_image_url: template.template_image_url,
        default_width: template.default_width || 1200,
        default_height: template.default_height || 900,
        name_position: template.name_position || { x: 600, y: 450, fontSize: 48, color: '#1e3a8a', fontFamily: 'serif' },
        date_position: template.date_position || { x: 600, y: 520, fontSize: 24, color: '#374151' },
        is_active: template.is_active ?? true,
        created_by: user?.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as DBCertificateTemplate;
  },

  async updateCertificateTemplate(id: string, template: Partial<DBCertificateTemplate>): Promise<DBCertificateTemplate> {
    const { data, error } = await supabase
      .from('certificate_templates')
      .update({
        name: template.name,
        description: template.description,
        category: template.category,
        template_image_url: template.template_image_url,
        default_width: template.default_width,
        default_height: template.default_height,
        name_position: template.name_position,
        date_position: template.date_position,
        is_active: template.is_active
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as DBCertificateTemplate;
  },

  async deleteCertificateTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('certificate_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ============ STUDENT CERTIFICATES ============
  async getStudentCertificates(studentId: string) {
    const { data, error } = await supabase
      .from('student_certificates')
      .select(`
        *,
        certificate_templates (name, category, template_image_url)
      `)
      .eq('student_id', studentId)
      .order('issued_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async issueCertificate(params: {
    studentId: string;
    templateId: string;
    activityType: string;
    activityId?: string;
    activityName: string;
    institutionId: string;
    grade?: string;
  }): Promise<void> {
    const verificationCode = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const { error } = await supabase
      .from('student_certificates')
      .insert({
        student_id: params.studentId,
        template_id: params.templateId,
        activity_type: params.activityType,
        activity_id: params.activityId,
        activity_name: params.activityName,
        institution_id: params.institutionId,
        verification_code: verificationCode,
        grade: params.grade
      });
    
    if (error) throw error;
  },

  // ============ XP AWARDING HELPERS (Fixed values) ============
  async awardAssessmentXP(studentId: string, institutionId: string, assessmentId: string, passed: boolean, percentage: number): Promise<void> {
    if (percentage === 100) {
      // Perfect score: 100 XP (replaces base 50)
      await this.awardXP({ studentId, institutionId, activityType: 'assessment_perfect_score', activityId: assessmentId, points: XP_VALUES.assessment_perfect_score, description: 'Assessment completed with perfect score!' });
    } else {
      // Normal completion: 50 XP
      await this.awardXP({ studentId, institutionId, activityType: 'assessment_completion', activityId: assessmentId, points: XP_VALUES.assessment_completion, description: 'Assessment completed' });
    }
  },

  async awardAssignmentXP(studentId: string, institutionId: string, assignmentId: string, marksObtained: number | null, totalMarks: number | null): Promise<void> {
    const isPerfect = marksObtained !== null && totalMarks !== null && totalMarks > 0 && marksObtained === totalMarks;
    
    if (isPerfect) {
      // Perfect score: 100 XP (replaces base 50)
      await this.awardXP({ studentId, institutionId, activityType: 'assignment_perfect_score', activityId: assignmentId, points: XP_VALUES.assignment_perfect_score, description: 'Assignment completed with perfect score!' });
    } else {
      // Normal submission: 50 XP
      await this.awardXP({ studentId, institutionId, activityType: 'assignment_submission', activityId: assignmentId, points: XP_VALUES.assignment_submission, description: 'Assignment submitted' });
    }
  },

  async awardProjectMembershipXP(studentId: string, institutionId: string, projectId: string): Promise<void> {
    await this.awardXP({ studentId, institutionId, activityType: 'project_membership', activityId: projectId, points: XP_VALUES.project_membership, description: 'Joined project team' });
  },

  async awardProjectAwardXP(studentId: string, institutionId: string, projectId: string, awardName: string): Promise<void> {
    await this.awardXP({ studentId, institutionId, activityType: 'project_award', activityId: `${projectId}_${awardName}`, points: XP_VALUES.project_award, description: `Project award: ${awardName}` });
  },

  // ============ CERTIFICATE AUTO-ISSUANCE ============
  async checkAndIssueLevelCertificate(params: {
    studentId: string;
    institutionId: string;
    moduleId: string;
    moduleName: string;
    courseTitle: string;
    isModuleCompleted: boolean;
  }): Promise<{ issued: boolean; message: string }> {
    const { studentId, institutionId, moduleId, moduleName, courseTitle, isModuleCompleted } = params;
    
    if (!isModuleCompleted) {
      return { issued: false, message: 'Module not yet completed' };
    }

    const { data: existing } = await supabase
      .from('student_certificates')
      .select('id')
      .eq('student_id', studentId)
      .eq('activity_type', 'level')
      .eq('activity_id', moduleId)
      .maybeSingle();

    if (existing) {
      return { issued: false, message: 'Certificate already issued' };
    }

    const { data: template } = await supabase
      .from('certificate_templates')
      .select('id')
      .or('category.eq.module,category.eq.level')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!template) {
      return { issued: false, message: 'No certificate template available' };
    }

    try {
      await this.issueCertificate({
        studentId,
        templateId: template.id,
        activityType: 'level',
        activityId: moduleId,
        activityName: `${moduleName} - ${courseTitle}`,
        institutionId,
      });

      return { issued: true, message: `Certificate issued for ${moduleName}` };
    } catch (error) {
      console.error('Failed to issue level certificate:', error);
      return { issued: false, message: 'Failed to issue certificate' };
    }
  },

  async checkAndIssueCourseCompletionCertificate(params: {
    studentId: string;
    institutionId: string;
    courseId: string;
    courseTitle: string;
    allModulesCompleted: boolean;
  }): Promise<{ issued: boolean; message: string }> {
    const { studentId, institutionId, courseId, courseTitle, allModulesCompleted } = params;
    
    if (!allModulesCompleted) {
      return { issued: false, message: 'Not all modules completed' };
    }

    const { data: existing } = await supabase
      .from('student_certificates')
      .select('id')
      .eq('student_id', studentId)
      .eq('activity_type', 'course')
      .eq('activity_id', courseId)
      .maybeSingle();

    if (existing) {
      return { issued: false, message: 'Course certificate already issued' };
    }

    const { data: template } = await supabase
      .from('certificate_templates')
      .select('id')
      .eq('category', 'course')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!template) {
      return { issued: false, message: 'No course certificate template available' };
    }

    try {
      await this.issueCertificate({
        studentId,
        templateId: template.id,
        activityType: 'course',
        activityId: courseId,
        activityName: courseTitle,
        institutionId,
      });

      return { issued: true, message: `Course certificate issued for ${courseTitle}` };
    } catch (error) {
      console.error('Failed to issue course certificate:', error);
      return { issued: false, message: 'Failed to issue certificate' };
    }
  },

  // ============ STREAK LEADERBOARD ============
  async getStreakLeaderboard(institutionId?: string, limit: number = 10): Promise<{
    student_id: string;
    student_name: string;
    institution_id: string;
    institution_name: string;
    current_streak: number;
    longest_streak: number;
  }[]> {
    let query = supabase
      .from('student_streaks')
      .select(`
        student_id,
        current_streak,
        longest_streak,
        profiles!student_id (id, name, institution_id)
      `)
      .gt('current_streak', 0)
      .order('current_streak', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    const studentInstitutionIds = [...new Set(
      data?.map(d => (d.profiles as any)?.institution_id).filter(Boolean)
    )];
    
    let institutionMap: Record<string, string> = {};
    if (studentInstitutionIds.length > 0) {
      const { data: institutions } = await supabase
        .from('institutions')
        .select('id, name')
        .in('id', studentInstitutionIds);
      
      institutions?.forEach(i => {
        institutionMap[i.id] = i.name;
      });
    }

    let results = data?.map(d => ({
      student_id: d.student_id,
      student_name: (d.profiles as any)?.name || 'Unknown',
      institution_id: (d.profiles as any)?.institution_id || '',
      institution_name: institutionMap[(d.profiles as any)?.institution_id] || 'Unknown',
      current_streak: d.current_streak,
      longest_streak: d.longest_streak
    })) || [];

    if (institutionId) {
      results = results.filter(r => r.institution_id === institutionId);
    }

    return results.slice(0, limit);
  },

  // ============ RECALCULATE ALL XP AND BADGES ============
  async recalculateAllXPAndBadges(onProgress?: (msg: string) => void): Promise<{ studentsProcessed: number; totalXP: number; badgesAwarded: number }> {
    const log = (msg: string) => {
      console.log('[Recalculate]', msg);
      onProgress?.(msg);
    };

    log('Step 1: Clearing existing XP transactions...');
    await supabase.from('student_xp_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    log('Step 2: Clearing existing badges...');
    await supabase.from('student_badges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    log('Step 3: Clearing streaks...');
    await supabase.from('student_streaks').delete().neq('student_id', '00000000-0000-0000-0000-000000000000');

    log('Step 4: Seeding badge definitions...');
    await this.seedBadgeDefinitions();

    log('Step 5: Fetching all students...');
    const { data: allStudents } = await supabase
      .from('students')
      .select('id, user_id, institution_id');
    
    if (!allStudents || allStudents.length === 0) {
      log('No students found.');
      return { studentsProcessed: 0, totalXP: 0, badgesAwarded: 0 };
    }

    let totalXP = 0;
    let totalBadges = 0;

    for (let i = 0; i < allStudents.length; i++) {
      const student = allStudents[i];
      if (!student.user_id || !student.institution_id) continue;
      
      log(`Processing student ${i + 1}/${allStudents.length}: ${student.id}`);
      
      const studentAuthId = student.user_id;
      const institutionId = student.institution_id;
      const studentRecordId = student.id;

      // 1. Projects: 100 XP each
      const { data: projects } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('student_id', studentRecordId);
      
      for (const p of (projects || [])) {
        await this.awardXPDirect(studentAuthId, institutionId, 'project_membership', p.project_id, XP_VALUES.project_membership, 'Joined project team');
        totalXP += XP_VALUES.project_membership;
      }

      // 2. Project awards: 200 XP each for all team members
      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.project_id);
        const { data: achievements } = await supabase
          .from('project_achievements')
          .select('id, project_id, title')
          .in('project_id', projectIds);
        
        for (const ach of (achievements || [])) {
          await this.awardXPDirect(studentAuthId, institutionId, 'project_award', `${ach.project_id}_${ach.title}`, XP_VALUES.project_award, `Project award: ${ach.title}`);
          totalXP += XP_VALUES.project_award;
        }
      }

      // 3. Assessments: 50 or 100 XP
      const { data: attempts } = await supabase
        .from('assessment_attempts')
        .select('id, assessment_id, percentage')
        .eq('student_id', studentAuthId)
        .in('status', ['submitted', 'auto_submitted', 'evaluated', 'completed']);
      
      for (const att of (attempts || [])) {
        if (att.percentage === 100) {
          await this.awardXPDirect(studentAuthId, institutionId, 'assessment_perfect_score', att.assessment_id, XP_VALUES.assessment_perfect_score, 'Assessment completed with perfect score!');
          totalXP += XP_VALUES.assessment_perfect_score;
        } else {
          await this.awardXPDirect(studentAuthId, institutionId, 'assessment_completion', att.assessment_id, XP_VALUES.assessment_completion, 'Assessment completed');
          totalXP += XP_VALUES.assessment_completion;
        }
      }

      // 4. Assignments: 50 or 100 XP
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('id, assignment_id, marks_obtained')
        .eq('student_id', studentAuthId)
        .in('status', ['submitted', 'graded']);
      
      if (submissions && submissions.length > 0) {
        // Get total marks for assignments
        const assignmentIds = [...new Set(submissions.map(s => s.assignment_id))];
        const { data: assignmentDetails } = await supabase
          .from('assignments')
          .select('id, total_marks')
          .in('id', assignmentIds);
        
        const marksMap = new Map((assignmentDetails || []).map(a => [a.id, a.total_marks]));
        
        for (const sub of submissions) {
          const totalMarks = marksMap.get(sub.assignment_id);
          const isPerfect = sub.marks_obtained !== null && totalMarks !== null && totalMarks > 0 && sub.marks_obtained === totalMarks;
          
          if (isPerfect) {
            await this.awardXPDirect(studentAuthId, institutionId, 'assignment_perfect_score', sub.assignment_id, XP_VALUES.assignment_perfect_score, 'Assignment completed with perfect score!');
            totalXP += XP_VALUES.assignment_perfect_score;
          } else {
            await this.awardXPDirect(studentAuthId, institutionId, 'assignment_submission', sub.assignment_id, XP_VALUES.assignment_submission, 'Assignment submitted');
            totalXP += XP_VALUES.assignment_submission;
          }
        }
      }

      // 5. Check and award badges
      await this.checkAndAwardBadges(studentAuthId, institutionId);
      
      // Count badges awarded
      const { count: badgeCount } = await supabase
        .from('student_badges')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentAuthId);
      totalBadges += (badgeCount || 0);
    }

    log(`Done! Processed ${allStudents.length} students, ${totalXP} total XP, ${totalBadges} badges awarded.`);
    return { studentsProcessed: allStudents.length, totalXP, badgesAwarded: totalBadges };
  },

  // Direct XP insert without duplicate check (for recalculation)
  async awardXPDirect(studentId: string, institutionId: string, activityType: string, activityId: string, points: number, description: string): Promise<void> {
    const { error } = await supabase
      .from('student_xp_transactions')
      .insert({
        student_id: studentId,
        institution_id: institutionId,
        activity_type: activityType,
        activity_id: activityId,
        points_earned: points,
        description
      });
    
    if (error) {
      console.error('Error awarding XP:', error);
    }
  },

  // Seed the fixed badge definitions
  async seedBadgeDefinitions(): Promise<void> {
    // Delete all existing badges first
    await supabase.from('gamification_badges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new fixed badges
    for (const def of BADGE_DEFINITIONS) {
      await supabase
        .from('gamification_badges')
        .insert({
          name: def.name,
          description: def.description,
          icon: def.icon,
          category: def.category,
          unlock_criteria: { type: def.type, threshold: def.threshold, description: def.description },
          xp_reward: 0,
          is_active: true,
        });
    }
  },
};
