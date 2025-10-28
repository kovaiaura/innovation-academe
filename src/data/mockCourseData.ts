import { 
  Course, 
  CourseModule, 
  CourseContent, 
  Assignment, 
  Quiz, 
  QuizQuestion,
  CourseAssignment,
  CourseEnrollment,
  AssignmentSubmission,
  QuizAttempt,
  CourseAnalytics
} from '@/types/course';

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    course_code: 'AI101',
    title: 'Introduction to Artificial Intelligence',
    description: 'Learn the fundamentals of AI, machine learning, and neural networks. This course covers basic concepts, algorithms, and practical applications.',
    category: 'ai_ml',
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    difficulty: 'beginner',
    duration_weeks: 8,
    prerequisites: 'Basic programming knowledge',
    learning_outcomes: [
      'Understand core AI concepts and terminology',
      'Implement basic machine learning algorithms',
      'Apply AI techniques to real-world problems',
      'Evaluate AI model performance'
    ],
    status: 'active',
    created_by: 'admin-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'course-2',
    course_code: 'WEB201',
    title: 'Full Stack Web Development',
    description: 'Master modern web development with React, Node.js, and databases. Build complete web applications from frontend to backend.',
    category: 'web_dev',
    thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
    difficulty: 'intermediate',
    duration_weeks: 12,
    prerequisites: 'HTML, CSS, JavaScript basics',
    learning_outcomes: [
      'Build responsive web applications with React',
      'Create RESTful APIs with Node.js',
      'Manage databases with SQL and NoSQL',
      'Deploy applications to production'
    ],
    status: 'active',
    created_by: 'admin-1',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'course-3',
    course_code: 'IOT301',
    title: 'Internet of Things & Smart Devices',
    description: 'Explore IoT fundamentals, sensor networks, and smart device programming. Build connected devices and applications.',
    category: 'iot',
    thumbnail_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f',
    difficulty: 'advanced',
    duration_weeks: 10,
    prerequisites: 'Electronics basics, programming experience',
    learning_outcomes: [
      'Design IoT architectures',
      'Program microcontrollers and sensors',
      'Implement IoT communication protocols',
      'Develop smart home applications'
    ],
    status: 'active',
    created_by: 'admin-1',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  },
  {
    id: 'course-4',
    course_code: 'ROB401',
    title: 'Robotics & Automation',
    description: 'Learn robotics principles, control systems, and automation techniques. Program robots for various tasks.',
    category: 'robotics',
    difficulty: 'advanced',
    duration_weeks: 14,
    prerequisites: 'Programming, basic mechanics',
    learning_outcomes: [
      'Understand robot kinematics and dynamics',
      'Program robot control systems',
      'Implement computer vision for robots',
      'Design automated solutions'
    ],
    status: 'active',
    created_by: 'admin-1',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'course-5',
    course_code: 'DS201',
    title: 'Data Science Fundamentals',
    description: 'Master data analysis, visualization, and statistical modeling. Work with real datasets to extract insights.',
    category: 'data_science',
    difficulty: 'intermediate',
    duration_weeks: 10,
    prerequisites: 'Mathematics, basic programming',
    learning_outcomes: [
      'Perform exploratory data analysis',
      'Create data visualizations',
      'Build predictive models',
      'Communicate data insights effectively'
    ],
    status: 'active',
    created_by: 'admin-1',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z'
  }
];

// Mock Modules
export const mockModules: CourseModule[] = [
  // AI101 Modules
  { id: 'mod-1', course_id: 'course-1', title: 'Introduction to AI', description: 'Overview of AI history and concepts', order: 1, created_at: '2024-01-15T10:00:00Z' },
  { id: 'mod-2', course_id: 'course-1', title: 'Machine Learning Basics', description: 'Supervised and unsupervised learning', order: 2, created_at: '2024-01-15T10:00:00Z' },
  { id: 'mod-3', course_id: 'course-1', title: 'Neural Networks', description: 'Deep learning fundamentals', order: 3, created_at: '2024-01-15T10:00:00Z' },
  
  // WEB201 Modules
  { id: 'mod-4', course_id: 'course-2', title: 'React Fundamentals', description: 'Components, props, and state', order: 1, created_at: '2024-01-10T10:00:00Z' },
  { id: 'mod-5', course_id: 'course-2', title: 'Backend with Node.js', description: 'Building RESTful APIs', order: 2, created_at: '2024-01-10T10:00:00Z' },
  { id: 'mod-6', course_id: 'course-2', title: 'Database Management', description: 'SQL and MongoDB', order: 3, created_at: '2024-01-10T10:00:00Z' },
];

