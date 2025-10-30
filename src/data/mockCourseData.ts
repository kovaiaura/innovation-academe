import { 
  Course, 
  CourseModule,
  CourseSession,
  CourseContent, 
  Assignment,
  AssignmentQuestion,
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

// Mock Sessions
export const mockSessions: CourseSession[] = [
  // AI101 - Module 1 Sessions
  { id: 'session-1', course_id: 'course-1', module_id: 'mod-1', title: 'Introduction to AI Concepts', description: 'Understanding basic AI terminology and concepts', order: 1, duration_minutes: 45, learning_objectives: ['Define artificial intelligence', 'Understand AI vs ML vs DL'], created_at: '2024-01-15T10:00:00Z' },
  { id: 'session-2', course_id: 'course-1', module_id: 'mod-1', title: 'History of AI', description: 'Evolution of AI from early days to modern times', order: 2, duration_minutes: 30, learning_objectives: ['Trace AI development timeline', 'Identify key AI milestones'], created_at: '2024-01-15T10:00:00Z' },
  
  // AI101 - Module 2 Sessions
  { id: 'session-3', course_id: 'course-1', module_id: 'mod-2', title: 'Supervised Learning', description: 'Learn about supervised machine learning algorithms', order: 1, duration_minutes: 60, learning_objectives: ['Understand supervised learning', 'Apply classification algorithms'], created_at: '2024-01-15T10:00:00Z' },
  { id: 'session-4', course_id: 'course-1', module_id: 'mod-2', title: 'Unsupervised Learning', description: 'Explore clustering and dimensionality reduction', order: 2, duration_minutes: 50, learning_objectives: ['Master clustering techniques', 'Apply PCA'], created_at: '2024-01-15T10:00:00Z' },
  
  // WEB201 - Module 4 Sessions
  { id: 'session-5', course_id: 'course-2', module_id: 'mod-4', title: 'React Basics', description: 'Introduction to React components and JSX', order: 1, duration_minutes: 90, learning_objectives: ['Create functional components', 'Understand JSX syntax'], created_at: '2024-01-10T10:00:00Z' },
  { id: 'session-6', course_id: 'course-2', module_id: 'mod-4', title: 'State and Props', description: 'Managing component state and passing props', order: 2, duration_minutes: 75, learning_objectives: ['Use useState hook', 'Pass data via props'], created_at: '2024-01-10T10:00:00Z' },
];

// Mock Content
export const mockContent: CourseContent[] = [
  // AI101 - Session 1 Content
  { id: 'content-1', course_id: 'course-1', module_id: 'mod-1', session_id: 'session-1', title: 'Introduction to AI - Lecture Slides', type: 'ppt', file_url: '/files/ai-intro.ppt', order: 1, views_count: 245, file_size_mb: 5.2, created_at: '2024-01-15T10:00:00Z' },
  { id: 'content-2', course_id: 'course-1', module_id: 'mod-1', session_id: 'session-1', title: 'AI Fundamentals Video', type: 'youtube', youtube_url: 'https://www.youtube.com/watch?v=ad79nYk2keg', duration_minutes: 20, order: 2, views_count: 198, created_at: '2024-01-15T10:00:00Z' },
  
  // AI101 - Session 2 Content
  { id: 'content-3', course_id: 'course-1', module_id: 'mod-1', session_id: 'session-2', title: 'History of AI', type: 'youtube', youtube_url: 'https://www.youtube.com/watch?v=ad79nYk2keg', duration_minutes: 15, order: 1, views_count: 198, created_at: '2024-01-15T10:00:00Z' },
  
  // AI101 - Session 3 Content
  { id: 'content-4', course_id: 'course-1', module_id: 'mod-2', session_id: 'session-3', title: 'ML Algorithms Guide', type: 'pdf', file_url: '/files/ml-guide.pdf', order: 1, views_count: 167, file_size_mb: 3.8, created_at: '2024-01-15T10:00:00Z' },
  
  // WEB201 - Session 5 Content
  { id: 'content-5', course_id: 'course-2', module_id: 'mod-4', session_id: 'session-5', title: 'React Tutorial', type: 'youtube', youtube_url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', duration_minutes: 45, order: 1, views_count: 312, created_at: '2024-01-10T10:00:00Z' },
  { id: 'content-6', course_id: 'course-2', module_id: 'mod-4', session_id: 'session-5', title: 'React Best Practices', type: 'pdf', file_url: '/files/react-best-practices.pdf', order: 2, views_count: 278, file_size_mb: 2.1, created_at: '2024-01-10T10:00:00Z' },
];

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    course_id: 'course-1',
    module_id: 'mod-2',
    title: 'Build a Linear Regression Model',
    description: 'Implement a linear regression algorithm from scratch using Python. Test it on the provided dataset.',
    assignment_type: 'traditional',
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
    assignment_type: 'traditional',
    due_date: '2024-03-20T23:59:00Z',
    total_points: 100,
    submission_type: 'url',
    allow_late_submission: true,
    late_penalty_percent: 15,
    created_at: '2024-02-20T10:00:00Z'
  }
];

