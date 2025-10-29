export interface OfficerTimetableSlot {
  id: string;
  officer_id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;  // '09:00'
  end_time: string;    // '10:00'
  class: string;       // 'Class 8A'
  subject: string;     // 'STEM Workshop - Robotics'
  room: string;        // 'Innovation Lab 1'
  type: 'workshop' | 'lab' | 'mentoring' | 'project_review';
  batch?: string;      // 'Batch A' (optional)
  course_id?: string;  // Links to Course
  current_module_id?: string; // Tracks which module you're on for this class
}

export interface OfficerTimetable {
  officer_id: string;
  slots: OfficerTimetableSlot[];
  total_hours: number;
  status: 'assigned' | 'partial' | 'not_assigned';
  last_updated: string;
}