// Mock Content
export const mockContent: CourseContent[] = [
  // AI101 Content
  { id: 'content-1', course_id: 'course-1', module_id: 'mod-1', title: 'Introduction to AI - Lecture Slides', type: 'ppt', file_url: '/files/ai-intro.ppt', order: 1, views_count: 245, file_size_mb: 5.2, created_at: '2024-01-15T10:00:00Z' },
  { id: 'content-2', course_id: 'course-1', module_id: 'mod-1', title: 'History of AI', type: 'youtube', youtube_url: 'https://www.youtube.com/watch?v=ad79nYk2keg', duration_minutes: 15, order: 2, views_count: 198, created_at: '2024-01-15T10:00:00Z' },
  { id: 'content-3', course_id: 'course-1', module_id: 'mod-2', title: 'ML Algorithms Guide', type: 'pdf', file_url: '/files/ml-guide.pdf', order: 1, views_count: 167, file_size_mb: 3.8, created_at: '2024-01-15T10:00:00Z' },
  
  // WEB201 Content
  { id: 'content-4', course_id: 'course-2', module_id: 'mod-4', title: 'React Tutorial', type: 'youtube', youtube_url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', duration_minutes: 45, order: 1, views_count: 312, created_at: '2024-01-10T10:00:00Z' },
  { id: 'content-5', course_id: 'course-2', module_id: 'mod-4', title: 'React Best Practices', type: 'pdf', file_url: '/files/react-best-practices.pdf', order: 2, views_count: 278, file_size_mb: 2.1, created_at: '2024-01-10T10:00:00Z' },
];

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    course_id: 'course-1',
    module_id: 'mod-2',
    title: 'Build a Linear Regression Model',
    description: 'Implement a linear regression algorithm from scratch using Python. Test it on the provided dataset.',
    due_date: '2024-03-15T23:59:00Z',
    total_points: 100,
    submission_type: 'file',
    allow_late_submission: true,
    late_penalty_percent: 10,
    rubric: 'Code quality: 30pts, Accuracy: 40pts, Documentation: 30pts',
    created_at: '2024-02-15T10:00:00Z'
  },
  {
    id: 'assign-2',
    course_id: 'course-2',
    module_id: 'mod-4',
    title: 'Build a React Todo App',
    description: 'Create a fully functional todo application with React. Include add, delete, and mark complete features.',
    due_date: '2024-03-20T23:59:00Z',
    total_points: 100,
    submission_type: 'url',
    allow_late_submission: true,
    late_penalty_percent: 15,
    created_at: '2024-02-20T10:00:00Z'
  }
];

// Mock Quizzes
export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    course_id: 'course-1',
    module_id: 'mod-1',
    title: 'AI Fundamentals Quiz',
    description: 'Test your understanding of basic AI concepts',
    time_limit_minutes: 30,
    attempts_allowed: 2,
    randomize_questions: true,
    show_correct_answers: true,
    pass_percentage: 70,
    available_from: '2024-02-01T00:00:00Z',
    available_to: '2024-03-31T23:59:00Z',
    created_at: '2024-01-15T10:00:00Z'
  }
];

// Mock Quiz Questions
export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q-1',
    quiz_id: 'quiz-1',
    question_text: 'What does AI stand for?',
    question_type: 'mcq',
    options: ['Artificial Intelligence', 'Automated Integration', 'Advanced Interface', 'Algorithmic Implementation'],
    correct_answer: 0,
    points: 10,
    explanation: 'AI stands for Artificial Intelligence, the simulation of human intelligence by machines.',
    order: 1
  },
  {
    id: 'q-2',
    quiz_id: 'quiz-1',
    question_text: 'Machine Learning is a subset of AI.',
    question_type: 'true_false',
    options: ['True', 'False'],
    correct_answer: 0,
    points: 10,
    explanation: 'True. Machine Learning is indeed a subset of Artificial Intelligence.',
    order: 2
  }
];

// Mock Course Assignments
export const mockCourseAssignments: CourseAssignment[] = [
  {
    id: 'ca-1',
    course_id: 'course-1',
    institution_id: 'inst-1',
    institution_name: 'Tech University',
    class_level: 'Year 2',
    officer_ids: ['officer-1'],
    officer_names: ['John Smith'],
    primary_officer_id: 'officer-1',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-05-31T23:59:00Z',
    max_enrollments: 50,
    current_enrollments: 35,
    status: 'ongoing',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'ca-2',
    course_id: 'course-2',
    institution_id: 'inst-1',
    institution_name: 'Tech University',
    class_level: 'Year 3',
    officer_ids: ['officer-2'],
    officer_names: ['Sarah Johnson'],
    primary_officer_id: 'officer-2',
    start_date: '2024-02-15T00:00:00Z',
    end_date: '2024-06-15T23:59:00Z',
    max_enrollments: 40,
    current_enrollments: 28,
    status: 'ongoing',
    created_at: '2024-01-25T10:00:00Z'
  }
];