// Mock Assignment Questions
export const mockAssignmentQuestions: AssignmentQuestion[] = [
  // Will be populated when system admin creates timed assignments
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
    time_limit_seconds: 60,
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
    time_limit_seconds: 45,
    explanation: 'True. Machine Learning is indeed a subset of Artificial Intelligence.',
    order: 2
  }
];

// Mock Course Assignments
export const mockCourseAssignments: CourseAssignment[] = [
  // Springfield Institution - AI Course
  {
    id: 'ca-springfield-1',
    course_id: 'course-1',
    institution_id: 'springfield',
    institution_name: 'Springfield University',
    class_level: 'Class 8A',
    officer_ids: ['off-001'],
    officer_names: ['Dr. Rajesh Kumar'],
    primary_officer_id: 'off-001',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-05-31T23:59:00Z',
    max_enrollments: 50,
    current_enrollments: 15,
    status: 'ongoing',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'ca-springfield-2',
    course_id: 'course-1',
    institution_id: 'springfield',
    institution_name: 'Springfield University',
    class_level: 'Class 8B',
    officer_ids: ['off-001'],
    officer_names: ['Dr. Rajesh Kumar'],
    primary_officer_id: 'off-001',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-05-31T23:59:00Z',
    max_enrollments: 50,
    current_enrollments: 12,
    status: 'ongoing',
    created_at: '2024-01-20T10:00:00Z'
  },
  // Springfield - Web Dev Course
  {
    id: 'ca-springfield-3',
    course_id: 'course-2',
    institution_id: 'springfield',
    institution_name: 'Springfield University',
    class_level: 'Class 9A',
    officer_ids: ['off-002'],
    officer_names: ['Ms. Priya Sharma'],
    primary_officer_id: 'off-002',
    start_date: '2024-02-15T00:00:00Z',
    end_date: '2024-06-15T23:59:00Z',
    max_enrollments: 40,
    current_enrollments: 18,
    status: 'ongoing',
    created_at: '2024-01-25T10:00:00Z'
  },
  // Springfield - IoT Course
  {
    id: 'ca-springfield-4',
    course_id: 'course-3',
    institution_id: 'springfield',
    institution_name: 'Springfield University',
    class_level: 'Class 10A',
    officer_ids: ['off-001'],
    officer_names: ['Dr. Rajesh Kumar'],
    primary_officer_id: 'off-001',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-05-31T23:59:00Z',
    max_enrollments: 30,
    current_enrollments: 10,
    status: 'ongoing',
    created_at: '2024-01-20T10:00:00Z'
  },
  // Springfield - Data Science Course
  {
    id: 'ca-springfield-5',
    course_id: 'course-5',
    institution_id: 'springfield',
    institution_name: 'Springfield University',
    class_level: 'Class 9B',
    officer_ids: ['off-002'],
    officer_names: ['Ms. Priya Sharma'],
    primary_officer_id: 'off-002',
    start_date: '2024-02-10T00:00:00Z',
    end_date: '2024-06-10T23:59:00Z',
    max_enrollments: 35,
    current_enrollments: 14,
    status: 'ongoing',
    created_at: '2024-01-28T10:00:00Z'
  }
];

