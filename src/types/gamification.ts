export interface BadgeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'participation' | 'excellence' | 'milestone';
  unlock_criteria: {
    type: 'points' | 'attendance' | 'projects' | 'assessments' | 'streak' | 'custom';
    threshold: number;
    description: string;
  };
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface XPRule {
  id: string;
  activity: 'session_attendance' | 'assessment_completion' | 'project_submission' | 
            'assignment_submission' | 'daily_login' | 'perfect_score' | 'early_submission';
  points: number;
  multiplier?: number;
  description: string;
  is_active: boolean;
}

export interface RewardConfig {
  id: string;
  name: string;
  description: string;
  type: 'certificate' | 'badge' | 'physical_reward' | 'recognition';
  points_required: number;
  quantity_available?: number;
  quantity_claimed: number;
  is_active: boolean;
  image?: string;
}

export interface LeaderboardConfig {
  id: string;
  institution_id: string;
  institution_name: string;
  scope: 'institution' | 'class' | 'course';
  time_period: 'all_time' | 'monthly' | 'weekly';
  top_n_display: number;
  is_public: boolean;
  reset_schedule?: 'none' | 'weekly' | 'monthly';
}

export interface StudentPerformance {
  student_id: string;
  student_name: string;
  institution_id: string;
  institution_name: string;
  class_id: string;
  class_name: string;
  total_points: number;
  rank: number;
  badges_earned: number;
  streak_days: number;
  last_activity: string;
  points_breakdown: {
    sessions: number;
    projects: number;
    attendance: number;
    assessments: number;
    assignments: number;
  };
}

export interface GamificationStats {
  total_students: number;
  total_points_distributed: number;
  active_badges: number;
  total_rewards_claimed: number;
  top_institutions: Array<{
    id: string;
    name: string;
    avg_points: number;
    total_students: number;
  }>;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  student_name: string;
  institution_name: string;
  activity_type: string;
  points_earned: number;
  description: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  category: 'course' | 'assignment' | 'assessment' | 'event';
  template_image_url: string;
  name_position: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
  };
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface StudentCertificate {
  id: string;
  student_id: string;
  student_name: string;
  template_id: string;
  activity_type: 'course' | 'assignment' | 'assessment' | 'event';
  activity_id: string;
  activity_name: string;
  institution_name: string;
  issued_date: string;
  completion_date: string;
  certificate_url: string;
  verification_code: string;
  qr_code_url: string;
  grade?: string;
}