// Mock Enrollments
export const mockEnrollments: CourseEnrollment[] = [
  {
    id: 'enroll-1',
    course_id: 'course-1',
    course_title: 'Introduction to Artificial Intelligence',
    course_code: 'AI101',
    student_id: 'student-1',
    student_name: 'Alice Williams',
    institution_id: 'inst-1',
    class_level: 'Year 2',
    enrolled_at: '2024-02-02T10:00:00Z',
    progress_percentage: 65,
    status: 'active',
    last_activity_at: '2024-03-10T14:30:00Z',
    certificate_issued: false
  },
  {
    id: 'enroll-2',
    course_id: 'course-1',
    course_title: 'Introduction to Artificial Intelligence',
    course_code: 'AI101',
    student_id: 'student-2',
    student_name: 'Bob Chen',
    institution_id: 'inst-1',
    class_level: 'Year 2',
    enrolled_at: '2024-02-03T10:00:00Z',
    progress_percentage: 45,
    status: 'active',
    last_activity_at: '2024-03-05T09:15:00Z',
    certificate_issued: false
  }
];

// Mock Submissions
export const mockSubmissions: AssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignment_id: 'assign-1',
    assignment_title: 'Build a Linear Regression Model',
    student_id: 'student-1',
    student_name: 'Alice Williams',
    submission_type: 'file',
    file_url: '/submissions/alice-lr-model.zip',
    submitted_at: '2024-03-14T18:30:00Z',
    is_late: false,
    late_penalty_applied: 0,
    total_points: 100,
    grade: 92,
    graded_by: 'officer-1',
    graded_at: '2024-03-16T10:00:00Z',
    feedback: 'Excellent work! Clean code and good documentation. Consider edge cases for better robustness.',
    status: 'graded'
  },
  {
    id: 'sub-2',
    assignment_id: 'assign-1',
    assignment_title: 'Build a Linear Regression Model',
    student_id: 'student-2',
    student_name: 'Bob Chen',
    submission_type: 'file',
    file_url: '/submissions/bob-lr-model.zip',
    submitted_at: '2024-03-15T22:45:00Z',
    is_late: false,
    late_penalty_applied: 0,
    total_points: 100,
    status: 'pending'
  }
];

// Mock Quiz Attempts
export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: 'attempt-1',
    quiz_id: 'quiz-1',
    quiz_title: 'AI Fundamentals Quiz',
    student_id: 'student-1',
    student_name: 'Alice Williams',
    attempt_number: 1,
    started_at: '2024-02-15T10:00:00Z',
    submitted_at: '2024-02-15T10:25:00Z',
    time_taken_minutes: 25,
    score: 18,
    percentage: 90,
    status: 'graded',
    answers: [
      { question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 },
      { question_id: 'q-2', student_answer: 0, is_correct: true, points_earned: 10 }
    ]
  }
];

// Mock Analytics
export const mockCourseAnalytics: CourseAnalytics[] = [
  {
    course_id: 'course-1',
    course_title: 'Introduction to Artificial Intelligence',
    total_enrollments: 35,
    active_students: 32,
    completed_students: 8,
    completion_rate: 22.9,
    average_assignment_score: 85.5,
    average_quiz_score: 87.3,
    assignment_submission_rate: 91.4,
    dropout_rate: 8.6,
    average_progress_percentage: 58.3,
    institution_breakdown: [
      {
        institution_id: 'inst-1',
        institution_name: 'Tech University',
        enrollments: 35,
        completion_rate: 22.9
      }
    ]
  },
  {
    course_id: 'course-2',
    course_title: 'Full Stack Web Development',
    total_enrollments: 28,
    active_students: 26,
    completed_students: 5,
    completion_rate: 17.9,
    average_assignment_score: 82.1,
    average_quiz_score: 84.6,
    assignment_submission_rate: 89.3,
    dropout_rate: 7.1,
    average_progress_percentage: 52.7,
    institution_breakdown: [
      {
        institution_id: 'inst-1',
        institution_name: 'Tech University',
        enrollments: 28,
        completion_rate: 17.9
      }
    ]
  }
];
