import { ClassCourseProgress, ClassTeachingSession, ClassTeachingReport } from '@/types/classTeaching';

// Teaching sessions for different classes
export const mockTeachingSessions: ClassTeachingSession[] = [
  {
    id: 'session-teach-1',
    officer_id: 'off-001',
    class_id: 'class-1-9a',
    course_id: 'course-1',
    session_date: '2024-03-01T10:00:00Z',
    duration_minutes: 90,
    module_id: 'mod-1',
    module_title: 'Introduction to AI',
    content_covered: ['content-1', 'content-2'],
    attendance_marked: true,
    notes: 'Covered AI basics and terminology. Students engaged well.',
    created_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 'session-teach-2',
    officer_id: 'off-001',
    class_id: 'class-1-9a',
    course_id: 'course-1',
    session_date: '2024-03-05T10:00:00Z',
    duration_minutes: 75,
    module_id: 'mod-1',
    module_title: 'Introduction to AI',
    content_covered: ['content-3'],
    attendance_marked: true,
    notes: 'Discussed history of AI. Good class participation.',
    created_at: '2024-03-05T10:00:00Z'
  },
  {
    id: 'session-teach-3',
    officer_id: 'off-001',
    class_id: 'class-1-9a',
    course_id: 'course-1',
    session_date: '2024-03-08T10:00:00Z',
    duration_minutes: 60,
    module_id: 'mod-2',
    module_title: 'Machine Learning Basics',
    content_covered: ['content-4'],
    attendance_marked: true,
    notes: 'Started ML module. Need to review concepts next session.',
    created_at: '2024-03-08T10:00:00Z'
  },
  {
    id: 'session-teach-4',
    officer_id: 'off-001',
    class_id: 'class-1-9b',
    course_id: 'course-1',
    session_date: '2024-03-02T14:00:00Z',
    duration_minutes: 90,
    module_id: 'mod-1',
    module_title: 'Introduction to AI',
    content_covered: ['content-1'],
    attendance_marked: true,
    notes: 'First session with 9B. Covered introduction.',
    created_at: '2024-03-02T14:00:00Z'
  },
  {
    id: 'session-teach-5',
    officer_id: 'off-001',
    class_id: 'class-1-10a',
    course_id: 'course-2',
    session_date: '2024-03-03T11:00:00Z',
    duration_minutes: 120,
    module_id: 'mod-4',
    module_title: 'React Fundamentals',
    content_covered: ['content-5', 'content-6'],
    attendance_marked: true,
    notes: 'Covered React basics. Students working on practice exercises.',
    created_at: '2024-03-03T11:00:00Z'
  }
];

// Progress tracking per class-course combination
export const mockClassCourseProgress: ClassCourseProgress[] = [
  {
    class_id: 'class-1-9a',
    class_name: 'Grade 9 Section A',
    course_id: 'course-1',
    course_title: 'Introduction to Artificial Intelligence',
    course_code: 'AI101',
    officer_id: 'off-001',
    last_session_date: '2024-03-08T10:00:00Z',
    last_module_id: 'mod-2',
    last_module_title: 'Machine Learning Basics',
    completed_modules: ['mod-1'],
    total_modules: 3,
    total_sessions: 3,
    total_hours: 3.75,
    current_module_id: 'mod-2',
    current_content_index: 0,
    status: 'in_progress',
    completion_percentage: 40,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-08T10:00:00Z'
  },
  {
    class_id: 'class-1-9b',
    class_name: 'Grade 9 Section B',
    course_id: 'course-1',
    course_title: 'Introduction to Artificial Intelligence',
    course_code: 'AI101',
    officer_id: 'off-001',
    last_session_date: '2024-03-02T14:00:00Z',
    last_module_id: 'mod-1',
    last_module_title: 'Introduction to AI',
    completed_modules: [],
    total_modules: 3,
    total_sessions: 1,
    total_hours: 1.5,
    current_module_id: 'mod-1',
    current_content_index: 1,
    status: 'in_progress',
    completion_percentage: 15,
    created_at: '2024-03-02T14:00:00Z',
    updated_at: '2024-03-02T14:00:00Z'
  },
  {
    class_id: 'class-1-10a',
    class_name: 'Grade 10 Section A',
    course_id: 'course-2',
    course_title: 'Full Stack Web Development',
    course_code: 'WEB201',
    officer_id: 'off-001',
    last_session_date: '2024-03-03T11:00:00Z',
    last_module_id: 'mod-4',
    last_module_title: 'React Fundamentals',
    completed_modules: [],
    total_modules: 3,
    total_sessions: 1,
    total_hours: 2,
    current_module_id: 'mod-4',
    current_content_index: 2,
    status: 'in_progress',
    completion_percentage: 20,
    created_at: '2024-03-03T11:00:00Z',
    updated_at: '2024-03-03T11:00:00Z'
  },
  {
    class_id: 'class-1-11a',
    class_name: 'Grade 11 Section A',
    course_id: 'course-3',
    course_title: 'Internet of Things & Smart Devices',
    course_code: 'IOT301',
    officer_id: 'off-001',
    completed_modules: [],
    total_modules: 3,
    total_sessions: 0,
    total_hours: 0,
    current_content_index: 0,
    status: 'not_started',
    completion_percentage: 0,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  }
];

// Helper functions
export const getProgressByClassAndCourse = (classId: string, courseId: string): ClassCourseProgress | undefined => {
  return mockClassCourseProgress.find(p => p.class_id === classId && p.course_id === courseId);
};

export const getSessionsByClass = (classId: string): ClassTeachingSession[] => {
  return mockTeachingSessions.filter(s => s.class_id === classId);
};

export const getSessionsByCourse = (courseId: string): ClassTeachingSession[] => {
  return mockTeachingSessions.filter(s => s.course_id === courseId);
};

export const generateClassTeachingReport = (classId: string, officerId: string): ClassTeachingReport => {
  const classSessions = mockTeachingSessions.filter(s => s.class_id === classId && s.officer_id === officerId);
  const classProgress = mockClassCourseProgress.filter(p => p.class_id === classId && p.officer_id === officerId);

  const courses = classProgress.map(progress => ({
    course_id: progress.course_id,
    course_title: progress.course_title,
    course_code: progress.course_code,
    sessions_count: progress.total_sessions,
    total_hours: progress.total_hours,
    modules_completed: progress.completed_modules.length,
    modules_total: progress.total_modules,
    last_session_date: progress.last_session_date,
    status: progress.status
  }));

  const totalSessions = classSessions.length;
  const totalTeachingHours = classSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

  const sortedSessions = [...classSessions].sort((a, b) => 
    new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  );

  return {
    class_id: classId,
    class_name: classProgress[0]?.class_name || '',
    officer_id: officerId,
    courses,
    total_sessions: totalSessions,
    total_teaching_hours: Number(totalTeachingHours.toFixed(2)),
    date_range: sortedSessions.length > 0 ? {
      first_session: sortedSessions[0].session_date,
      last_session: sortedSessions[sortedSessions.length - 1].session_date
    } : undefined
  };
};