// Mock Enrollments
export const mockEnrollments: CourseEnrollment[] = [
  // Springfield - AI Course - Class 8A
  { id: 'enroll-sp-1', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-801', student_name: 'Rajesh Kumar', institution_id: 'springfield', class_level: 'Class 8A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 72, status: 'active', last_activity_at: '2024-03-12T14:30:00Z', certificate_issued: false },
  { id: 'enroll-sp-2', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-802', student_name: 'Priya Sharma', institution_id: 'springfield', class_level: 'Class 8A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 85, status: 'active', last_activity_at: '2024-03-13T16:20:00Z', certificate_issued: false },
  { id: 'enroll-sp-3', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-803', student_name: 'Amit Patel', institution_id: 'springfield', class_level: 'Class 8A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 45, status: 'active', last_activity_at: '2024-03-08T09:15:00Z', certificate_issued: false },
  { id: 'enroll-sp-4', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-804', student_name: 'Sneha Reddy', institution_id: 'springfield', class_level: 'Class 8A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 68, status: 'active', last_activity_at: '2024-03-11T11:45:00Z', certificate_issued: false },
  { id: 'enroll-sp-5', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-805', student_name: 'Vikram Singh', institution_id: 'springfield', class_level: 'Class 8A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 92, status: 'active', last_activity_at: '2024-03-14T15:30:00Z', certificate_issued: false },
  { id: 'enroll-sp-6', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-806', student_name: 'Ananya Desai', institution_id: 'springfield', class_level: 'Class 8A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 28, status: 'active', last_activity_at: '2024-02-28T08:20:00Z', certificate_issued: false },
  
  // Springfield - AI Course - Class 8B
  { id: 'enroll-sp-7', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-821', student_name: 'Rohan Mehta', institution_id: 'springfield', class_level: 'Class 8B', enrolled_at: '2024-02-03T10:00:00Z', progress_percentage: 55, status: 'active', last_activity_at: '2024-03-10T13:15:00Z', certificate_issued: false },
  { id: 'enroll-sp-8', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-822', student_name: 'Kavya Iyer', institution_id: 'springfield', class_level: 'Class 8B', enrolled_at: '2024-02-03T10:00:00Z', progress_percentage: 78, status: 'active', last_activity_at: '2024-03-13T10:30:00Z', certificate_issued: false },
  { id: 'enroll-sp-9', course_id: 'course-1', course_title: 'Introduction to Artificial Intelligence', course_code: 'AI101', student_id: 'springfield-823', student_name: 'Arjun Nair', institution_id: 'springfield', class_level: 'Class 8B', enrolled_at: '2024-02-03T10:00:00Z', progress_percentage: 62, status: 'active', last_activity_at: '2024-03-12T14:00:00Z', certificate_issued: false },
  
  // Springfield - Web Dev Course - Class 9A
  { id: 'enroll-sp-10', course_id: 'course-2', course_title: 'Full Stack Web Development', course_code: 'WEB201', student_id: 'springfield-901', student_name: 'Divya Krishnan', institution_id: 'springfield', class_level: 'Class 9A', enrolled_at: '2024-02-16T10:00:00Z', progress_percentage: 48, status: 'active', last_activity_at: '2024-03-11T09:20:00Z', certificate_issued: false },
  { id: 'enroll-sp-11', course_id: 'course-2', course_title: 'Full Stack Web Development', course_code: 'WEB201', student_id: 'springfield-902', student_name: 'Karthik Rao', institution_id: 'springfield', class_level: 'Class 9A', enrolled_at: '2024-02-16T10:00:00Z', progress_percentage: 65, status: 'active', last_activity_at: '2024-03-13T11:45:00Z', certificate_issued: false },
  { id: 'enroll-sp-12', course_id: 'course-2', course_title: 'Full Stack Web Development', course_code: 'WEB201', student_id: 'springfield-903', student_name: 'Meera Shah', institution_id: 'springfield', class_level: 'Class 9A', enrolled_at: '2024-02-16T10:00:00Z', progress_percentage: 82, status: 'active', last_activity_at: '2024-03-14T15:10:00Z', certificate_issued: false },
  
  // Springfield - IoT Course - Class 10A
  { id: 'enroll-sp-13', course_id: 'course-3', course_title: 'Internet of Things & Smart Devices', course_code: 'IOT301', student_id: 'springfield-1001', student_name: 'Aditya Gupta', institution_id: 'springfield', class_level: 'Class 10A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 58, status: 'active', last_activity_at: '2024-03-12T12:30:00Z', certificate_issued: false },
  { id: 'enroll-sp-14', course_id: 'course-3', course_title: 'Internet of Things & Smart Devices', course_code: 'IOT301', student_id: 'springfield-1002', student_name: 'Neha Joshi', institution_id: 'springfield', class_level: 'Class 10A', enrolled_at: '2024-02-02T10:00:00Z', progress_percentage: 75, status: 'active', last_activity_at: '2024-03-13T14:20:00Z', certificate_issued: false },
  
  // Springfield - Data Science Course - Class 9B
  { id: 'enroll-sp-15', course_id: 'course-5', course_title: 'Data Science Fundamentals', course_code: 'DS201', student_id: 'springfield-921', student_name: 'Rahul Verma', institution_id: 'springfield', class_level: 'Class 9B', enrolled_at: '2024-02-11T10:00:00Z', progress_percentage: 42, status: 'active', last_activity_at: '2024-03-09T10:15:00Z', certificate_issued: false },
  { id: 'enroll-sp-16', course_id: 'course-5', course_title: 'Data Science Fundamentals', course_code: 'DS201', student_id: 'springfield-922', student_name: 'Pooja Menon', institution_id: 'springfield', class_level: 'Class 9B', enrolled_at: '2024-02-11T10:00:00Z', progress_percentage: 70, status: 'active', last_activity_at: '2024-03-13T16:40:00Z', certificate_issued: false }
];

// Mock Submissions
export const mockSubmissions: AssignmentSubmission[] = [
  // AI Course submissions
  { id: 'sub-sp-1', assignment_id: 'assign-1', assignment_title: 'Build a Linear Regression Model', student_id: 'springfield-801', student_name: 'Rajesh Kumar', submission_type: 'file', file_url: '/submissions/rajesh-lr.zip', submitted_at: '2024-03-14T18:30:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 85, graded_by: 'off-001', graded_at: '2024-03-16T10:00:00Z', feedback: 'Good work!', status: 'graded' },
  { id: 'sub-sp-2', assignment_id: 'assign-1', assignment_title: 'Build a Linear Regression Model', student_id: 'springfield-802', student_name: 'Priya Sharma', submission_type: 'file', file_url: '/submissions/priya-lr.zip', submitted_at: '2024-03-14T16:20:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 95, graded_by: 'off-001', graded_at: '2024-03-16T11:00:00Z', feedback: 'Excellent!', status: 'graded' },
  { id: 'sub-sp-3', assignment_id: 'assign-1', assignment_title: 'Build a Linear Regression Model', student_id: 'springfield-803', student_name: 'Amit Patel', submission_type: 'file', file_url: '/submissions/amit-lr.zip', submitted_at: '2024-03-15T22:45:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 65, graded_by: 'off-001', graded_at: '2024-03-17T09:00:00Z', feedback: 'Needs improvement', status: 'graded' },
  { id: 'sub-sp-4', assignment_id: 'assign-1', assignment_title: 'Build a Linear Regression Model', student_id: 'springfield-804', student_name: 'Sneha Reddy', submission_type: 'file', file_url: '/submissions/sneha-lr.zip', submitted_at: '2024-03-14T20:10:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 88, graded_by: 'off-001', graded_at: '2024-03-16T14:00:00Z', feedback: 'Very good', status: 'graded' },
  { id: 'sub-sp-5', assignment_id: 'assign-1', assignment_title: 'Build a Linear Regression Model', student_id: 'springfield-805', student_name: 'Vikram Singh', submission_type: 'file', file_url: '/submissions/vikram-lr.zip', submitted_at: '2024-03-14T15:30:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 98, graded_by: 'off-001', graded_at: '2024-03-16T12:00:00Z', feedback: 'Outstanding!', status: 'graded' },
  
  // Web Dev submissions
  { id: 'sub-sp-6', assignment_id: 'assign-2', assignment_title: 'Build a React Todo App', student_id: 'springfield-901', student_name: 'Divya Krishnan', submission_type: 'url', url_content: 'https://github.com/divya/todo', submitted_at: '2024-03-19T14:20:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 75, graded_by: 'off-002', graded_at: '2024-03-21T10:00:00Z', feedback: 'Good effort', status: 'graded' },
  { id: 'sub-sp-7', assignment_id: 'assign-2', assignment_title: 'Build a React Todo App', student_id: 'springfield-902', student_name: 'Karthik Rao', submission_type: 'url', url_content: 'https://github.com/karthik/todo', submitted_at: '2024-03-19T16:45:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 82, graded_by: 'off-002', graded_at: '2024-03-21T11:00:00Z', feedback: 'Well done', status: 'graded' },
  { id: 'sub-sp-8', assignment_id: 'assign-2', assignment_title: 'Build a React Todo App', student_id: 'springfield-903', student_name: 'Meera Shah', submission_type: 'url', url_content: 'https://github.com/meera/todo', submitted_at: '2024-03-19T18:10:00Z', is_late: false, late_penalty_applied: 0, total_points: 100, grade: 92, graded_by: 'off-002', graded_at: '2024-03-21T12:00:00Z', feedback: 'Excellent work!', status: 'graded' }
];

// Mock Quiz Attempts
export const mockQuizAttempts: QuizAttempt[] = [
  { id: 'qa-sp-1', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-801', student_name: 'Rajesh Kumar', attempt_number: 1, started_at: '2024-02-15T10:00:00Z', submitted_at: '2024-02-15T10:25:00Z', time_taken_minutes: 25, score: 18, percentage: 90, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 0, is_correct: true, points_earned: 10 }] },
  { id: 'qa-sp-2', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-802', student_name: 'Priya Sharma', attempt_number: 1, started_at: '2024-02-15T11:00:00Z', submitted_at: '2024-02-15T11:22:00Z', time_taken_minutes: 22, score: 20, percentage: 100, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 0, is_correct: true, points_earned: 10 }] },
  { id: 'qa-sp-3', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-803', student_name: 'Amit Patel', attempt_number: 1, started_at: '2024-02-15T14:00:00Z', submitted_at: '2024-02-15T14:28:00Z', time_taken_minutes: 28, score: 13, percentage: 65, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 1, is_correct: false, points_earned: 0 }] },
  { id: 'qa-sp-4', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-804', student_name: 'Sneha Reddy', attempt_number: 1, started_at: '2024-02-15T15:00:00Z', submitted_at: '2024-02-15T15:24:00Z', time_taken_minutes: 24, score: 17, percentage: 85, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 0, is_correct: true, points_earned: 10 }] },
  { id: 'qa-sp-5', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-805', student_name: 'Vikram Singh', attempt_number: 1, started_at: '2024-02-15T16:00:00Z', submitted_at: '2024-02-15T16:20:00Z', time_taken_minutes: 20, score: 20, percentage: 100, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 0, is_correct: true, points_earned: 10 }] },
  { id: 'qa-sp-6', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-821', student_name: 'Rohan Mehta', attempt_number: 1, started_at: '2024-02-16T10:00:00Z', submitted_at: '2024-02-16T10:27:00Z', time_taken_minutes: 27, score: 16, percentage: 80, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 0, is_correct: true, points_earned: 10 }] },
  { id: 'qa-sp-7', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-822', student_name: 'Kavya Iyer', attempt_number: 1, started_at: '2024-02-16T11:00:00Z', submitted_at: '2024-02-16T11:23:00Z', time_taken_minutes: 23, score: 19, percentage: 95, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 0, is_correct: true, points_earned: 10 }] },
  { id: 'qa-sp-8', quiz_id: 'quiz-1', quiz_title: 'AI Fundamentals Quiz', student_id: 'springfield-823', student_name: 'Arjun Nair', attempt_number: 1, started_at: '2024-02-16T14:00:00Z', submitted_at: '2024-02-16T14:26:00Z', time_taken_minutes: 26, score: 15, percentage: 75, status: 'graded', answers: [{ question_id: 'q-1', student_answer: 0, is_correct: true, points_earned: 10 }, { question_id: 'q-2', student_answer: 1, is_correct: false, points_earned: 0 }] }
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
