export type ActivityEventType = 
  | 'competition'
  | 'hackathon'
  | 'science_fair'
  | 'exhibition'
  | 'workshop'
  | 'seminar'
  | 'cultural'
  | 'sports'
  | 'other';

export type EventStatus = 
  | 'draft'
  | 'published'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type ApplicationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'shortlisted';

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  event_type: ActivityEventType;
  status: EventStatus;
  
  // Dates
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  
  // Details
  venue?: string;
  max_participants?: number;
  current_participants: number;
  eligibility_criteria?: string;
  rules?: string;
  prizes?: string[];
  
  // Targeting
  institution_ids: string[]; // Empty = all institutions
  class_ids?: string[]; // Empty = all classes
  
  // Project Linking
  linked_project_ids?: string[]; // Projects participating in this event
  
  // Media
  banner_image?: string;
  attachments?: string[];
  
  // Metadata
  created_by: string; // System Admin ID
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  name: string;
  student_id?: string;
  class?: string;
  role?: string; // Team Lead, Member, etc.
}

export interface EventApplication {
  id: string;
  event_id: string;
  student_id: string;
  student_name: string;
  institution_id: string;
  class_id: string;
  
  // Application Details
  idea_title: string;
  idea_description: string;
  team_members?: TeamMember[];
  supporting_documents?: string[];
  
  // Status
  status: ApplicationStatus;
  applied_at: string;
  reviewed_by?: string; // Officer ID
  reviewed_at?: string;
  review_notes?: string;
  
  // Additional
  is_team_application: boolean;
}
