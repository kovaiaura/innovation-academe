import { ClassCourseAssignment } from '@/types/institution';

export const mockClassCourseAssignments: ClassCourseAssignment[] = [
  // Springfield High - Grade 1 A
  {
    id: 'assign-1',
    class_id: 'class-spring-1',
    course_id: 'course-1',
    course_title: 'Introduction to AI & ML',
    course_thumbnail: '/placeholder.svg',
    course_category: 'Artificial Intelligence',
    assigned_modules: [
      {
        module_id: 'mod-1-1',
        module_title: 'Introduction to AI Concepts',
        module_order: 1,
        unlock_mode: 'immediate',
        is_unlocked: true,
        completion_requirement: {
          require_all_content: true,
          require_all_assignments: true,
          require_all_quizzes: true,
          minimum_score_percent: 70
        },
        students_completed: 28
      },
      {
        module_id: 'mod-1-2',
        module_title: 'Machine Learning Basics',
        module_order: 2,
        unlock_mode: 'sequential',
        prerequisite_module_id: 'mod-1-1',
        is_unlocked: true,
        completion_requirement: {
          require_all_content: true,
          require_all_assignments: true,
          require_all_quizzes: true,
          minimum_score_percent: 70
        },
        students_completed: 15
      },
      {
        module_id: 'mod-1-3',
        module_title: 'Neural Networks',
        module_order: 3,
        unlock_mode: 'sequential',
        prerequisite_module_id: 'mod-1-2',
        is_unlocked: false,
        completion_requirement: {
          require_all_content: true,
          require_all_assignments: true,
          require_all_quizzes: true,
          minimum_score_percent: 70
        },
        students_completed: 0
      }
    ],
    assigned_officers: ['off-1', 'off-2'],
    start_date: '2024-09-01',
    expected_end_date: '2024-12-15',
    status: 'active',
    created_at: '2024-08-15T10:00:00Z',
    updated_at: '2024-08-15T10:00:00Z'
  },
  // Ryan International - Class 2D
  {
    id: 'assign-2',
    class_id: 'class-ryan-1',
    course_id: 'course-2',
    course_title: 'Web Development Fundamentals',
    course_thumbnail: '/placeholder.svg',
    course_category: 'Web Development',
    assigned_modules: [
      {
        module_id: 'mod-2-1',
        module_title: 'HTML & CSS Basics',
        module_order: 1,
        unlock_mode: 'immediate',
        is_unlocked: true,
        completion_requirement: {
          require_all_content: true,
          require_all_assignments: true,
          require_all_quizzes: false,
          minimum_score_percent: 60
        },
        students_completed: 22
      },
      {
        module_id: 'mod-2-2',
        module_title: 'JavaScript Fundamentals',
        module_order: 2,
        unlock_mode: 'date_based',
        unlock_date: '2024-10-01',
        is_unlocked: true,
        completion_requirement: {
          require_all_content: true,
          require_all_assignments: true,
          require_all_quizzes: true,
          minimum_score_percent: 65
        },
        students_completed: 18
      }
    ],
    assigned_officers: ['off-3'],
    start_date: '2024-09-10',
    expected_end_date: '2024-11-30',
    status: 'active',
    created_at: '2024-08-20T10:00:00Z',
    updated_at: '2024-08-20T10:00:00Z'
  }
];

export const getCourseAssignmentsByClass = (classId: string): ClassCourseAssignment[] => {
  return mockClassCourseAssignments.filter(assignment => assignment.class_id === classId);
};
