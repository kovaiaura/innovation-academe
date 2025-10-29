export interface ContentCompletion {
  content_id: string;
  module_id: string;
  course_id: string;
  officer_id: string;
  completed: boolean;
  completed_at: string; // ISO timestamp
  watch_percentage?: number; // For videos
}

export interface ModuleProgress {
  module_id: string;
  total_content: number;
  completed_content: number;
  percentage: number;
}

export interface CourseProgress {
  course_id: string;
  total_content: number;
  completed_content: number;
  percentage: number;
  modules: ModuleProgress[];
}

export interface CompletionTimelineItem extends ContentCompletion {
  content_title: string;
  module_title: string;
  content_type: string;
}
