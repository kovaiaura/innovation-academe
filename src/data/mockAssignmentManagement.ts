import {
  StandaloneAssignment,
  StandaloneAssignmentSubmission,
  AssignmentStats,
  StudentAssignmentSummary,
} from '@/types/assignment-management';

// localStorage keys
const ASSIGNMENTS_STORAGE_KEY = 'standalone_assignments';
const SUBMISSIONS_STORAGE_KEY = 'assignment_submissions';

export const mockAssignmentStats: AssignmentStats = {
  total: 27,
  ongoing: 10,
  upcoming: 9,
  completed: 7,
  overdue: 3,
};

export const mockStudentAssignmentSummary: StudentAssignmentSummary = {
  pending: 5,
  submitted: 3,
  graded: 12,
  overdue: 1,
};

// Initial mock assignments with correct institution IDs
const initialAssignments: StandaloneAssignment[] = [
  {
    id: 'assign-1',
    title: 'Research Paper on AI Ethics',
    description: 'Write a comprehensive research paper discussing ethical implications of AI in healthcare.',
    instructions: 'Your paper should be 2000-2500 words, properly cited using APA format.',
    assignment_type: 'file_upload',
    due_date: '2025-12-20',
    due_time: '23:59',
    submission_type: 'file_upload',
    allowed_file_types: ['pdf', 'docx'],
    max_file_size_mb: 10,
    late_submission_policy: 'allowed_with_penalty',
    late_penalty_percentage: 10,
    total_points: 100,
    rubric: [
      { id: 'r1', criteria: 'Content Quality', points: 40, description: 'Depth of research and analysis' },
      { id: 'r2', criteria: 'Structure & Organization', points: 30, description: 'Logical flow and clarity' },
      { id: 'r3', criteria: 'Citations & References', points: 20, description: 'Proper use of sources' },
      { id: 'r4', criteria: 'Grammar & Presentation', points: 10, description: 'Language quality' },
    ],
    status: 'ongoing',
    created_by: 'admin-1',
    created_by_name: 'Dr. Sarah Johnson',
    created_at: '2025-11-01T10:00:00Z',
    published_at: '2025-11-01T14:00:00Z',
    publishing: [
      {
        id: 'pub-1',
        assignment_id: 'assign-1',
        institution_id: 'inst-msd-001',
        institution_name: 'Modern School Vasant Vihar',
        class_ids: ['class-msd-12a', 'class-msd-12b'],
        class_names: ['Grade 12 - Section A', 'Grade 12 - Section B'],
        published_at: '2025-11-01T14:00:00Z',
      },
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'Sample Research Paper.pdf',
        url: '/files/sample-research.pdf',
        type: 'pdf',
        size_mb: 2.5,
        uploaded_at: '2025-11-01T10:30:00Z',
      },
    ],
    total_submissions: 45,
    graded_submissions: 12,
  },
  {
    id: 'assign-2',
    title: 'Python Programming Challenge',
    description: 'Complete a series of Python programming tasks to demonstrate your understanding of data structures.',
    assignment_type: 'multi_question',
    due_date: '2025-11-25',
    due_time: '18:00',
    duration_minutes: 90,
    submission_type: 'multi_question',
    late_submission_policy: 'not_allowed',
    total_points: 50,
    auto_grade: true,
    status: 'ongoing',
    created_by: 'admin-1',
    created_by_name: 'Prof. Michael Chen',
    created_at: '2025-11-05T09:00:00Z',
    published_at: '2025-11-05T12:00:00Z',
    publishing: [
      {
        id: 'pub-2',
        assignment_id: 'assign-2',
        institution_id: 'inst-msd-001',
        institution_name: 'Modern School Vasant Vihar',
        class_ids: ['class-msd-11a'],
        class_names: ['Grade 11 - Section A'],
        published_at: '2025-11-05T12:00:00Z',
      },
    ],
    questions: [
      {
        id: 'q1',
        assignment_id: 'assign-2',
        question_type: 'mcq',
        question_text: 'Which data structure uses FIFO (First In First Out) principle?',
        order_number: 1,
        points: 10,
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correct_answer: 'Queue',
        required: true,
      },
      {
        id: 'q2',
        assignment_id: 'assign-2',
        question_type: 'short_answer',
        question_text: 'Explain the difference between a list and a tuple in Python.',
        order_number: 2,
        points: 15,
        required: true,
      },
      {
        id: 'q3',
        assignment_id: 'assign-2',
        question_type: 'file_upload',
        question_text: 'Upload your Python code solution for the binary search implementation.',
        order_number: 3,
        points: 25,
        allowed_file_types: ['py', 'txt'],
        max_file_size_mb: 1,
        required: true,
      },
    ],
    total_submissions: 28,
    graded_submissions: 28,
  },
  {
    id: 'assign-3',
    title: 'Project Proposal Submission',
    description: 'Submit your innovation project proposal with detailed timeline and objectives.',
    assignment_type: 'text_submission',
    due_date: '2025-11-30',
    due_time: '17:00',
    submission_type: 'text_submission',
    late_submission_policy: 'allowed_no_penalty',
    total_points: 50,
    status: 'upcoming',
    created_by: 'admin-1',
    created_by_name: 'Dr. Emily Roberts',
    created_at: '2025-11-10T08:00:00Z',
    published_at: '2025-11-10T10:00:00Z',
    publishing: [
      {
        id: 'pub-3',
        assignment_id: 'assign-3',
        institution_id: 'inst-msd-001',
        institution_name: 'Modern School Vasant Vihar',
        class_ids: ['class-msd-12a', 'class-msd-11a'],
        class_names: ['Grade 12 - Section A', 'Grade 11 - Section A'],
        published_at: '2025-11-10T10:00:00Z',
      },
    ],
    total_submissions: 0,
    graded_submissions: 0,
  },
  {
    id: 'assign-4',
    title: 'Video Presentation: Innovation Showcase',
    description: 'Record and submit a 5-minute video presenting your innovation project.',
    assignment_type: 'url_submission',
    due_date: '2025-12-05',
    due_time: '20:00',
    submission_type: 'url_submission',
    late_submission_policy: 'allowed_with_penalty',
    late_penalty_percentage: 5,
    total_points: 75,
    status: 'upcoming',
    created_by: 'admin-1',
    created_by_name: 'Prof. David Lee',
    created_at: '2025-11-12T11:00:00Z',
    published_at: '2025-11-12T13:00:00Z',
    publishing: [
      {
        id: 'pub-4',
        assignment_id: 'assign-4',
        institution_id: 'inst-kga-001',
        institution_name: 'Kikani Global Academy',
        class_ids: ['class-kga-10a', 'class-kga-10b'],
        class_names: ['Grade 10 - Section A', 'Grade 10 - Section B'],
        published_at: '2025-11-12T13:00:00Z',
      },
    ],
    total_submissions: 0,
    graded_submissions: 0,
  },
  {
    id: 'assign-5',
    title: 'Data Science Quiz - Classification Algorithms',
    description: 'Test your knowledge on classification algorithms including decision trees, random forests, and SVMs.',
    assignment_type: 'multi_question',
    due_date: '2025-12-01',
    due_time: '15:00',
    duration_minutes: 45,
    submission_type: 'multi_question',
    late_submission_policy: 'not_allowed',
    total_points: 60,
    auto_grade: true,
    status: 'ongoing',
    created_by: 'admin-1',
    created_by_name: 'Prof. Ava Martinez',
    created_at: '2025-11-08T12:00:00Z',
    published_at: '2025-11-08T13:00:00Z',
    publishing: [
      {
        id: 'pub-5',
        assignment_id: 'assign-5',
        institution_id: 'inst-kga-001',
        institution_name: 'Kikani Global Academy',
        class_ids: ['class-kga-11a', 'class-kga-11b'],
        class_names: ['Grade 11 - Section A', 'Grade 11 - Section B'],
        published_at: '2025-11-08T13:00:00Z',
      },
    ],
    questions: [
      {
        id: 'q1-ds',
        assignment_id: 'assign-5',
        question_type: 'mcq',
        question_text: 'Which algorithm is best suited for handling non-linear classification problems?',
        order_number: 1,
        points: 10,
        options: ['Linear Regression', 'Logistic Regression', 'Decision Tree', 'K-Nearest Neighbors'],
        correct_answer: 'Decision Tree',
        required: true,
      },
      {
        id: 'q2-ds',
        assignment_id: 'assign-5',
        question_type: 'true_false',
        question_text: 'Random Forest is an ensemble learning method that combines multiple decision trees.',
        order_number: 2,
        points: 10,
        options: ['True', 'False'],
        correct_answer: 'True',
        required: true,
      },
      {
        id: 'q3-ds',
        assignment_id: 'assign-5',
        question_type: 'mcq',
        question_text: 'What is the primary goal of cross-validation in machine learning?',
        order_number: 3,
        points: 15,
        options: [
          'To increase training speed',
          'To reduce model complexity',
          'To assess model performance on unseen data',
          'To improve data visualization'
        ],
        correct_answer: 'To assess model performance on unseen data',
        required: true,
      },
      {
        id: 'q4-ds',
        assignment_id: 'assign-5',
        question_type: 'short_answer',
        question_text: 'Explain in 2-3 sentences what overfitting means in machine learning and how it can be prevented.',
        order_number: 4,
        points: 25,
        required: true,
      },
    ],
    total_submissions: 18,
    graded_submissions: 15,
  },
  {
    id: 'assign-6',
    title: 'Lab Report: Chemical Reactions Experiment',
    description: 'Submit a detailed lab report documenting your chemical reactions experiment conducted in class.',
    instructions: 'Include hypothesis, procedure, observations, results, and conclusion. Add photos of your setup.',
    assignment_type: 'file_upload',
    due_date: '2025-12-10',
    due_time: '23:59',
    submission_type: 'file_upload',
    allowed_file_types: ['pdf', 'docx'],
    max_file_size_mb: 15,
    late_submission_policy: 'allowed_with_penalty',
    late_penalty_percentage: 15,
    total_points: 80,
    rubric: [
      { id: 'r1', criteria: 'Hypothesis & Background', points: 15, description: 'Clear problem statement' },
      { id: 'r2', criteria: 'Procedure Documentation', points: 20, description: 'Detailed methodology' },
      { id: 'r3', criteria: 'Results & Analysis', points: 30, description: 'Data presentation and interpretation' },
      { id: 'r4', criteria: 'Conclusion', points: 15, description: 'Summary and insights' },
    ],
    status: 'upcoming',
    created_by: 'admin-1',
    created_by_name: 'Dr. James Wilson',
    created_at: '2025-11-14T09:00:00Z',
    published_at: '2025-11-14T11:00:00Z',
    publishing: [
      {
        id: 'pub-6',
        assignment_id: 'assign-6',
        institution_id: 'inst-msd-001',
        institution_name: 'Modern School Vasant Vihar',
        class_ids: ['class-msd-12b'],
        class_names: ['Grade 12 - Section B'],
        published_at: '2025-11-14T11:00:00Z',
      },
    ],
    attachments: [
      {
        id: 'att-2',
        name: 'Lab Report Template.docx',
        url: '/files/lab-template.docx',
        type: 'docx',
        size_mb: 0.5,
        uploaded_at: '2025-11-14T09:30:00Z',
      },
    ],
    total_submissions: 0,
    graded_submissions: 0,
  },
  {
    id: 'assign-7',
    title: 'Literature Analysis Essay',
    description: 'Write an analytical essay on the themes and symbolism in "To Kill a Mockingbird".',
    instructions: 'Essay should be 1500-2000 words with at least 3 academic sources cited.',
    assignment_type: 'text_submission',
    due_date: '2025-12-15',
    due_time: '23:59',
    submission_type: 'text_submission',
    late_submission_policy: 'allowed_with_penalty',
    late_penalty_percentage: 20,
    total_points: 100,
    rubric: [
      { id: 'r1', criteria: 'Thesis & Argument', points: 30, description: 'Clear central argument' },
      { id: 'r2', criteria: 'Evidence & Analysis', points: 40, description: 'Use of textual evidence' },
      { id: 'r3', criteria: 'Writing Quality', points: 20, description: 'Grammar and style' },
      { id: 'r4', criteria: 'Citations', points: 10, description: 'Proper citation format' },
    ],
    status: 'upcoming',
    created_by: 'admin-1',
    created_by_name: 'Ms. Patricia Brown',
    created_at: '2025-11-16T10:00:00Z',
    published_at: '2025-11-16T12:00:00Z',
    publishing: [
      {
        id: 'pub-7',
        assignment_id: 'assign-7',
        institution_id: 'inst-kga-001',
        institution_name: 'Kikani Global Academy',
        class_ids: ['class-kga-12a', 'class-kga-12b'],
        class_names: ['Grade 12 - Section A', 'Grade 12 - Section B'],
        published_at: '2025-11-16T12:00:00Z',
      },
    ],
    total_submissions: 0,
    graded_submissions: 0,
  },
];

