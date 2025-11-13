// Assignment Type Enum
export type AssignmentType = 
  | 'file_upload' 
  | 'text_submission' 
  | 'url_submission' 
  | 'multi_question';

// Assignment Status
export type AssignmentStatus = 
  | 'draft' 
  | 'ongoing' 
  | 'upcoming' 
  | 'completed' 
  | 'overdue';

// Submission Status
export type SubmissionStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'submitted' 
  | 'graded' 
  | 'late_submitted';

// Question Type (for multi_question assignments)
export type AssignmentQuestionType = 
  | 'mcq' 
  | 'true_false' 
  | 'short_answer' 
  | 'file_upload';

// Late Submission Policy
export type LateSubmissionPolicy = 
  | 'not_allowed' 
  | 'allowed_with_penalty' 
  | 'allowed_no_penalty';

// Standalone Assignment Interface
export interface StandaloneAssignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  assignment_type: AssignmentType;
  
  // Timing
  due_date: string;
  due_time?: string;
  duration_minutes?: number; // For timed assignments
  
  // Submission Settings
  submission_type: AssignmentType;
  allowed_file_types?: string[]; // ['pdf', 'docx', 'jpg'] etc.
  max_file_size_mb?: number;
  late_submission_policy: LateSubmissionPolicy;
  late_penalty_percentage?: number; // If late allowed with penalty
  
  // Grading
  total_points: number;
  rubric?: AssignmentRubric[];
  auto_grade?: boolean; // For question-based assignments
  
  // Publishing
  status: AssignmentStatus;
  created_by: string;
  created_by_name: string;
  created_at: string;
  published_at?: string;
  publishing: AssignmentPublishing[];
  
  // Questions (for multi_question type)
  questions?: AssignmentQuestion[];
  
  // Attachments/Resources
  attachments?: AssignmentAttachment[];
  
  // Stats
  total_submissions?: number;
  graded_submissions?: number;
}

// Assignment Question (for multi_question type)
export interface AssignmentQuestion {
  id: string;
  assignment_id: string;
  question_type: AssignmentQuestionType;
  question_text: string;
  order_number: number;
  points: number;
  
  // For MCQ/True-False
  options?: string[];
  correct_answer?: string;
  
  // For file upload questions
  allowed_file_types?: string[];
  max_file_size_mb?: number;
  
  // Additional settings
  explanation?: string;
  required: boolean;
}

// Assignment Publishing Info
export interface AssignmentPublishing {
  id: string;
  assignment_id: string;
  institution_id: string;
  institution_name: string;
  class_ids: string[];
  class_names: string[];
  published_at: string;
}

// Assignment Rubric Item
export interface AssignmentRubric {
  id: string;
  criteria: string;
  points: number;
  description?: string;
}

// Assignment Attachment
export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size_mb: number;
  uploaded_at: string;
}

// Student Assignment Submission
export interface StandaloneAssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  institution_id: string;
  
  // Submission Data
  status: SubmissionStatus;
  submitted_at?: string;
  is_late: boolean;
  
  // Content based on assignment type
  text_content?: string; // For text submissions
  url?: string; // For URL submissions
  files?: SubmissionFile[]; // For file uploads
  answers?: AssignmentAnswer[]; // For multi-question
  
  // Grading
  grade?: number;
  max_grade: number;
  rubric_scores?: RubricScore[];
  feedback?: string;
  feedback_files?: SubmissionFile[];
  graded_by?: string;
  graded_by_name?: string;
  graded_at?: string;
  
  // Draft/Auto-save
  draft_content?: string;
  last_saved_at?: string;
}

// Submission File
export interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size_mb: number;
  uploaded_at: string;
}

// Assignment Answer (for multi-question)
export interface AssignmentAnswer {
  question_id: string;
  answer: string | string[]; // String for most, array for file uploads (URLs)
  is_correct?: boolean; // For auto-graded questions
  points_earned?: number;
  auto_skipped?: boolean;
}

// Rubric Score (for grading)
export interface RubricScore {
  rubric_id: string;
  criteria: string;
  points_awarded: number;
  max_points: number;
  comments?: string;
}

// Summary Stats
export interface AssignmentStats {
  total: number;
  ongoing: number;
  upcoming: number;
  completed: number;
  overdue: number;
}

// Student Assignment Summary
export interface StudentAssignmentSummary {
  pending: number;
  submitted: number;
  graded: number;
  overdue: number;
}
