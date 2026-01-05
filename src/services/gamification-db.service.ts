import { supabase } from '@/integrations/supabase/client';
import { BadgeConfig, XPRule, GamificationStats, ActivityLog, StudentPerformance, LeaderboardConfig } from '@/types/gamification';

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
        xp_reward: badge.xp_reward || 0,
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
        xp_reward: badge.xp_reward,
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

  // ============ XP RULES ============
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

  // Check badge criteria and award badges
  async checkAndAwardBadges(studentId: string, institutionId: string): Promise<void> {
    try {
      // Get all active badges
      const badges = await this.getBadges();
      
      // Get student's current badges
      const studentBadges = await this.getStudentBadges(studentId);
      const earnedBadgeIds = new Set(studentBadges.map(b => b.badge?.id));
      
      // Get student's XP breakdown
      const xpBreakdown = await this.getStudentXPBreakdown(studentId);
      const totalXP = Object.values(xpBreakdown).reduce((sum: number, pts: number) => sum + pts, 0);
      
      // Get activity counts
      const { data: xpTransactions } = await supabase
        .from('student_xp_transactions')
        .select('activity_type, activity_id')
        .eq('student_id', studentId);
      
      const activityCounts: Record<string, number> = {};
      const uniqueActivities: Record<string, Set<string>> = {};
      
      xpTransactions?.forEach(t => {
        activityCounts[t.activity_type] = (activityCounts[t.activity_type] || 0) + 1;
        if (!uniqueActivities[t.activity_type]) {
          uniqueActivities[t.activity_type] = new Set();
        }
        if (t.activity_id) {
          uniqueActivities[t.activity_type].add(t.activity_id);
        }
      });
      
      // Get streak
      const streak = await this.getStudentStreak(studentId);
      
      for (const badge of badges) {
        if (!badge.is_active || earnedBadgeIds.has(badge.id)) continue;
        
        const criteria = badge.unlock_criteria as any;
        if (!criteria?.type) continue;
        
        let shouldAward = false;
        const threshold = criteria.threshold || 1;
        
        switch (criteria.type) {
          case 'points':
            shouldAward = totalXP >= threshold;
            break;
          case 'assessments':
            shouldAward = (activityCounts['assessment_completion'] || 0) >= threshold;
            break;
          case 'assignments':
            shouldAward = (activityCounts['assignment_submission'] || 0) >= threshold;
            break;
          case 'streak':
            shouldAward = (streak?.current_streak || 0) >= threshold;
            break;
          case 'projects':
            shouldAward = (uniqueActivities['project_membership']?.size || 0) >= threshold;
            break;
          case 'attendance':
            shouldAward = (activityCounts['session_attendance'] || 0) >= threshold;
            break;
          case 'custom':
            // Handle specific badge types
            if (criteria.description?.includes('100%')) {
              shouldAward = (activityCounts['assessment_perfect_score'] || 0) >= threshold ||
                           (activityCounts['assignment_perfect_score'] || 0) >= threshold;
            } else if (criteria.description?.includes('award')) {
              shouldAward = (activityCounts['project_award'] || 0) >= threshold;
            }
            break;
        }
        
        if (shouldAward) {
          await this.awardBadge(studentId, badge.id, institutionId);
          console.log('Badge awarded:', badge.name, 'to student:', studentId);
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
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
    const today = new Date().toISOString().split('T')[0];
    
    // Get or create streak record
    const { data: existing } = await supabase
      .from('student_streaks')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    if (!existing) {
      // Create new streak record
      await supabase
        .from('student_streaks')
        .insert({
          student_id: studentId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today
        });
      
      // Award XP for first streak day - check if already awarded today
      if (institutionId) {
        const alreadyAwarded = await this.hasStreakXPToday(studentId, today);
        if (!alreadyAwarded) {
          await this.awardXP({
            studentId,
            institutionId,
            activityType: 'daily_streak',
            points: 2,
            description: 'Daily streak bonus (Day 1)'
          });
        }
      }
      return;
    }
    
    const lastDate = existing.last_activity_date;
    if (lastDate === today) return; // Already logged in today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
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
    
    // Award XP for streak - check if already awarded today to prevent duplicates
    if (institutionId) {
      const alreadyAwarded = await this.hasStreakXPToday(studentId, today);
      if (!alreadyAwarded) {
        await this.awardXP({
          studentId,
          institutionId,
          activityType: 'daily_streak',
          points: 2,
          description: `Daily streak bonus (Day ${newStreak})`
        });
      }
    }
  },

  // Helper to check if streak XP was already awarded today
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
    // Get all XP transactions grouped by student
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
    
    // Aggregate by student
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
      
      // Filter by class if classId is provided
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
    
    // Sort and rank
    const sorted = Array.from(studentMap.values())
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit);
    
    // Get badges count for each student
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
    
    // Get streaks
    const { data: streaksData } = await supabase
      .from('student_streaks')
      .select('student_id, current_streak')
      .in('student_id', studentIds);
    
    const streakMap: Record<string, number> = {};
    streaksData?.forEach(s => {
      streakMap[s.student_id] = s.current_streak;
    });

    // Get class names
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
      points_breakdown: {
        sessions: s.points_breakdown['session_attendance'] || 0,
        projects: (s.points_breakdown['project_membership'] || 0) + (s.points_breakdown['project_award'] || 0),
        attendance: s.points_breakdown['session_attendance'] || 0,
        assessments: (s.points_breakdown['assessment_completion'] || 0) + (s.points_breakdown['assessment_pass'] || 0) + (s.points_breakdown['assessment_perfect_score'] || 0),
        levels: s.points_breakdown['level_completion'] || 0
      }
    }));
  },

  // Get class-specific leaderboard
  async getClassLeaderboard(institutionId: string, classId: string, limit: number = 10): Promise<StudentPerformance[]> {
    return this.getLeaderboard(institutionId, limit, classId);
  },

  // Get institution-wide leaderboard  
  async getInstitutionLeaderboard(institutionId: string, limit: number = 10): Promise<StudentPerformance[]> {
    return this.getLeaderboard(institutionId, limit);
  },

  // ============ STATS ============
  async getGamificationStats(): Promise<GamificationStats> {
    // Get total students with XP
    const { data: studentData } = await supabase
      .from('student_xp_transactions')
      .select('student_id')
      .limit(1000);
    
    const uniqueStudents = new Set(studentData?.map(s => s.student_id));
    
    // Get total points distributed
    const { data: pointsData } = await supabase
      .from('student_xp_transactions')
      .select('points_earned');
    
    const totalPoints = pointsData?.reduce((sum, p) => sum + p.points_earned, 0) || 0;
    
    // Get active badges count
    const { count: activeBadges } = await supabase
      .from('gamification_badges')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Get total certificates issued
    const { count: certificatesIssued } = await supabase
      .from('student_certificates')
      .select('*', { count: 'exact', head: true });
    
    // Get top institutions
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
    // Generate verification code
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

  // ============ XP AWARDING HELPERS ============
  async awardAssessmentXP(studentId: string, institutionId: string, assessmentId: string, passed: boolean, percentage: number): Promise<void> {
    // Award 10 XP for completing
    await this.awardXP({ studentId, institutionId, activityType: 'assessment_completion', activityId: assessmentId, points: 10, description: 'Assessment completed' });
    
    // Award 25 XP if passed
    if (passed) {
      await this.awardXP({ studentId, institutionId, activityType: 'assessment_pass', activityId: assessmentId, points: 25, description: 'Assessment passed' });
    }
    
    // Award 25 XP for 100%
    if (percentage === 100) {
      await this.awardXP({ studentId, institutionId, activityType: 'assessment_perfect_score', activityId: assessmentId, points: 25, description: 'Perfect score!' });
    }
  },

  async awardSessionAttendanceXP(studentId: string, institutionId: string, sessionId: string): Promise<void> {
    await this.awardXP({ studentId, institutionId, activityType: 'session_attendance', activityId: sessionId, points: 5, description: 'Session attended' });
  },

  async awardLevelCompletionXP(studentId: string, institutionId: string, levelId: string, levelName: string): Promise<void> {
    await this.awardXP({ studentId, institutionId, activityType: 'level_completion', activityId: levelId, points: 100, description: `Level completed: ${levelName}` });
  },

  async awardProjectMembershipXP(studentId: string, institutionId: string, projectId: string): Promise<void> {
    await this.awardXP({ studentId, institutionId, activityType: 'project_membership', activityId: projectId, points: 100, description: 'Joined project team' });
  },

  async awardProjectAwardXP(studentId: string, institutionId: string, projectId: string, awardName: string): Promise<void> {
    await this.awardXP({ studentId, institutionId, activityType: 'project_award', activityId: projectId, points: 150, description: `Project award: ${awardName}` });
  }
};