const initialSubmissions: StandaloneAssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignment_id: 'assign-1',
    student_id: 'student-msd-001',
    student_name: 'Aarav Sharma',
    class_id: 'class-msd-12a',
    institution_id: 'inst-msd-001',
    status: 'graded',
    submitted_at: '2025-11-15T14:30:00Z',
    is_late: false,
    files: [
      {
        id: 'file-1',
        name: 'AI_Ethics_Research_Aarav.pdf',
        url: '/submissions/aarav-research.pdf',
        type: 'pdf',
        size_mb: 3.2,
        uploaded_at: '2025-11-15T14:30:00Z',
      },
    ],
    grade: 88,
    max_grade: 100,
    rubric_scores: [
      { rubric_id: 'r1', criteria: 'Content Quality', points_awarded: 36, max_points: 40 },
      { rubric_id: 'r2', criteria: 'Structure & Organization', points_awarded: 28, max_points: 30 },
      { rubric_id: 'r3', criteria: 'Citations & References', points_awarded: 16, max_points: 20 },
      { rubric_id: 'r4', criteria: 'Grammar & Presentation', points_awarded: 8, max_points: 10 },
    ],
    feedback: 'Excellent research and analysis. Well-structured paper with good use of sources. Minor formatting issues.',
    graded_by: 'admin-1',
    graded_by_name: 'Dr. Sarah Johnson',
    graded_at: '2025-11-18T10:00:00Z',
  },
  {
    id: 'sub-2',
    assignment_id: 'assign-1',
    student_id: 'student-msd-002',
    student_name: 'Priya Patel',
    class_id: 'class-msd-12a',
    institution_id: 'inst-msd-001',
    status: 'submitted',
    submitted_at: '2025-11-16T09:20:00Z',
    is_late: false,
    files: [
      {
        id: 'file-2',
        name: 'Research_Paper_Priya.docx',
        url: '/submissions/priya-research.docx',
        type: 'docx',
        size_mb: 2.8,
        uploaded_at: '2025-11-16T09:20:00Z',
      },
    ],
    max_grade: 100,
  },
];

