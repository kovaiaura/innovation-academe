import {
  StandaloneAssignment,
  StandaloneAssignmentSubmission,
  AssignmentStats,
  StudentAssignmentSummary,
} from '@/types/assignment-management';

export const mockAssignmentStats: AssignmentStats = {
  total: 24,
  ongoing: 8,
  upcoming: 6,
  completed: 7,
  overdue: 3,
};

export const mockStudentAssignmentSummary: StudentAssignmentSummary = {
  pending: 5,
  submitted: 3,
  graded: 12,
  overdue: 1,
};

export const mockAssignments: StandaloneAssignment[] = [
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
        institution_id: 'inst-1',
        institution_name: 'Central High School',
        class_ids: ['class-1', 'class-2'],
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
        institution_id: 'inst-1',
        institution_name: 'Central High School',
        class_ids: ['class-3'],
        class_names: ['Grade 11 - Computer Science'],
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
        institution_id: 'inst-1',
        institution_name: 'Central High School',
        class_ids: ['class-1', 'class-3'],
        class_names: ['Grade 12 - Section A', 'Grade 11 - Computer Science'],
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
        institution_id: 'inst-2',
        institution_name: 'Tech Institute',
        class_ids: ['class-4'],
        class_names: ['Grade 10 - Innovation Track'],
        published_at: '2025-11-12T13:00:00Z',
      },
    ],
    total_submissions: 0,
    graded_submissions: 0,
  },
];

export const mockSubmissions: StandaloneAssignmentSubmission[] = [
  {
    id: 'sub-1',
    assignment_id: 'assign-1',
    student_id: 'student-1',
    student_name: 'Alice Johnson',
    class_id: 'class-1',
    institution_id: 'inst-1',
    status: 'graded',
    submitted_at: '2025-11-15T14:30:00Z',
    is_late: false,
    files: [
      {
        id: 'file-1',
        name: 'AI_Ethics_Research_Alice.pdf',
        url: '/submissions/alice-research.pdf',
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
    student_id: 'student-2',
    student_name: 'Bob Smith',
    class_id: 'class-1',
    institution_id: 'inst-1',
    status: 'submitted',
    submitted_at: '2025-11-16T09:20:00Z',
    is_late: false,
    files: [
      {
        id: 'file-2',
        name: 'Research_Paper_Bob.docx',
        url: '/submissions/bob-research.docx',
        type: 'docx',
        size_mb: 2.8,
        uploaded_at: '2025-11-16T09:20:00Z',
      },
    ],
    max_grade: 100,
  },
];

export function getAssignmentsByStatus(status: string): StandaloneAssignment[] {
  if (status === 'all') return mockAssignments;
  return mockAssignments.filter(a => a.status === status);
}

export function getAssignmentsByInstitution(institutionId: string): StandaloneAssignment[] {
  return mockAssignments.filter(a =>
    a.publishing.some(p => p.institution_id === institutionId)
  );
}

export function getSubmissionsByAssignment(assignmentId: string): StandaloneAssignmentSubmission[] {
  return mockSubmissions.filter(s => s.assignment_id === assignmentId);
}
