import { BadgeConfig, XPRule, RewardConfig, LeaderboardConfig, StudentPerformance, GamificationStats, ActivityLog } from '@/types/gamification';

export const mockBadgeConfigs: BadgeConfig[] = [
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Complete your first session',
    icon: '🎯',
    category: 'achievement',
    unlock_criteria: {
      type: 'attendance',
      threshold: 1,
      description: 'Attend 1 session'
    },
    xp_reward: 50,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'System Admin'
  },
  {
    id: 'badge-2',
    name: 'Perfect Attendance',
    description: 'Maintain 100% attendance for a month',
    icon: '⭐',
    category: 'excellence',
    unlock_criteria: {
      type: 'attendance',
      threshold: 30,
      description: 'Attend 30 consecutive sessions'
    },
    xp_reward: 500,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'System Admin'
  },
  {
    id: 'badge-3',
    name: 'Assessment Master',
    description: 'Score above 90% in 5 assessments',
    icon: '🏆',
    category: 'excellence',
    unlock_criteria: {
      type: 'assessments',
      threshold: 5,
      description: 'Score 90%+ in 5 assessments'
    },
    xp_reward: 300,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'System Admin'
  },
  {
    id: 'badge-4',
    name: 'Project Pioneer',
    description: 'Submit your first project',
    icon: '🚀',
    category: 'achievement',
    unlock_criteria: {
      type: 'projects',
      threshold: 1,
      description: 'Submit 1 project'
    },
    xp_reward: 100,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'System Admin'
  },
  {
    id: 'badge-5',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day login streak',
    icon: '🔥',
    category: 'participation',
    unlock_criteria: {
      type: 'streak',
      threshold: 7,
      description: 'Login for 7 consecutive days'
    },
    xp_reward: 200,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'System Admin'
  },
  {
    id: 'badge-6',
    name: 'Century Club',
    description: 'Earn 100 total points',
    icon: '💯',
    category: 'milestone',
    unlock_criteria: {
      type: 'points',
      threshold: 100,
      description: 'Earn 100 points'
    },
    xp_reward: 150,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'System Admin'
  }
];

export const mockXPRules: XPRule[] = [
  {
    id: 'xp-1',
    activity: 'session_attendance',
    points: 10,
    description: 'Attend a session',
    is_active: true
  },
  {
    id: 'xp-2',
    activity: 'assessment_completion',
    points: 50,
    description: 'Complete an assessment',
    is_active: true
  },
  {
    id: 'xp-3',
    activity: 'project_submission',
    points: 100,
    description: 'Submit a project',
    is_active: true
  },
  {
    id: 'xp-4',
    activity: 'assignment_submission',
    points: 30,
    description: 'Submit an assignment',
    is_active: true
  },
  {
    id: 'xp-5',
    activity: 'daily_login',
    points: 5,
    description: 'Login to the platform',
    is_active: true
  },
  {
    id: 'xp-6',
    activity: 'perfect_score',
    points: 100,
    multiplier: 1.5,
    description: 'Score 100% in an assessment',
    is_active: true
  },
  {
    id: 'xp-7',
    activity: 'early_submission',
    points: 20,
    multiplier: 1.2,
    description: 'Submit assignment before deadline',
    is_active: true
  }
];

export const mockRewardConfigs: RewardConfig[] = [
  {
    id: 'reward-1',
    name: 'Completion Certificate',
    description: 'Official course completion certificate',
    type: 'certificate',
    points_required: 500,
    quantity_claimed: 12,
    is_active: true
  },
  {
    id: 'reward-2',
    name: 'Excellence Badge',
    description: 'Digital badge for outstanding performance',
    type: 'badge',
    points_required: 1000,
    quantity_claimed: 5,
    is_active: true
  },
  {
    id: 'reward-3',
    name: 'Tech Toolkit',
    description: 'Physical toolkit with electronics components',
    type: 'physical_reward',
    points_required: 2000,
    quantity_available: 20,
    quantity_claimed: 3,
    is_active: true
  },
  {
    id: 'reward-4',
    name: 'Hall of Fame Recognition',
    description: 'Featured on institution website',
    type: 'recognition',
    points_required: 1500,
    quantity_claimed: 8,
    is_active: true
  },
  {
    id: 'reward-5',
    name: 'Project Showcase Pass',
    description: 'Free entry to annual project showcase event',
    type: 'physical_reward',
    points_required: 800,
    quantity_available: 50,
    quantity_claimed: 15,
    is_active: true
  }
];

export const mockLeaderboardConfigs: LeaderboardConfig[] = [
  {
    id: 'lb-1',
    institution_id: 'inst-1',
    institution_name: 'Springfield Tech Academy',
    scope: 'institution',
    time_period: 'monthly',
    top_n_display: 10,
    is_public: true,
    reset_schedule: 'monthly'
  },
  {
    id: 'lb-2',
    institution_id: 'inst-2',
    institution_name: 'Riverside Innovation School',
    scope: 'institution',
    time_period: 'all_time',
    top_n_display: 20,
    is_public: true,
    reset_schedule: 'none'
  },
  {
    id: 'lb-3',
    institution_id: 'inst-3',
    institution_name: 'Metro College of Engineering',
    scope: 'institution',
    time_period: 'weekly',
    top_n_display: 15,
    is_public: true,
    reset_schedule: 'weekly'
  }
];