// localStorage functions
export function loadAssignments(): StandaloneAssignment[] {
  try {
    const stored = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading assignments from localStorage:', error);
  }
  // Initialize with default data
  saveAssignments(initialAssignments);
  return initialAssignments;
}

export function saveAssignments(assignments: StandaloneAssignment[]): void {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error('Error saving assignments to localStorage:', error);
  }
}

export function addAssignment(assignment: StandaloneAssignment): void {
  const assignments = loadAssignments();
  assignments.push(assignment);
  saveAssignments(assignments);
}

export function updateAssignment(id: string, updates: Partial<StandaloneAssignment>): void {
  const assignments = loadAssignments();
  const index = assignments.findIndex(a => a.id === id);
  if (index !== -1) {
    assignments[index] = { ...assignments[index], ...updates };
    saveAssignments(assignments);
  }
}

export function deleteAssignment(id: string): void {
  const assignments = loadAssignments();
  const filtered = assignments.filter(a => a.id !== id);
  saveAssignments(filtered);
}

export function getAssignmentsByInstitutionId(institutionId: string): StandaloneAssignment[] {
  const assignments = loadAssignments();
  return assignments.filter(a =>
    a.publishing.some(p => p.institution_id === institutionId)
  );
}

export function getAssignmentsByClassId(classId: string): StandaloneAssignment[] {
  const assignments = loadAssignments();
  return assignments.filter(a =>
    a.publishing.some(p => p.class_ids.includes(classId))
  );
}

