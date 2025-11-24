export interface Feedback {
  id: string;
  student_id: string;
  student_name?: string;
  category: 'course' | 'officer' | 'general' | 'facility' | 'other';
  subject: string;
  related_course_id?: string;
  related_course_name?: string;
  related_officer_id?: string;
  related_officer_name?: string;
  rating?: number;
  feedback_text: string;
  is_anonymous: boolean;
  attachments?: string[];
  submitted_at: string;
  status: 'submitted' | 'under_review' | 'resolved' | 'dismissed';
  admin_response?: string;
  resolved_at?: string;
}

export const mockFeedback: Feedback[] = [
  {
    id: 'feedback-1',
    student_id: 'student-1',
    student_name: 'Aarav Sharma',
    category: 'course',
    subject: 'Request for More Practical Sessions',
    related_course_id: 'course-1',
    related_course_name: 'Data Science Fundamentals',
    rating: 4,
    feedback_text: 'The course content is excellent, but I feel we need more hands-on practical sessions. The theory is well explained, but additional lab time would help solidify the concepts. Perhaps 2-3 more practical sessions per module would be ideal.',
    is_anonymous: false,
    submitted_at: '2024-03-15T10:30:00Z',
    status: 'under_review',
    admin_response: 'Thank you for your feedback. We are reviewing the course structure and will consider adding additional lab sessions.'
  },
  {
    id: 'feedback-2',
    student_id: 'student-1',
    student_name: 'Aarav Sharma',
    category: 'officer',
    subject: 'Excellent Teaching and Support',
    related_officer_id: 'officer-1',
    related_officer_name: 'Priya Mehta',
    rating: 5,
    feedback_text: 'Ms. Mehta has been incredibly helpful throughout the semester. She always takes time to answer questions and provides clear explanations. Her approach to teaching complex topics makes them easy to understand. I really appreciate her dedication.',
    is_anonymous: false,
    submitted_at: '2024-03-10T14:20:00Z',
    status: 'resolved',
    admin_response: 'Thank you for the positive feedback! We have shared your comments with Ms. Mehta.',
    resolved_at: '2024-03-12T09:00:00Z'
  },
  {
    id: 'feedback-3',
    student_id: 'student-1',
    category: 'facility',
    subject: 'Innovation Lab Equipment Needs Upgrade',
    rating: 3,
    feedback_text: 'The Innovation Lab is a great space, but some of the equipment is outdated. The 3D printers frequently malfunction, and we need more computers with better specifications for running design software. Also, the AC in the lab needs repair.',
    is_anonymous: true,
    submitted_at: '2024-03-08T16:45:00Z',
    status: 'under_review'
  },
  {
    id: 'feedback-4',
    student_id: 'student-2',
    student_name: 'Diya Patel',
    category: 'general',
    subject: 'Suggestion for Weekend Workshops',
    rating: 4,
    feedback_text: 'It would be great if we could have optional weekend workshops on emerging technologies like blockchain, IoT, etc. Many students are interested in learning beyond the curriculum.',
    is_anonymous: false,
    submitted_at: '2024-03-18T11:15:00Z',
    status: 'submitted'
  }
];
