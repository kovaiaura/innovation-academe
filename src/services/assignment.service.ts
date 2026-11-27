import { supabase } from '@/integrations/supabase/client';
import { AcademicYearDateRange, getAcademicYearDateRange } from '@/utils/academicYear';
import { getOfficerAssignableClassIds, OfficerClassAccessGrant } from '@/utils/officerAssignmentAccess';
import { format } from 'date-fns';

const PAGE_SIZE = 1000;

async function fetchAllRows<T>(query: any): Promise<T[]> {
  const rows: T[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;

    const page = (data || []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return rows;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  submission_end_date: string;
  question_doc_url: string | null;
  created_by: string | null;
  created_by_role: string;
  institution_id: string | null;
  status: string;
  total_marks: number;
  passing_marks: number;
  allow_resubmit: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentWithClasses extends Assignment {
  classes: { id: string; class_name: string; section: string | null }[];
  submissions_count?: number;
}

export interface OfficerAssignableClass {
  id: string;
  class_name: string;
  section: string | null;
  institution_id: string;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  start_date: string;
  submission_end_date: string;
  question_doc_url?: string;
  institution_id?: string;
  status?: string;
  total_marks?: number;
  passing_marks?: number;
  allow_resubmit?: boolean;
  class_ids?: string[];
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  institution_id: string;
  class_id: string;
  submission_pdf_url: string;
  submitted_at: string;
  marks_obtained: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  status: string;
}

export const assignmentService = {
  async getOfficerAssignableClasses(userId: string, institutionId: string): Promise<OfficerAssignableClass[]> {
    const { data: officer, error: officerError } = await supabase
      .from('officers')
      .select('id, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (officerError) throw officerError;
    if (!officer || officer.status !== 'active') return [];

    const today = format(new Date(), 'yyyy-MM-dd');
    const [timetableRows, grants] = await Promise.all([
      fetchAllRows<{ class_id: string }>(
        supabase
          .from('institution_timetable_assignments')
          .select('class_id')
          .eq('institution_id', institutionId)
          .or(`teacher_id.eq.${officer.id},secondary_officer_id.eq.${officer.id},backup_officer_id.eq.${officer.id}`),
      ),
      fetchAllRows<OfficerClassAccessGrant>(
        supabase
          .from('officer_class_access_grants')
          .select('class_id, is_active, valid_from, valid_until')
          .eq('institution_id', institutionId)
          .eq('receiving_officer_id', officer.id)
          .eq('is_active', true)
          .lte('valid_from', today)
          .or(`valid_until.is.null,valid_until.gte.${today}`),
      ),
    ]);

    const classIds = getOfficerAssignableClassIds(
      timetableRows.map((row) => row.class_id),
      grants,
      today,
    );
    if (classIds.length === 0) return [];

    return fetchAllRows<OfficerAssignableClass>(
      supabase
        .from('classes')
        .select('id, class_name, section, institution_id')
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .in('id', classIds)
        .order('class_name'),
    );
  },

  async getOfficerAssignments(
    institutionId: string,
    classIds: string[],
    academicYear?: string,
    dateRange?: AcademicYearDateRange,
  ): Promise<AssignmentWithClasses[]> {
    const allowedClassIds = [...new Set(classIds.filter(Boolean))];
    if (allowedClassIds.length === 0) return [];

    const classAssignments = await fetchAllRows<any>(
      supabase
        .from('assignment_class_assignments')
        .select('assignment_id, class_id, classes:class_id(id, class_name, section)')
        .eq('institution_id', institutionId)
        .in('class_id', allowedClassIds),
    );
    const linkedAssignmentIds = new Set(classAssignments.map((item) => item.assignment_id as string));
    if (linkedAssignmentIds.size === 0) return [];

    let query = (supabase as any)
      .from('assignments')
      .select('*')
      .eq('institution_id', institutionId)
      .order('start_date', { ascending: false });

    if (academicYear) {
      const range = dateRange || getAcademicYearDateRange(academicYear);
      query = query.gte('start_date', range.start).lt('start_date', range.end);
    }

    const assignmentRows = await fetchAllRows<Assignment>(query);
    const visibleAssignments = assignmentRows.filter((assignment) => linkedAssignmentIds.has(assignment.id));
    if (visibleAssignments.length === 0) return [];

    const visibleIds = new Set(visibleAssignments.map((assignment) => assignment.id));
    const visibleLinks = classAssignments.filter((item) => visibleIds.has(item.assignment_id));
    const visibleClassIds = [...new Set(visibleLinks.map((item) => item.class_id as string))];
    const submissions = await fetchAllRows<{ assignment_id: string }>(
      (supabase as any)
        .from('assignment_submissions')
        .select('assignment_id')
        .in('assignment_id', visibleAssignments.map((assignment) => assignment.id))
        .in('class_id', visibleClassIds),
    );
    const submissionCounts = submissions.reduce<Record<string, number>>((counts, submission) => {
      counts[submission.assignment_id] = (counts[submission.assignment_id] || 0) + 1;
      return counts;
    }, {});

    return visibleAssignments.map((assignment) => ({
      ...assignment,
      classes: visibleLinks
        .filter((link) => link.assignment_id === assignment.id)
        .map((link) => link.classes)
        .filter(Boolean),
      submissions_count: submissionCounts[assignment.id] || 0,
    }));
  },

  async getAssignments(institutionId?: string, academicYear?: string, dateRange?: AcademicYearDateRange): Promise<AssignmentWithClasses[]> {
    let query = (supabase as any)
      .from('assignments')
      .select('*')
      .eq('status', 'published')
      .order('start_date', { ascending: false });

    if (institutionId) {
      query = query.eq('institution_id', institutionId);
    }

    if (academicYear) {
      const range = dateRange || getAcademicYearDateRange(academicYear);
      query = query.gte('start_date', range.start).lt('start_date', range.end);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get class assignments
    const assignmentIds = (data || []).map((a: Assignment) => a.id);
    if (assignmentIds.length === 0) return [];

    const { data: classAssignments } = await (supabase as any)
      .from('assignment_class_assignments')
      .select('assignment_id, class_id, classes:class_id(id, class_name, section)')
      .in('assignment_id', assignmentIds);

    // Get submissions count
    const { data: submissions } = await (supabase as any)
      .from('assignment_submissions')
      .select('assignment_id')
      .in('assignment_id', assignmentIds);

    return (data || []).map((assignment: Assignment) => {
      const assignedClasses = (classAssignments || [])
        .filter((ca: any) => ca.assignment_id === assignment.id)
        .map((ca: any) => ca.classes)
        .filter(Boolean);
      
      const submissionsCount = (submissions || []).filter((s: any) => s.assignment_id === assignment.id).length;

      return {
        ...assignment,
        classes: assignedClasses,
        submissions_count: submissionsCount
      };
    });
  },

  async getAllAssignments(academicYear?: string, dateRange?: AcademicYearDateRange): Promise<AssignmentWithClasses[]> {
    let query = (supabase as any)
      .from('assignments')
      .select('*')
      .order('start_date', { ascending: false });

    if (academicYear) {
      const range = dateRange || getAcademicYearDateRange(academicYear);
      query = query.gte('start_date', range.start).lt('start_date', range.end);
    }

    const { data, error } = await query;

    if (error) throw error;

    const assignmentIds = (data || []).map((a: Assignment) => a.id);
    if (assignmentIds.length === 0) return [];

    const { data: classAssignments } = await (supabase as any)
      .from('assignment_class_assignments')
      .select('assignment_id, class_id, classes:class_id(id, class_name, section)')
      .in('assignment_id', assignmentIds);

    return (data || []).map((assignment: Assignment) => ({
      ...assignment,
      classes: (classAssignments || [])
        .filter((ca: any) => ca.assignment_id === assignment.id)
        .map((ca: any) => ca.classes)
        .filter(Boolean)
    }));
  },

  async getAssignment(id: string): Promise<AssignmentWithClasses | null> {
    const { data, error } = await (supabase as any)
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    const { data: classAssignments } = await (supabase as any)
      .from('assignment_class_assignments')
      .select('class_id, classes:class_id(id, class_name, section)')
      .eq('assignment_id', id);

    return {
      ...data,
      classes: (classAssignments || []).map((ca: any) => ca.classes).filter(Boolean)
    };
  },

  async createAssignment(formData: AssignmentFormData, role: string = 'system_admin'): Promise<Assignment> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('assignments')
      .insert({
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        submission_end_date: formData.submission_end_date,
        question_doc_url: formData.question_doc_url,
        institution_id: formData.institution_id,
        status: formData.status || 'draft',
        total_marks: formData.total_marks || 100,
        passing_marks: formData.passing_marks || 40,
        allow_resubmit: formData.allow_resubmit !== false,
        created_by: userData?.user?.id,
        created_by_role: role
      })
      .select()
      .single();

    if (error) throw error;

    // Assign to classes if provided
    if (formData.class_ids && formData.class_ids.length > 0) {
      const classAssignments = formData.class_ids.map(classId => ({
        assignment_id: data.id,
        class_id: classId,
        institution_id: formData.institution_id,
        assigned_by: userData?.user?.id
      }));

      await (supabase as any)
        .from('assignment_class_assignments')
        .insert(classAssignments);
    }

    return data;
  },

  async getAssignmentsForInstitution(institutionId: string, academicYear?: string, dateRange?: AcademicYearDateRange): Promise<AssignmentWithClasses[]> {
    let query = (supabase as any)
      .from('assignments')
      .select('*')
      .eq('institution_id', institutionId)
      .order('start_date', { ascending: false });

    if (academicYear) {
      const range = dateRange || getAcademicYearDateRange(academicYear);
      query = query.gte('start_date', range.start).lt('start_date', range.end);
    }

    const { data, error } = await query;

    if (error) throw error;

    const assignmentIds = (data || []).map((a: Assignment) => a.id);
    if (assignmentIds.length === 0) return [];

    const { data: classAssignments } = await (supabase as any)
      .from('assignment_class_assignments')
      .select('assignment_id, class_id, classes:class_id(id, class_name, section)')
      .in('assignment_id', assignmentIds);

    // Get submissions count
    const { data: submissions } = await (supabase as any)
      .from('assignment_submissions')
      .select('assignment_id')
      .in('assignment_id', assignmentIds);

    return (data || []).map((assignment: Assignment) => {
      const assignedClasses = (classAssignments || [])
        .filter((ca: any) => ca.assignment_id === assignment.id)
        .map((ca: any) => ca.classes)
        .filter(Boolean);
      
      const submissionsCount = (submissions || []).filter((s: any) => s.assignment_id === assignment.id).length;

      return {
        ...assignment,
        classes: assignedClasses,
        submissions_count: submissionsCount
      };
    });
  },

  async updateAssignment(id: string, formData: Partial<AssignmentFormData>): Promise<Assignment> {
    const { data, error } = await (supabase as any)
      .from('assignments')
      .update({
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        submission_end_date: formData.submission_end_date,
        question_doc_url: formData.question_doc_url,
        status: formData.status,
        total_marks: formData.total_marks,
        passing_marks: formData.passing_marks,
        allow_resubmit: formData.allow_resubmit,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update class assignments if provided
    if (formData.class_ids !== undefined) {
      const { error: deleteLinksError } = await (supabase as any)
        .from('assignment_class_assignments')
        .delete()
        .eq('assignment_id', id);

      if (deleteLinksError) throw deleteLinksError;

      if (formData.class_ids.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        const classAssignments = formData.class_ids.map(classId => ({
          assignment_id: id,
          class_id: classId,
          institution_id: formData.institution_id || data.institution_id,
          assigned_by: userData?.user?.id
        }));

        await (supabase as any)
          .from('assignment_class_assignments')
          .insert(classAssignments);
      }
    }

    return data;
  },

  async deleteAssignment(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Submission functions
  async getSubmissions(assignmentId: string, classIds?: string[]): Promise<AssignmentSubmission[]> {
    if (classIds && classIds.length === 0) return [];

    let query = (supabase as any)
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (classIds) query = query.in('class_id', classIds);
    return fetchAllRows<AssignmentSubmission>(query);
  },

  async submitAssignment(params: {
    assignmentId: string;
    studentId: string;
    institutionId: string;
    classId: string;
    pdfUrl: string;
  }): Promise<AssignmentSubmission> {
    const { data, error } = await (supabase as any)
      .from('assignment_submissions')
      .upsert({
        assignment_id: params.assignmentId,
        student_id: params.studentId,
        institution_id: params.institutionId,
        class_id: params.classId,
        submission_pdf_url: params.pdfUrl,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }, { onConflict: 'assignment_id,student_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async gradeSubmission(submissionId: string, marks: number, feedback?: string): Promise<AssignmentSubmission> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('assignment_submissions')
      .update({
        marks_obtained: marks,
        feedback,
        graded_by: userData?.user?.id,
        graded_at: new Date().toISOString(),
        status: 'graded'
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;

    // Award assignment XP
    try {
      if (data?.student_id && data?.institution_id) {
        const { gamificationDbService } = await import('@/services/gamification-db.service');
        // Get total marks for this assignment
        const { data: assignment } = await supabase
          .from('assignments')
          .select('total_marks')
          .eq('id', data.assignment_id)
          .single();
        
        await gamificationDbService.awardAssignmentXP(
          data.student_id,
          data.institution_id,
          data.assignment_id,
          marks,
          assignment?.total_marks || null
        );
      }
    } catch (xpError) {
      console.error('Error awarding assignment XP:', xpError);
    }

    return data;
  },

  async getStudentSubmission(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    const { data, error } = await (supabase as any)
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .single();

    if (error) return null;
    return data;
  }
};