export function getAssignmentById(id: string): StandaloneAssignment | undefined {
  const assignments = loadAssignments();
  return assignments.find(a => a.id === id);
}

// Submissions functions
export function loadSubmissions(): StandaloneAssignmentSubmission[] {
  try {
    const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading submissions from localStorage:', error);
  }
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(initialSubmissions));
  return initialSubmissions;
}

export function saveSubmissions(submissions: StandaloneAssignmentSubmission[]): void {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.error('Error saving submissions to localStorage:', error);
  }
}

export function getSubmissionsByStudent(studentId: string): StandaloneAssignmentSubmission[] {
  const submissions = loadSubmissions();
  return submissions.filter(s => s.student_id === studentId);
}

export function getSubmissionsByAssignment(assignmentId: string): StandaloneAssignmentSubmission[] {
  const submissions = loadSubmissions();
  return submissions.filter(s => s.assignment_id === assignmentId);
}

// Legacy exports for backward compatibility
export const mockAssignments = loadAssignments();
export const mockSubmissions = loadSubmissions();

export function getAssignmentsByStatus(status: string): StandaloneAssignment[] {
  const assignments = loadAssignments();
  if (status === 'all') return assignments;
  return assignments.filter(a => a.status === status);
}

export function getAssignmentsByInstitution(institutionId: string): StandaloneAssignment[] {
  return getAssignmentsByInstitutionId(institutionId);
}