export const mockStudentPerformances: StudentPerformance[] = [
  {
    student_id: 'stu-1',
    student_name: 'Aarav Kumar',
    institution_id: 'inst-1',
    institution_name: 'Springfield Tech Academy',
    class_id: 'class-1',
    class_name: 'Grade 10-A',
    total_points: 2450,
    rank: 1,
    badges_earned: 8,
    streak_days: 15,
    last_activity: '2024-01-20T14:30:00Z',
    points_breakdown: {
      sessions: 500,
      projects: 800,
      attendance: 450,
      assessments: 500,
      assignments: 200
    }
  },
  {
    student_id: 'stu-2',
    student_name: 'Priya Sharma',
    institution_id: 'inst-1',
    institution_name: 'Springfield Tech Academy',
    class_id: 'class-1',
    class_name: 'Grade 10-A',
    total_points: 2100,
    rank: 2,
    badges_earned: 6,
    streak_days: 12,
    last_activity: '2024-01-20T16:45:00Z',
    points_breakdown: {
      sessions: 450,
      projects: 600,
      attendance: 400,
      assessments: 450,
      assignments: 200
    }
  },
  {
    student_id: 'stu-3',
    student_name: 'Rahul Verma',
    institution_id: 'inst-2',
    institution_name: 'Riverside Innovation School',
    class_id: 'class-2',
    class_name: 'Grade 11-B',
    total_points: 1850,
    rank: 1,
    badges_earned: 5,
    streak_days: 8,
    last_activity: '2024-01-19T10:20:00Z',
    points_breakdown: {
      sessions: 400,
      projects: 500,
      attendance: 350,
      assessments: 400,
      assignments: 200
    }
  },
  {
    student_id: 'stu-4',
    student_name: 'Sneha Patel',
    institution_id: 'inst-2',
    institution_name: 'Riverside Innovation School',
    class_id: 'class-2',
    class_name: 'Grade 11-B',
    total_points: 1650,
    rank: 2,
    badges_earned: 4,
    streak_days: 10,
    last_activity: '2024-01-20T09:15:00Z',
    points_breakdown: {
      sessions: 350,
      projects: 400,
      attendance: 300,
      assessments: 400,
      assignments: 200
    }
  },
  {
    student_id: 'stu-5',
    student_name: 'Arjun Singh',
    institution_id: 'inst-3',
    institution_name: 'Metro College of Engineering',
    class_id: 'class-3',
    class_name: 'Grade 12-C',
    total_points: 1500,
    rank: 1,
    badges_earned: 4,
    streak_days: 5,
    last_activity: '2024-01-20T11:30:00Z',
    points_breakdown: {
      sessions: 300,
      projects: 400,
      attendance: 250,
      assessments: 350,
      assignments: 200
    }
  }
];

export const mockGamificationStats: GamificationStats = {
  total_students: 156,
  total_points_distributed: 245800,
  active_badges: 6,
  total_rewards_claimed: 43,
  top_institutions: [
    {
      id: 'inst-1',
      name: 'Springfield Tech Academy',
      avg_points: 1875,
      total_students: 65
    },
    {
      id: 'inst-2',
      name: 'Riverside Innovation School',
      avg_points: 1650,
      total_students: 52
    },
    {
      id: 'inst-3',
      name: 'Metro College of Engineering',
      avg_points: 1425,
      total_students: 39
    }
  ]
};

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-01-20T16:45:00Z',
    student_name: 'Priya Sharma',
    institution_name: 'Springfield Tech Academy',
    activity_type: 'Project Submission',
    points_earned: 100,
    description: 'Submitted IoT Home Automation project'
  },
  {
    id: 'log-2',
    timestamp: '2024-01-20T14:30:00Z',
    student_name: 'Aarav Kumar',
    institution_name: 'Springfield Tech Academy',
    activity_type: 'Badge Unlocked',
    points_earned: 200,
    description: 'Earned "Weekly Warrior" badge'
  },
  {
    id: 'log-3',
    timestamp: '2024-01-20T11:30:00Z',
    student_name: 'Arjun Singh',
    institution_name: 'Metro College of Engineering',
    activity_type: 'Assessment Completion',
    points_earned: 50,
    description: 'Completed Python Programming Assessment'
  },
  {
    id: 'log-4',
    timestamp: '2024-01-20T09:15:00Z',
    student_name: 'Sneha Patel',
    institution_name: 'Riverside Innovation School',
    activity_type: 'Session Attendance',
    points_earned: 10,
    description: 'Attended Robotics Fundamentals session'
  },
  {
    id: 'log-5',
    timestamp: '2024-01-19T10:20:00Z',
    student_name: 'Rahul Verma',
    institution_name: 'Riverside Innovation School',
    activity_type: 'Perfect Score',
    points_earned: 150,
    description: 'Scored 100% in Electronics Assessment'
  }
];
