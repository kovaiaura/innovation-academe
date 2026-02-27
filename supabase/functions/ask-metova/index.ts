import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create supabase client
function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Fetch AI settings from system_configurations
interface AISettings {
  enabled: boolean;
  custom_api_key: string;
  model: string;
  prompt_limit_enabled: boolean;
  monthly_prompt_limit: number;
}

async function getAISettings(): Promise<AISettings> {
  const supabase = getSupabaseClient();
  try {
    const { data } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'ask_metova_settings')
      .maybeSingle();
    
    if (data?.value) {
      const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      return {
        enabled: settings.enabled ?? true,
        custom_api_key: settings.custom_api_key || '',
        model: settings.model || 'gpt-4o-mini',
        prompt_limit_enabled: settings.prompt_limit_enabled ?? false,
        monthly_prompt_limit: settings.monthly_prompt_limit ?? 10
      };
    }
  } catch (e) {
    console.error('Error fetching AI settings:', e);
  }
  return { enabled: true, custom_api_key: '', model: 'gpt-4o-mini', prompt_limit_enabled: false, monthly_prompt_limit: 10 };
}

// Check and update user prompt usage
async function checkAndUpdateUsage(userId: string, role: string, limit: number): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = getSupabaseClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  try {
    const { data: usage } = await supabase
      .from('ai_prompt_usage')
      .select('id, prompt_count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single();
    
    const currentCount = usage?.prompt_count || 0;
    
    if (currentCount >= limit) {
      return { allowed: false, used: currentCount, limit };
    }
    
    if (usage) {
      await supabase
        .from('ai_prompt_usage')
        .update({ prompt_count: currentCount + 1, updated_at: now.toISOString() })
        .eq('id', usage.id);
    } else {
      await supabase
        .from('ai_prompt_usage')
        .insert({ user_id: userId, role, prompt_count: 1, month: currentMonth, year: currentYear });
    }
    
    return { allowed: true, used: currentCount + 1, limit };
  } catch (e) {
    console.error('Error checking/updating usage:', e);
    return { allowed: true, used: 0, limit };
  }
}

async function getUserUsage(userId: string): Promise<{ used: number; month: number; year: number }> {
  const supabase = getSupabaseClient();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  try {
    const { data } = await supabase
      .from('ai_prompt_usage')
      .select('prompt_count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single();
    
    return { used: data?.prompt_count || 0, month: currentMonth, year: currentYear };
  } catch (e) {
    return { used: 0, month: currentMonth, year: currentYear };
  }
}

// ==================== CONTEXT FETCHERS ====================

// 1. Institution Context
async function fetchInstitutionContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📍 INSTITUTIONS'];
  
  try {
    const { data: institutions } = await supabase
      .from('institutions')
      .select('id, name, status, current_users, max_users, contract_expiry_date, contract_value, type, code')
      .order('name');
    
    if (institutions?.length) {
      parts.push(`Total Institutions: ${institutions.length}`);
      for (const inst of institutions) {
        parts.push(`- **${inst.name}** (${inst.code || 'N/A'}): Type: ${inst.type || 'N/A'}, Status: ${inst.status}, Users: ${inst.current_users || 0}/${inst.max_users || 'unlimited'}, Contract: ₹${(inst.contract_value || 0).toLocaleString()}, Expiry: ${inst.contract_expiry_date || 'Not set'}`);
      }
    } else {
      parts.push('No institutions found in the system.');
    }

    const { data: classes } = await supabase
      .from('classes')
      .select('id, institution_id, class_name, status');
    
    if (classes?.length) {
      const classCount: Record<string, number> = {};
      for (const c of classes) {
        classCount[c.institution_id] = (classCount[c.institution_id] || 0) + 1;
      }
      parts.push('\n**Classes per Institution:**');
      for (const inst of (institutions || [])) {
        parts.push(`- ${inst.name}: ${classCount[inst.id] || 0} classes`);
      }
    }
  } catch (e) {
    console.error('Institution context error:', e);
    parts.push('Error fetching institution data.');
  }
  
  return parts.join('\n');
}

// 2. Student/Profile Context
async function fetchStudentProfileContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 👥 STUDENTS & PROFILES'];
  
  try {
    const { data: profiles, count } = await supabase
      .from('profiles')
      .select('institution_id, institutions(name)', { count: 'exact' })
      .not('institution_id', 'is', null);
    
    parts.push(`Total Students/Users: ${count || 0}`);
    
    if (profiles?.length) {
      const countMap: Record<string, number> = {};
      for (const p of profiles) {
        const inst = p.institutions as unknown as { name: string } | null;
        const name = inst?.name || 'Unassigned';
        countMap[name] = (countMap[name] || 0) + 1;
      }
      parts.push('**By Institution:**');
      for (const [name, cnt] of Object.entries(countMap).sort((a, b) => b[1] - a[1])) {
        parts.push(`- ${name}: ${cnt} students`);
      }
    }
  } catch (e) {
    console.error('Student context error:', e);
  }
  
  return parts.join('\n');
}

// 3. Officer Context
async function fetchOfficerContextData(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 👨‍🏫 OFFICERS (Trainers/Innovation Officers)'];
  
  try {
    const { data: officers, count } = await supabase
      .from('officers')
      .select('id, name, email, designation, department, status, officer_type', { count: 'exact' });
    
    parts.push(`Total Officers: ${count || 0}`);
    
    if (officers?.length) {
      const byStatus: Record<string, number> = {};
      const byDept: Record<string, number> = {};
      for (const o of officers) {
        byStatus[o.status || 'unknown'] = (byStatus[o.status || 'unknown'] || 0) + 1;
        byDept[o.department || 'Unassigned'] = (byDept[o.department || 'Unassigned'] || 0) + 1;
      }
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push('**By Department:**');
      for (const [d, c] of Object.entries(byDept).slice(0, 10)) parts.push(`- ${d}: ${c}`);
    }
  } catch (e) {
    console.error('Officer context error:', e);
  }
  
  return parts.join('\n');
}

// 4. Course Context
async function fetchCourseContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📚 COURSES'];
  
  try {
    const { data: courses, count } = await supabase
      .from('courses')
      .select('id, title, status, category, difficulty', { count: 'exact' });
    
    parts.push(`Total Courses: ${count || 0}`);
    
    if (courses?.length) {
      const byStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      for (const c of courses) {
        byStatus[c.status || 'unknown'] = (byStatus[c.status || 'unknown'] || 0) + 1;
        byCategory[c.category || 'Uncategorized'] = (byCategory[c.category || 'Uncategorized'] || 0) + 1;
      }
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push('**By Category:**');
      for (const [cat, c] of Object.entries(byCategory).slice(0, 8)) parts.push(`- ${cat}: ${c}`);
      parts.push('**Recent Courses:**');
      for (const c of courses.slice(0, 5)) parts.push(`- ${c.title} (${c.status})`);
    }

    const { count: assignmentCount } = await supabase
      .from('course_institution_assignments')
      .select('*', { count: 'exact', head: true });
    parts.push(`\nCourse-Institution Assignments: ${assignmentCount || 0}`);
  } catch (e) {
    console.error('Course context error:', e);
  }
  
  return parts.join('\n');
}

// 5. Assessment Context
async function fetchAssessmentContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📝 ASSESSMENTS'];
  
  try {
    const { data: assessments, count } = await supabase
      .from('assessments')
      .select('id, title, status, start_time, end_time, pass_percentage', { count: 'exact' });
    
    parts.push(`Total Assessments: ${count || 0}`);
    
    if (assessments?.length) {
      const byStatus: Record<string, number> = {};
      for (const a of assessments) {
        byStatus[a.status || 'unknown'] = (byStatus[a.status || 'unknown'] || 0) + 1;
      }
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      
      const now = new Date().toISOString();
      const upcoming = assessments.filter(a => a.start_time && a.start_time > now).slice(0, 5);
      if (upcoming.length) {
        parts.push('**Upcoming:**');
        for (const a of upcoming) parts.push(`- ${a.title} (starts: ${new Date(a.start_time).toLocaleDateString()})`);
      }
    }

    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('passed, percentage');
    
    if (attempts?.length) {
      const passed = attempts.filter(a => a.passed).length;
      const avgScore = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length;
      parts.push(`\n**Attempt Stats:** Total: ${attempts.length}, Passed: ${passed} (${((passed/attempts.length)*100).toFixed(1)}%), Avg Score: ${avgScore.toFixed(1)}%`);
    }
  } catch (e) {
    console.error('Assessment context error:', e);
  }
  
  return parts.join('\n');
}

// 6. Assignment Context
async function fetchAssignmentContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📋 ASSIGNMENTS'];
  
  try {
    const { data: assignments, count } = await supabase
      .from('assignments')
      .select('id, title, status, start_date, submission_end_date, total_marks', { count: 'exact' });
    
    parts.push(`Total Assignments: ${count || 0}`);
    
    if (assignments?.length) {
      const byStatus: Record<string, number> = {};
      for (const a of assignments) {
        byStatus[a.status || 'unknown'] = (byStatus[a.status || 'unknown'] || 0) + 1;
      }
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }

    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select('status, marks_obtained');
    
    if (submissions?.length) {
      const byStatus: Record<string, number> = {};
      for (const s of submissions) {
        byStatus[s.status || 'unknown'] = (byStatus[s.status || 'unknown'] || 0) + 1;
      }
      parts.push('**Submissions by Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    } else {
      parts.push('No submissions yet.');
    }
  } catch (e) {
    console.error('Assignment context error:', e);
  }
  
  return parts.join('\n');
}

// 7. Events Context
async function fetchEventsContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 🎉 EVENTS'];
  
  try {
    const { data: events, count } = await supabase
      .from('events')
      .select('id, title, status, event_type, event_start, event_end, current_participants, max_participants', { count: 'exact' });
    
    parts.push(`Total Events: ${count || 0}`);
    
    if (events?.length) {
      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};
      for (const e of events) {
        byStatus[e.status || 'unknown'] = (byStatus[e.status || 'unknown'] || 0) + 1;
        byType[e.event_type || 'other'] = (byType[e.event_type || 'other'] || 0) + 1;
      }
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push('**By Type:**');
      for (const [t, c] of Object.entries(byType)) parts.push(`- ${t}: ${c}`);
      
      const now = new Date().toISOString();
      const upcoming = events.filter(e => e.event_start && e.event_start > now).slice(0, 5);
      if (upcoming.length) {
        parts.push('**Upcoming Events:**');
        for (const e of upcoming) parts.push(`- ${e.title} (${e.event_type}) - ${new Date(e.event_start).toLocaleDateString()}`);
      }
    }

    const { count: regCount } = await supabase
      .from('event_interests')
      .select('*', { count: 'exact', head: true });
    parts.push(`\nTotal Event Registrations: ${regCount || 0}`);
  } catch (e) {
    console.error('Events context error:', e);
  }
  
  return parts.join('\n');
}

// 8. Projects Context
async function fetchProjectsContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 🚀 INNOVATION PROJECTS'];
  
  try {
    const { data: projects, count } = await supabase
      .from('projects')
      .select('id, title, status, sdg_goals, institution_id, institutions(name)', { count: 'exact' });
    
    parts.push(`Total Projects: ${count || 0}`);
    
    if (projects?.length) {
      const byStatus: Record<string, number> = {};
      const sdgCount: Record<string, number> = {};
      for (const p of projects) {
        byStatus[p.status || 'unknown'] = (byStatus[p.status || 'unknown'] || 0) + 1;
        if (p.sdg_goals && Array.isArray(p.sdg_goals)) {
          for (const g of p.sdg_goals) sdgCount[g] = (sdgCount[g] || 0) + 1;
        }
      }
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      if (Object.keys(sdgCount).length) {
        parts.push('**SDG Goals Coverage:**');
        for (const [g, c] of Object.entries(sdgCount).slice(0, 8)) parts.push(`- SDG ${g}: ${c} projects`);
      }
    }

    const { data: awards } = await supabase
      .from('project_achievements')
      .select('id, title, achievement_type');
    
    if (awards?.length) {
      parts.push(`\n**Project Awards/Achievements:** ${awards.length}`);
    }
  } catch (e) {
    console.error('Projects context error:', e);
  }
  
  return parts.join('\n');
}

// 9. Inventory Context
async function fetchInventoryContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📦 INVENTORY'];
  
  try {
    const { data: items, count } = await supabase
      .from('inventory_items')
      .select('id, name, category, current_stock, institution_id', { count: 'exact' });
    
    parts.push(`Total Inventory Items: ${count || 0}`);
    
    if (items?.length) {
      const byCategory: Record<string, number> = {};
      let lowStock = 0;
      for (const i of items) {
        byCategory[i.category || 'Uncategorized'] = (byCategory[i.category || 'Uncategorized'] || 0) + 1;
        if ((i.current_stock || 0) < 5) lowStock++;
      }
      parts.push('**By Category:**');
      for (const [c, n] of Object.entries(byCategory).slice(0, 8)) parts.push(`- ${c}: ${n}`);
      parts.push(`\n⚠️ Low Stock Items: ${lowStock}`);
    }

    const { data: requests } = await supabase
      .from('purchase_requests')
      .select('status');
    
    if (requests?.length) {
      const byStatus: Record<string, number> = {};
      for (const r of requests) byStatus[r.status || 'unknown'] = (byStatus[r.status || 'unknown'] || 0) + 1;
      parts.push('**Purchase Requests:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }

    const { data: issues } = await supabase
      .from('inventory_issues')
      .select('status');
    
    if (issues?.length) {
      const open = issues.filter(i => i.status === 'open' || i.status === 'pending').length;
      parts.push(`\nOpen Inventory Issues: ${open}`);
    }
  } catch (e) {
    console.error('Inventory context error:', e);
  }
  
  return parts.join('\n');
}

// 10. Payroll Context
async function fetchPayrollContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 💰 PAYROLL'];
  
  try {
    const { data: payrolls } = await supabase
      .from('payroll_records')
      .select('status, net_salary, month, year');
    
    if (payrolls?.length) {
      const byStatus: Record<string, number> = {};
      let totalPaid = 0;
      let totalPending = 0;
      for (const p of payrolls) {
        byStatus[p.status || 'unknown'] = (byStatus[p.status || 'unknown'] || 0) + 1;
        if (p.status === 'paid') totalPaid += p.net_salary || 0;
        else totalPending += p.net_salary || 0;
      }
      parts.push(`Total Records: ${payrolls.length}`);
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push(`\nTotal Paid: ₹${totalPaid.toLocaleString()}`);
      parts.push(`Pending: ₹${totalPending.toLocaleString()}`);
    } else {
      parts.push('No payroll records found.');
    }
  } catch (e) {
    console.error('Payroll context error:', e);
  }
  
  return parts.join('\n');
}

// 11. Leave Context
async function fetchLeaveContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 🏖️ LEAVE MANAGEMENT'];
  
  try {
    const { data: leaves } = await supabase
      .from('leave_applications')
      .select('status, leave_type, start_date, end_date');
    
    if (leaves?.length) {
      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};
      for (const l of leaves) {
        byStatus[l.status || 'unknown'] = (byStatus[l.status || 'unknown'] || 0) + 1;
        byType[l.leave_type || 'other'] = (byType[l.leave_type || 'other'] || 0) + 1;
      }
      parts.push(`Total Applications: ${leaves.length}`);
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push('**By Type:**');
      for (const [t, c] of Object.entries(byType)) parts.push(`- ${t}: ${c}`);
    } else {
      parts.push('No leave applications found.');
    }

    const { data: holidays } = await supabase
      .from('company_holidays')
      .select('name, date, holiday_type')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .limit(5);
    
    if (holidays?.length) {
      parts.push('\n**Upcoming Holidays:**');
      for (const h of holidays) parts.push(`- ${h.name} (${h.holiday_type}) - ${h.date}`);
    }
  } catch (e) {
    console.error('Leave context error:', e);
  }
  
  return parts.join('\n');
}

// 12. Task Context
async function fetchTaskContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## ✅ CRM TASKS'];
  
  try {
    const { data: tasks } = await supabase
      .from('crm_tasks')
      .select('status, priority, due_date, task_type');
    
    if (tasks?.length) {
      const byStatus: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      let overdue = 0;
      const today = new Date().toISOString().split('T')[0];
      
      for (const t of tasks) {
        byStatus[t.status || 'unknown'] = (byStatus[t.status || 'unknown'] || 0) + 1;
        byPriority[t.priority || 'normal'] = (byPriority[t.priority || 'normal'] || 0) + 1;
        if (t.due_date && t.due_date < today && t.status !== 'completed') overdue++;
      }
      parts.push(`Total Tasks: ${tasks.length}`);
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push('**By Priority:**');
      for (const [p, c] of Object.entries(byPriority)) parts.push(`- ${p}: ${c}`);
      parts.push(`\n⚠️ Overdue Tasks: ${overdue}`);
    } else {
      parts.push('No tasks found.');
    }
  } catch (e) {
    console.error('Task context error:', e);
  }
  
  return parts.join('\n');
}

// 13. Gamification Context
async function fetchGamificationContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 🎮 GAMIFICATION'];
  
  try {
    const { data: badges, count: badgeCount } = await supabase
      .from('gamification_badges')
      .select('name, category, xp_reward, is_active', { count: 'exact' });
    
    parts.push(`Total Badges: ${badgeCount || 0}`);
    if (badges?.length) {
      const active = badges.filter(b => b.is_active).length;
      parts.push(`Active Badges: ${active}`);
    }

    const { data: xpData } = await supabase
      .from('student_xp_transactions')
      .select('points_earned, activity_type');
    
    if (xpData?.length) {
      const totalXP = xpData.reduce((sum, x) => sum + (x.points_earned || 0), 0);
      const byActivity: Record<string, number> = {};
      for (const x of xpData) {
        byActivity[x.activity_type || 'other'] = (byActivity[x.activity_type || 'other'] || 0) + (x.points_earned || 0);
      }
      parts.push(`\nTotal XP Distributed: ${totalXP.toLocaleString()}`);
      parts.push('**XP by Activity:**');
      for (const [a, p] of Object.entries(byActivity).slice(0, 5)) parts.push(`- ${a}: ${p} XP`);
    }
  } catch (e) {
    console.error('Gamification context error:', e);
  }
  
  return parts.join('\n');
}

// 14. ATS/Recruitment Context
async function fetchATSContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 👔 RECRUITMENT (ATS)'];
  
  try {
    const { data: jobs } = await supabase
      .from('job_postings')
      .select('status, department, job_type');
    
    if (jobs?.length) {
      const byStatus: Record<string, number> = {};
      for (const j of jobs) byStatus[j.status || 'unknown'] = (byStatus[j.status || 'unknown'] || 0) + 1;
      parts.push(`Total Job Postings: ${jobs.length}`);
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    } else {
      parts.push('No job postings found.');
    }

    const { data: apps } = await supabase
      .from('job_applications')
      .select('status');
    
    if (apps?.length) {
      const byStatus: Record<string, number> = {};
      for (const a of apps) byStatus[a.status || 'unknown'] = (byStatus[a.status || 'unknown'] || 0) + 1;
      parts.push(`\nTotal Applications: ${apps.length}`);
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }

    const { data: interviews } = await supabase
      .from('candidate_interviews')
      .select('status, scheduled_date')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date')
      .limit(5);
    
    if (interviews?.length) {
      parts.push('\n**Upcoming Interviews:**');
      for (const i of interviews) parts.push(`- ${i.scheduled_date} (${i.status})`);
    }
  } catch (e) {
    console.error('ATS context error:', e);
  }
  
  return parts.join('\n');
}

// 15. Invoice Context
async function fetchInvoiceContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 🧾 INVOICES & REVENUE'];
  
  try {
    const { data: invoices } = await supabase
      .from('institution_invoices')
      .select('status, total_amount, paid_amount, due_date');
    
    if (invoices?.length) {
      const byStatus: Record<string, number> = {};
      let totalRevenue = 0;
      let totalPending = 0;
      
      for (const inv of invoices) {
        byStatus[inv.status || 'unknown'] = (byStatus[inv.status || 'unknown'] || 0) + 1;
        if (inv.status === 'paid') totalRevenue += inv.total_amount || 0;
        else totalPending += (inv.total_amount || 0) - (inv.paid_amount || 0);
      }
      parts.push(`Total Invoices: ${invoices.length}`);
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push(`\n💵 Total Revenue (Paid): ₹${totalRevenue.toLocaleString()}`);
      parts.push(`📋 Pending Receivables: ₹${totalPending.toLocaleString()}`);
    } else {
      parts.push('No invoices found.');
    }
  } catch (e) {
    console.error('Invoice context error:', e);
  }
  
  return parts.join('\n');
}

// 16. CRM Context
async function fetchCRMContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 🤝 CRM & CONTRACTS'];
  
  try {
    const { data: contracts } = await supabase
      .from('crm_contracts')
      .select('status, contract_type, contract_value, institution_name, renewal_date, renewal_status');
    
    if (contracts?.length) {
      const byStatus: Record<string, number> = {};
      const byRenewal: Record<string, number> = {};
      let totalValue = 0;
      
      for (const c of contracts) {
        byStatus[c.status || 'unknown'] = (byStatus[c.status || 'unknown'] || 0) + 1;
        byRenewal[c.renewal_status || 'unknown'] = (byRenewal[c.renewal_status || 'unknown'] || 0) + 1;
        totalValue += c.contract_value || 0;
      }
      parts.push(`Total Contracts: ${contracts.length}`);
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      parts.push('**Renewal Status:**');
      for (const [r, c] of Object.entries(byRenewal)) parts.push(`- ${r}: ${c}`);
      parts.push(`\n💰 Total Contract Value: ₹${totalValue.toLocaleString()}`);
      
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
      const upcomingRenewals = contracts.filter(c => c.renewal_date && c.renewal_date >= today && c.renewal_date <= nextMonth);
      if (upcomingRenewals.length) {
        parts.push('\n⏰ **Renewals in Next 30 Days:**');
        for (const c of upcomingRenewals) parts.push(`- ${c.institution_name}: ${c.renewal_date}`);
      }
    } else {
      parts.push('No contracts found.');
    }

    const { count: commCount } = await supabase
      .from('communication_logs')
      .select('*', { count: 'exact', head: true });
    parts.push(`\n📞 Total Communication Logs: ${commCount || 0}`);
  } catch (e) {
    console.error('CRM context error:', e);
  }
  
  return parts.join('\n');
}

// 17. Newsletter Context
async function fetchNewsletterContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📰 NEWSLETTERS'];
  
  try {
    const { data: newsletters, count } = await supabase
      .from('newsletters')
      .select('id, title, status, download_count, published_at', { count: 'exact' });
    
    parts.push(`Total Newsletters: ${count || 0}`);
    
    if (newsletters?.length) {
      const published = newsletters.filter(n => n.status === 'published').length;
      const totalDownloads = newsletters.reduce((sum, n) => sum + (n.download_count || 0), 0);
      parts.push(`Published: ${published}`);
      parts.push(`Total Downloads: ${totalDownloads}`);
      
      const recent = newsletters.filter(n => n.published_at).slice(0, 3);
      if (recent.length) {
        parts.push('\n**Recent:**');
        for (const n of recent) parts.push(`- ${n.title} (${n.download_count || 0} downloads)`);
      }
    }
  } catch (e) {
    console.error('Newsletter context error:', e);
  }
  
  return parts.join('\n');
}

// 18. Performance/HR Ratings Context
async function fetchPerformanceContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## ⭐ PERFORMANCE RATINGS'];
  
  try {
    const { data: ratings, count } = await supabase
      .from('hr_ratings')
      .select('period, year, total_stars_quarter, trainer_name', { count: 'exact' });
    
    parts.push(`Total Rating Records: ${count || 0}`);
    
    if (ratings?.length) {
      const byYear: Record<number, number> = {};
      let totalStars = 0;
      for (const r of ratings) {
        byYear[r.year] = (byYear[r.year] || 0) + 1;
        totalStars += r.total_stars_quarter || 0;
      }
      parts.push('**By Year:**');
      for (const [y, c] of Object.entries(byYear)) parts.push(`- ${y}: ${c} records`);
      parts.push(`\nTotal Stars Awarded: ${totalStars}`);
    }

    const { data: appraisals } = await supabase
      .from('performance_appraisals')
      .select('status, rating');
    
    if (appraisals?.length) {
      const byStatus: Record<string, number> = {};
      for (const a of appraisals) byStatus[a.status || 'unknown'] = (byStatus[a.status || 'unknown'] || 0) + 1;
      parts.push(`\n**Appraisals:** ${appraisals.length}`);
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }
  } catch (e) {
    console.error('Performance context error:', e);
  }
  
  return parts.join('\n');
}

// 19. Survey Context
async function fetchSurveyContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📊 SURVEYS & FEEDBACK'];
  
  try {
    const { data: surveys, count } = await supabase
      .from('surveys')
      .select('id, title, status, created_at', { count: 'exact' });
    
    parts.push(`Total Surveys: ${count || 0}`);
    
    if (surveys?.length) {
      const byStatus: Record<string, number> = {};
      for (const s of surveys) byStatus[s.status || 'unknown'] = (byStatus[s.status || 'unknown'] || 0) + 1;
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }

    const { count: responseCount } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true });
    parts.push(`\nTotal Responses: ${responseCount || 0}`);

    const { data: feedback } = await supabase
      .from('student_feedback')
      .select('status, rating');
    
    if (feedback?.length) {
      const avgRating = feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length;
      parts.push(`\n**Student Feedback:** ${feedback.length} entries`);
      if (!isNaN(avgRating)) parts.push(`Average Rating: ${avgRating.toFixed(1)}/5`);
    }
  } catch (e) {
    console.error('Survey context error:', e);
  }
  
  return parts.join('\n');
}

// 20. Reports Context
async function fetchReportsContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📄 MONTHLY REPORTS'];
  
  try {
    const { data: reports, count } = await supabase
      .from('monthly_reports')
      .select('id, status, month, year, institution_id', { count: 'exact' });
    
    parts.push(`Total Reports: ${count || 0}`);
    
    if (reports?.length) {
      const byStatus: Record<string, number> = {};
      for (const r of reports) byStatus[r.status || 'unknown'] = (byStatus[r.status || 'unknown'] || 0) + 1;
      parts.push('**By Status:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }
  } catch (e) {
    console.error('Reports context error:', e);
  }
  
  return parts.join('\n');
}

// 21. Attendance Context
async function fetchAttendanceContext(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📅 ATTENDANCE'];
  
  try {
    const { data: sessions, count } = await supabase
      .from('class_session_attendance')
      .select('students_present, students_absent, students_late, date', { count: 'exact' });
    
    parts.push(`Total Attendance Records: ${count || 0}`);
    
    if (sessions?.length) {
      let totalPresent = 0, totalAbsent = 0, totalLate = 0;
      for (const s of sessions) {
        totalPresent += s.students_present || 0;
        totalAbsent += s.students_absent || 0;
        totalLate += s.students_late || 0;
      }
      const total = totalPresent + totalAbsent;
      const attendanceRate = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 'N/A';
      parts.push(`\n**Overall Stats:**`);
      parts.push(`- Present: ${totalPresent}`);
      parts.push(`- Absent: ${totalAbsent}`);
      parts.push(`- Late: ${totalLate}`);
      parts.push(`- Attendance Rate: ${attendanceRate}%`);
    }

    const { count: officerAttendance } = await supabase
      .from('officer_attendance')
      .select('*', { count: 'exact', head: true });
    parts.push(`\nOfficer Attendance Records: ${officerAttendance || 0}`);
  } catch (e) {
    console.error('Attendance context error:', e);
  }
  
  return parts.join('\n');
}

// ==================== NEW: PER-INSTITUTION PERFORMANCE METRICS (CEO) ====================

async function fetchPerInstitutionMetrics(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 📊 PER-INSTITUTION PERFORMANCE METRICS'];
  
  try {
    // Get institutions
    const { data: institutions } = await supabase
      .from('institutions')
      .select('id, name')
      .order('name');
    
    if (!institutions?.length) {
      parts.push('No institutions found.');
      return parts.join('\n');
    }

    // Get all assessment attempts
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('institution_id, passed, percentage');
    
    // Get all attendance records
    const { data: attendance } = await supabase
      .from('class_session_attendance')
      .select('institution_id, students_present, students_absent');
    
    // Get active students per institution
    const { data: students } = await supabase
      .from('students')
      .select('institution_id, status');
    
    // Get projects per institution
    const { data: projects } = await supabase
      .from('projects')
      .select('institution_id, status');
    
    // Get XP per institution
    const { data: xpData } = await supabase
      .from('student_xp_transactions')
      .select('institution_id, points_earned');

    // Get content completions
    const { data: completions } = await supabase
      .from('student_content_completions')
      .select('student_id');
    
    const { data: allContent } = await supabase
      .from('course_content')
      .select('id')
      .limit(1000);

    const totalContentCount = allContent?.length || 0;
    const totalCompletions = completions?.length || 0;

    // Build metrics per institution
    const atRisk: string[] = [];

    for (const inst of institutions) {
      const instAttempts = (attempts || []).filter(a => a.institution_id === inst.id);
      const instAttendance = (attendance || []).filter(a => a.institution_id === inst.id);
      const instStudents = (students || []).filter(s => s.institution_id === inst.id);
      const instProjects = (projects || []).filter(p => p.institution_id === inst.id);
      const instXP = (xpData || []).filter(x => x.institution_id === inst.id);

      const activeStudents = instStudents.filter(s => s.status === 'active' || !s.status).length;
      
      // Assessment metrics
      let passRate = 'N/A';
      let avgScore = 'N/A';
      if (instAttempts.length > 0) {
        const passed = instAttempts.filter(a => a.passed).length;
        passRate = ((passed / instAttempts.length) * 100).toFixed(1) + '%';
        avgScore = (instAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / instAttempts.length).toFixed(1) + '%';
      }

      // Attendance metrics
      let attendanceRate = 'N/A';
      let attendanceRateNum = 0;
      if (instAttendance.length > 0) {
        const totalPresent = instAttendance.reduce((s, a) => s + (a.students_present || 0), 0);
        const totalAll = totalPresent + instAttendance.reduce((s, a) => s + (a.students_absent || 0), 0);
        if (totalAll > 0) {
          attendanceRateNum = (totalPresent / totalAll) * 100;
          attendanceRate = attendanceRateNum.toFixed(1) + '%';
        }
      }

      // Projects
      const inProgressProjects = instProjects.filter(p => ['ongoing', 'in_progress', 'draft', 'pending_review'].includes(p.status || '')).length;
      const completedProjects = instProjects.filter(p => ['completed', 'evaluated', 'submitted'].includes(p.status || '')).length;

      // XP
      const totalXP = instXP.reduce((s, x) => s + (x.points_earned || 0), 0);

      parts.push(`\n### ${inst.name}`);
      parts.push(`- Active Students: ${activeStudents}`);
      parts.push(`- Assessment Pass Rate: ${passRate} (${instAttempts.length} attempts)`);
      parts.push(`- Average Assessment Score: ${avgScore}`);
      parts.push(`- Attendance Rate: ${attendanceRate} (${instAttendance.length} sessions)`);
      parts.push(`- Projects: ${inProgressProjects} in-progress, ${completedProjects} completed`);
      parts.push(`- Total XP Earned: ${totalXP.toLocaleString()}`);

      // Check at-risk
      const passRateNum = instAttempts.length > 0 ? (instAttempts.filter(a => a.passed).length / instAttempts.length) * 100 : 100;
      if ((instAttempts.length > 0 && passRateNum < 50) || (instAttendance.length > 0 && attendanceRateNum < 70)) {
        const reasons: string[] = [];
        if (instAttempts.length > 0 && passRateNum < 50) reasons.push(`low pass rate (${passRateNum.toFixed(1)}%)`);
        if (instAttendance.length > 0 && attendanceRateNum < 70) reasons.push(`low attendance (${attendanceRateNum.toFixed(1)}%)`);
        atRisk.push(`- **${inst.name}**: ${reasons.join(', ')}`);
      }
    }

    // Global content completion
    if (totalContentCount > 0) {
      parts.push(`\n**Overall Content Completion:** ${totalCompletions} completions across ${totalContentCount} content items`);
    }

    // At-Risk section
    if (atRisk.length > 0) {
      parts.push('\n### ⚠️ AT-RISK INSTITUTIONS');
      parts.push('Institutions with pass rate below 50% or attendance below 70%:');
      parts.push(...atRisk);
    } else {
      parts.push('\n✅ No at-risk institutions detected.');
    }

  } catch (e) {
    console.error('Per-institution metrics error:', e);
    parts.push('Error fetching per-institution metrics.');
  }
  
  return parts.join('\n');
}

// ==================== NEW: TRAINER PERFORMANCE (CEO) ====================

async function fetchTrainerPerformance(): Promise<string> {
  const supabase = getSupabaseClient();
  const parts: string[] = ['## 👨‍🏫 TRAINER/OFFICER PERFORMANCE'];
  
  try {
    // Get officers with their assignments
    const { data: officers } = await supabase
      .from('officers')
      .select('id, name, user_id, status, assigned_institutions');
    
    if (!officers?.length) {
      parts.push('No officers found.');
      return parts.join('\n');
    }

    // Get all assessment attempts for computing per-officer metrics
    const { data: attempts } = await supabase
      .from('assessment_attempts')
      .select('institution_id, passed, percentage');

    // Get attendance data
    const { data: attendance } = await supabase
      .from('class_session_attendance')
      .select('institution_id, officer_id, students_present, students_absent');

    const trainerStats: { name: string; institution: string; passRate: number; avgScore: number; attendanceRate: number; attempts: number }[] = [];

    for (const officer of officers) {
      if (officer.status !== 'active') continue;
      
      const assignedInsts = officer.assigned_institutions as string[] | null;
      if (!assignedInsts?.length) continue;

      for (const instId of assignedInsts) {
        const instAttempts = (attempts || []).filter(a => a.institution_id === instId);
        const instAttendance = (attendance || []).filter(a => a.institution_id === instId);

        let passRate = 0;
        let avgScore = 0;
        if (instAttempts.length > 0) {
          passRate = (instAttempts.filter(a => a.passed).length / instAttempts.length) * 100;
          avgScore = instAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / instAttempts.length;
        }

        let attendanceRate = 0;
        if (instAttendance.length > 0) {
          const totalPresent = instAttendance.reduce((s, a) => s + (a.students_present || 0), 0);
          const totalAll = totalPresent + instAttendance.reduce((s, a) => s + (a.students_absent || 0), 0);
          if (totalAll > 0) attendanceRate = (totalPresent / totalAll) * 100;
        }

        trainerStats.push({
          name: officer.name || 'Unknown',
          institution: instId,
          passRate,
          avgScore,
          attendanceRate,
          attempts: instAttempts.length
        });
      }
    }

    if (trainerStats.length > 0) {
      // Sort by avg score descending
      trainerStats.sort((a, b) => b.avgScore - a.avgScore);
      
      parts.push(`\nTrainers with data: ${trainerStats.length}`);
      
      // Top performers
      const topPerformers = trainerStats.filter(t => t.attempts > 0).slice(0, 5);
      if (topPerformers.length) {
        parts.push('\n**Top Performing Trainers (by student avg score):**');
        for (const t of topPerformers) {
          parts.push(`- **${t.name}**: ${t.avgScore.toFixed(1)}% avg score, ${t.passRate.toFixed(1)}% pass rate, ${t.attendanceRate.toFixed(1)}% attendance (${t.attempts} attempts)`);
        }
      }

      // Bottom performers
      const bottomPerformers = trainerStats.filter(t => t.attempts > 0).slice(-3).reverse();
      if (bottomPerformers.length && trainerStats.filter(t => t.attempts > 0).length > 3) {
        parts.push('\n**Needs Attention (lowest student avg score):**');
        for (const t of bottomPerformers) {
          parts.push(`- **${t.name}**: ${t.avgScore.toFixed(1)}% avg score, ${t.passRate.toFixed(1)}% pass rate (${t.attempts} attempts)`);
        }
      }
    } else {
      parts.push('No trainer performance data available yet.');
    }
  } catch (e) {
    console.error('Trainer performance error:', e);
    parts.push('Error fetching trainer performance data.');
  }
  
  return parts.join('\n');
}

// ==================== MAIN CONTEXT BUILDER ====================

async function fetchSystemAdminContext(): Promise<{ context: string; sources: string[] }> {
  const sources: string[] = [];
  
  try {
    const [
      institutionCtx,
      studentCtx,
      officerCtx,
      courseCtx,
      assessmentCtx,
      assignmentCtx,
      eventsCtx,
      projectsCtx,
      inventoryCtx,
      payrollCtx,
      leaveCtx,
      taskCtx,
      gamificationCtx,
      atsCtx,
      invoiceCtx,
      crmCtx,
      newsletterCtx,
      performanceCtx,
      surveyCtx,
      reportsCtx,
      attendanceCtx,
      perInstitutionMetricsCtx,
      trainerPerformanceCtx
    ] = await Promise.all([
      fetchInstitutionContext(),
      fetchStudentProfileContext(),
      fetchOfficerContextData(),
      fetchCourseContext(),
      fetchAssessmentContext(),
      fetchAssignmentContext(),
      fetchEventsContext(),
      fetchProjectsContext(),
      fetchInventoryContext(),
      fetchPayrollContext(),
      fetchLeaveContext(),
      fetchTaskContext(),
      fetchGamificationContext(),
      fetchATSContext(),
      fetchInvoiceContext(),
      fetchCRMContext(),
      fetchNewsletterContext(),
      fetchPerformanceContext(),
      fetchSurveyContext(),
      fetchReportsContext(),
      fetchAttendanceContext(),
      fetchPerInstitutionMetrics(),
      fetchTrainerPerformance()
    ]);

    sources.push(
      'institutions', 'students', 'officers', 'courses', 'assessments', 
      'assignments', 'events', 'projects', 'inventory', 'payroll', 
      'leave', 'tasks', 'gamification', 'ats', 'invoices', 
      'crm', 'newsletters', 'performance', 'surveys', 'reports', 'attendance',
      'per_institution_metrics', 'trainer_performance'
    );

    const fullContext = [
      institutionCtx,
      studentCtx,
      officerCtx,
      courseCtx,
      assessmentCtx,
      assignmentCtx,
      eventsCtx,
      projectsCtx,
      inventoryCtx,
      payrollCtx,
      leaveCtx,
      taskCtx,
      gamificationCtx,
      atsCtx,
      invoiceCtx,
      crmCtx,
      newsletterCtx,
      performanceCtx,
      surveyCtx,
      reportsCtx,
      attendanceCtx,
      perInstitutionMetricsCtx,
      trainerPerformanceCtx
    ].join('\n\n');

    return { context: fullContext, sources };
  } catch (error) {
    console.error('Error building system admin context:', error);
    return { context: 'Error fetching data. Please try again.', sources: [] };
  }
}

// Officer comprehensive context (SCOPED to their institution)
async function fetchOfficerContext(institutionId?: string): Promise<{ context: string; sources: string[] }> {
  const supabase = getSupabaseClient();
  const parts: string[] = [];
  const sources: string[] = [];
  
  try {
    // Classes (scoped)
    let classesQuery = supabase.from('classes').select('id, class_name, status, capacity, academic_year');
    if (institutionId) classesQuery = classesQuery.eq('institution_id', institutionId);
    const { data: classes } = await classesQuery;
    
    parts.push('## 📚 CLASSES');
    parts.push(`Total Classes: ${classes?.length || 0}`);
    if (classes?.length) {
      for (const c of classes.slice(0, 10)) {
        parts.push(`- ${c.class_name} (${c.status || 'active'}) - Capacity: ${c.capacity || 'N/A'}`);
      }
    }
    sources.push('classes');

    // Assessments (scoped)
    let assessmentsQuery = supabase.from('assessments').select('id, title, status, start_time, end_time');
    if (institutionId) assessmentsQuery = assessmentsQuery.eq('institution_id', institutionId);
    const { data: assessments } = await assessmentsQuery;
    
    parts.push('\n## 📝 ASSESSMENTS');
    parts.push(`Total Assessments: ${assessments?.length || 0}`);
    if (assessments?.length) {
      const byStatus: Record<string, number> = {};
      for (const a of assessments) byStatus[a.status || 'unknown'] = (byStatus[a.status || 'unknown'] || 0) + 1;
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }
    sources.push('assessments');

    // Per-class assessment pass rates (scoped)
    let attemptsQuery = supabase.from('assessment_attempts').select('class_id, passed, percentage, student_id');
    if (institutionId) attemptsQuery = attemptsQuery.eq('institution_id', institutionId);
    const { data: attempts } = await attemptsQuery;
    
    if (attempts?.length && classes?.length) {
      parts.push('\n**Per-Class Assessment Pass Rates:**');
      const classMap = new Map(classes.map(c => [c.id, c.class_name]));
      const classStats: Record<string, { total: number; passed: number; sumPct: number }> = {};
      for (const a of attempts) {
        if (!classStats[a.class_id]) classStats[a.class_id] = { total: 0, passed: 0, sumPct: 0 };
        classStats[a.class_id].total++;
        if (a.passed) classStats[a.class_id].passed++;
        classStats[a.class_id].sumPct += a.percentage || 0;
      }
      for (const [classId, stats] of Object.entries(classStats)) {
        const name = classMap.get(classId) || classId;
        const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
        const avgScore = (stats.sumPct / stats.total).toFixed(1);
        parts.push(`- ${name}: ${passRate}% pass rate, ${avgScore}% avg score (${stats.total} attempts)`);
      }

      // Student-wise performance with names
      const studentIds = [...new Set(attempts.map(a => a.student_id))];
      let studentNameMap = new Map<string, string>();
      if (studentIds.length > 0) {
        const { data: studentProfiles } = await supabase
          .from('students')
          .select('user_id, student_name')
          .in('user_id', studentIds.slice(0, 100));
        if (studentProfiles?.length) {
          for (const s of studentProfiles) {
            if (s.user_id) studentNameMap.set(s.user_id, s.student_name || 'Unknown');
          }
        }
      }

      const studentStats: Record<string, { total: number; passed: number; sumPct: number }> = {};
      for (const a of attempts) {
        if (!studentStats[a.student_id]) studentStats[a.student_id] = { total: 0, passed: 0, sumPct: 0 };
        studentStats[a.student_id].total++;
        if (a.passed) studentStats[a.student_id].passed++;
        studentStats[a.student_id].sumPct += a.percentage || 0;
      }
      const studentList = Object.entries(studentStats).map(([id, s]) => ({
        id, name: studentNameMap.get(id) || id.slice(0, 8), avg: s.sumPct / s.total, passRate: (s.passed / s.total) * 100, total: s.total
      })).sort((a, b) => b.avg - a.avg);
      
      if (studentList.length > 0) {
        parts.push(`\n**Student Performance Summary:** ${studentList.length} students assessed`);
        parts.push('**Top performers:**');
        for (const s of studentList.slice(0, 5)) {
          parts.push(`- ${s.name}: ${s.avg.toFixed(1)}% avg, ${s.passRate.toFixed(0)}% pass rate (${s.total} attempts)`);
        }
        const bottom = studentList.filter(s => s.avg < 50);
        if (bottom.length) {
          parts.push('**Needs attention (<50% avg):**');
          for (const s of bottom.slice(0, 5)) {
            parts.push(`- ${s.name}: ${s.avg.toFixed(1)}% avg, ${s.passRate.toFixed(0)}% pass rate`);
          }
        }
      }
    }

    // Assignments (scoped)
    let assignmentsQuery = supabase.from('assignments').select('id, title, status, submission_end_date');
    if (institutionId) assignmentsQuery = assignmentsQuery.eq('institution_id', institutionId);
    const { data: assignments } = await assignmentsQuery;
    
    parts.push('\n## 📋 ASSIGNMENTS');
    parts.push(`Total Assignments: ${assignments?.length || 0}`);
    if (assignments?.length) {
      const pending = assignments.filter(a => a.status === 'active' || a.status === 'published');
      parts.push(`Active/Published: ${pending.length}`);
    }
    
    let submissionsQuery = supabase.from('assignment_submissions').select('status, marks_obtained');
    if (institutionId) submissionsQuery = submissionsQuery.eq('institution_id', institutionId);
    const { data: submissions } = await submissionsQuery;
    
    if (submissions?.length) {
      const byStatus: Record<string, number> = {};
      for (const s of submissions) byStatus[s.status || 'unknown'] = (byStatus[s.status || 'unknown'] || 0) + 1;
      parts.push('**Submission Stats:**');
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }
    sources.push('assignments');

    // Attendance (scoped)
    let attendanceQuery = supabase.from('class_session_attendance').select('students_present, students_absent, date');
    if (institutionId) attendanceQuery = attendanceQuery.eq('institution_id', institutionId);
    const { data: attendanceData } = await attendanceQuery.limit(200);
    
    parts.push('\n## 📅 ATTENDANCE');
    if (attendanceData?.length) {
      const totalPresent = attendanceData.reduce((sum, a) => sum + (a.students_present || 0), 0);
      const totalAbsent = attendanceData.reduce((sum, a) => sum + (a.students_absent || 0), 0);
      const rate = totalPresent + totalAbsent > 0 ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1) : 'N/A';
      parts.push(`Records: ${attendanceData.length}, Attendance Rate: ${rate}%`);
    } else {
      parts.push('No attendance records yet.');
    }
    sources.push('attendance');

    // Projects (scoped)
    let projectsQuery = supabase.from('projects').select('id, title, status');
    if (institutionId) projectsQuery = projectsQuery.eq('institution_id', institutionId);
    const { data: projects } = await projectsQuery;
    
    parts.push('\n## 🚀 PROJECTS');
    parts.push(`Total Projects: ${projects?.length || 0}`);
    if (projects?.length) {
      const byStatus: Record<string, number> = {};
      for (const p of projects) byStatus[p.status || 'unknown'] = (byStatus[p.status || 'unknown'] || 0) + 1;
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }
    sources.push('projects');

    // Leave status
    const { data: leaves } = await supabase.from('leave_applications').select('status, leave_type').limit(50);
    parts.push('\n## 🏖️ LEAVE APPLICATIONS');
    if (leaves?.length) {
      const byStatus: Record<string, number> = {};
      for (const l of leaves) byStatus[l.status || 'unknown'] = (byStatus[l.status || 'unknown'] || 0) + 1;
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    } else {
      parts.push('No leave applications found.');
    }
    sources.push('leave');

  } catch (e) {
    console.error('Officer context error:', e);
  }
  
  return { context: parts.join('\n'), sources };
}

// Management comprehensive context (institution-scoped)
async function fetchManagementContext(institutionId?: string): Promise<{ context: string; sources: string[] }> {
  const supabase = getSupabaseClient();
  const parts: string[] = [];
  const sources: string[] = [];
  
  try {
    // Students in institution
    let studentsQuery = supabase.from('students').select('id, student_name, status, class_id, user_id, institution_id');
    if (institutionId) studentsQuery = studentsQuery.eq('institution_id', institutionId);
    const { data: students } = await studentsQuery;
    
    parts.push('## 👥 STUDENTS');
    parts.push(`Total Students: ${students?.length || 0}`);
    if (students?.length) {
      const byStatus: Record<string, number> = {};
      for (const s of students) byStatus[s.status || 'active'] = (byStatus[s.status || 'active'] || 0) + 1;
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
    }
    sources.push('students');

    // Classes
    let classesQuery = supabase.from('classes').select('id, class_name, status, capacity');
    if (institutionId) classesQuery = classesQuery.eq('institution_id', institutionId);
    const { data: classes } = await classesQuery;
    
    parts.push('\n## 📚 CLASSES');
    parts.push(`Total Classes: ${classes?.length || 0}`);
    if (classes?.length) {
      for (const c of classes) parts.push(`- ${c.class_name} (${c.status || 'active'})`);
    }
    sources.push('classes');

    // Assessment attempts (institution-scoped)
    let attemptsQuery = supabase.from('assessment_attempts').select('id, passed, percentage, score, total_points, class_id, student_id, assessment_id, assessments(title)');
    if (institutionId) attemptsQuery = attemptsQuery.eq('institution_id', institutionId);
    const { data: attempts } = await attemptsQuery;
    
    parts.push('\n## 📝 ASSESSMENT INSIGHTS');
    if (attempts?.length) {
      const passed = attempts.filter(a => a.passed).length;
      const avgScore = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length;
      parts.push(`Total Attempts: ${attempts.length}`);
      parts.push(`Pass Rate: ${((passed / attempts.length) * 100).toFixed(1)}%`);
      parts.push(`Average Score: ${avgScore.toFixed(1)}%`);
      
      // Per-class breakdown
      if (classes?.length) {
        const classMap = new Map(classes.map(c => [c.id, c.class_name]));
        const classStats: Record<string, { total: number; passed: number; sumPct: number }> = {};
        for (const a of attempts) {
          if (!classStats[a.class_id]) classStats[a.class_id] = { total: 0, passed: 0, sumPct: 0 };
          classStats[a.class_id].total++;
          if (a.passed) classStats[a.class_id].passed++;
          classStats[a.class_id].sumPct += a.percentage || 0;
        }
        parts.push('\n**Per-Class Breakdown:**');
        for (const [classId, stats] of Object.entries(classStats)) {
          const name = classMap.get(classId) || classId;
          parts.push(`- ${name}: ${((stats.passed / stats.total) * 100).toFixed(1)}% pass, ${(stats.sumPct / stats.total).toFixed(1)}% avg (${stats.total} attempts)`);
        }
      }

      // Student-wise performance WITH NAMES
      const studentIds = [...new Set(attempts.map(a => a.student_id))];
      let studentNameMap = new Map<string, string>();
      if (studentIds.length > 0 && students?.length) {
        for (const s of students) {
          if (s.user_id) studentNameMap.set(s.user_id, s.student_name || 'Unknown');
        }
      }

      const studentStats: Record<string, { total: number; passed: number; sumPct: number }> = {};
      for (const a of attempts) {
        if (!studentStats[a.student_id]) studentStats[a.student_id] = { total: 0, passed: 0, sumPct: 0 };
        studentStats[a.student_id].total++;
        if (a.passed) studentStats[a.student_id].passed++;
        studentStats[a.student_id].sumPct += a.percentage || 0;
      }
      const studentList = Object.entries(studentStats).map(([id, s]) => ({
        id, name: studentNameMap.get(id) || id.slice(0, 8), avg: s.sumPct / s.total, passRate: (s.passed / s.total) * 100, total: s.total
      })).sort((a, b) => b.avg - a.avg);

      if (studentList.length > 0) {
        parts.push(`\n**Student-Wise Performance:** ${studentList.length} students`);
        parts.push('Top performers:');
        for (const s of studentList.slice(0, 5)) {
          parts.push(`- **${s.name}**: ${s.avg.toFixed(1)}% avg, ${s.passRate.toFixed(0)}% pass rate (${s.total} attempts)`);
        }
        const atRisk = studentList.filter(s => s.avg < 50);
        if (atRisk.length) {
          parts.push('At-risk students (<50% avg):');
          for (const s of atRisk.slice(0, 5)) {
            parts.push(`- **${s.name}**: ${s.avg.toFixed(1)}% avg, ${s.passRate.toFixed(0)}% pass rate`);
          }
        }
      }
    } else {
      parts.push('No assessment data yet.');
    }
    sources.push('assessment_attempts');

    // Assignment submissions
    let submissionsQuery = supabase.from('assignment_submissions').select('id, status, marks_obtained, student_id');
    if (institutionId) submissionsQuery = submissionsQuery.eq('institution_id', institutionId);
    const { data: submissions } = await submissionsQuery;
    
    parts.push('\n## 📋 ASSIGNMENT SUBMISSIONS');
    if (submissions?.length) {
      const byStatus: Record<string, number> = {};
      let totalMarks = 0; let gradedCount = 0;
      for (const s of submissions) {
        byStatus[s.status || 'unknown'] = (byStatus[s.status || 'unknown'] || 0) + 1;
        if (s.marks_obtained != null) { totalMarks += s.marks_obtained; gradedCount++; }
      }
      parts.push(`Total Submissions: ${submissions.length}`);
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      if (gradedCount > 0) parts.push(`Average Marks (graded): ${(totalMarks / gradedCount).toFixed(1)}`);
    } else {
      parts.push('No submissions yet.');
    }
    sources.push('assignment_submissions');

    // Projects
    let projectsQuery = supabase.from('projects').select('id, title, status, sdg_goals');
    if (institutionId) projectsQuery = projectsQuery.eq('institution_id', institutionId);
    const { data: projects } = await projectsQuery;
    
    parts.push('\n## 🚀 INNOVATION PROJECTS');
    if (projects?.length) {
      const byStatus: Record<string, number> = {};
      for (const p of projects) byStatus[p.status || 'unknown'] = (byStatus[p.status || 'unknown'] || 0) + 1;
      parts.push(`Total Projects: ${projects.length}`);
      for (const [s, c] of Object.entries(byStatus)) parts.push(`- ${s}: ${c}`);
      
      parts.push('\n**Projects:**');
      for (const p of projects.slice(0, 15)) {
        const sdg = p.sdg_goals && Array.isArray(p.sdg_goals) ? ` [SDG: ${p.sdg_goals.join(',')}]` : '';
        parts.push(`- ${p.title} (${p.status})${sdg}`);
      }
    } else {
      parts.push('No projects found.');
    }
    
    const projectIds = projects?.map(p => p.id) || [];
    if (projectIds.length) {
      const { data: achievements } = await supabase
        .from('project_achievements')
        .select('id, title, achievement_type, project_id')
        .in('project_id', projectIds);
      if (achievements?.length) {
        parts.push(`\n**Project Awards/Achievements:** ${achievements.length}`);
        for (const a of achievements.slice(0, 10)) parts.push(`- ${a.title} (${a.achievement_type})`);
      }
    }
    sources.push('projects');

    // Attendance
    let attendanceQuery = supabase.from('class_session_attendance').select('students_present, students_absent, students_late, date, class_id');
    if (institutionId) attendanceQuery = attendanceQuery.eq('institution_id', institutionId);
    const { data: attendance } = await attendanceQuery.limit(200);
    
    parts.push('\n## 📅 ATTENDANCE');
    if (attendance?.length) {
      let totalPresent = 0, totalAbsent = 0, totalLate = 0;
      for (const a of attendance) {
        totalPresent += a.students_present || 0;
        totalAbsent += a.students_absent || 0;
        totalLate += a.students_late || 0;
      }
      const total = totalPresent + totalAbsent;
      const rate = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 'N/A';
      parts.push(`Records: ${attendance.length}, Present: ${totalPresent}, Absent: ${totalAbsent}, Late: ${totalLate}`);
      parts.push(`Overall Attendance Rate: ${rate}%`);
    } else {
      parts.push('No attendance records yet.');
    }
    sources.push('attendance');

    // Course progress + content completion
    let courseAssignmentsQuery = supabase.from('course_class_assignments').select('id, course_id, class_id, courses(title)');
    if (institutionId) courseAssignmentsQuery = courseAssignmentsQuery.eq('institution_id', institutionId);
    const { data: courseAssignments } = await courseAssignmentsQuery;
    
    parts.push('\n## 📖 COURSE PROGRESS');
    if (courseAssignments?.length) {
      parts.push(`Courses Assigned: ${courseAssignments.length}`);
      for (const ca of courseAssignments.slice(0, 10)) {
        const course = ca.courses as any;
        parts.push(`- ${course?.title || 'Unknown Course'}`);
      }

      // Content completion rate
      const courseIds = [...new Set(courseAssignments.map(ca => ca.course_id))];
      if (courseIds.length > 0) {
        const { data: allContent } = await supabase
          .from('course_content')
          .select('id')
          .in('course_id', courseIds);
        
        const studentUserIds = (students || []).filter(s => s.user_id).map(s => s.user_id!);
        
        if (allContent?.length && studentUserIds.length > 0) {
          const { data: completions } = await supabase
            .from('student_content_completions')
            .select('student_id, content_id')
            .in('student_id', studentUserIds.slice(0, 100));
          
          const totalPossible = allContent.length * studentUserIds.length;
          const totalCompleted = completions?.length || 0;
          const completionRate = totalPossible > 0 ? ((totalCompleted / totalPossible) * 100).toFixed(1) : 'N/A';
          
          parts.push(`\n**Content Completion Rate:** ${completionRate}% (${totalCompleted} of ${totalPossible} possible completions)`);
          parts.push(`Total Content Items: ${allContent.length}, Students: ${studentUserIds.length}`);
        }
      }
    } else {
      parts.push('No courses assigned yet.');
    }
    sources.push('course_assignments', 'content_completion');

  } catch (e) {
    console.error('Management context error:', e);
  }
  
  return { context: parts.join('\n'), sources };
}

// Student comprehensive context with STEM learning support
async function fetchStudentContext(userId?: string): Promise<{ context: string; sources: string[] }> {
  const supabase = getSupabaseClient();
  const parts: string[] = [];
  const sources: string[] = [];
  let institutionId: string | undefined;
  let classId: string | undefined;
  
  try {
    // ==================== CLASS RANKING & PROFILE ====================
    if (userId) {
      const { data: profile } = await supabase.from('profiles').select('institution_id, class_id').eq('id', userId).single();
      institutionId = profile?.institution_id;
      classId = profile?.class_id;
      
      if (classId && institutionId) {
        // Get all students in the same class
        const { data: classmates } = await supabase.from('students').select('id, user_id, student_name').eq('class_id', classId).eq('institution_id', institutionId);
        const classmateUserIds = (classmates || []).filter(s => s.user_id).map(s => s.user_id!);
        
        if (classmateUserIds.length > 1) {
          // Get assessment scores for all classmates
          const { data: classAttempts } = await supabase.from('assessment_attempts').select('student_id, percentage').in('student_id', classmateUserIds).in('status', ['submitted', 'auto_submitted']);
          // Get assignment scores
          const { data: classSubs } = await supabase.from('assignment_submissions').select('student_id, marks_obtained').eq('status', 'graded').in('student_id', classmateUserIds);
          // Get assignment total marks for normalization
          const { data: assignmentsList } = await supabase.from('assignments').select('id, total_marks').eq('institution_id', institutionId);
          // Get project counts
          const { data: classProjectMembers } = await supabase.from('project_members').select('student_id').in('student_id', (classmates || []).map(s => s.id));
          // Get XP
          const { data: classXP } = await supabase.from('student_xp_transactions').select('student_id, points_earned').in('student_id', classmateUserIds);
          
          // Build student name map
          const nameMap = new Map<string, string>();
          for (const s of (classmates || [])) { if (s.user_id) nameMap.set(s.user_id, s.student_name || 'Unknown'); }
          // Student id (from students table) to user_id map
          const studentIdToUserId = new Map<string, string>();
          for (const s of (classmates || [])) { if (s.user_id) studentIdToUserId.set(s.id, s.user_id); }
          
          // Compute weighted score per classmate
          const scores: { userId: string; name: string; total: number; assessAvg: number; assignAvg: number; projCount: number; xpTotal: number }[] = [];
          
          for (const uid of classmateUserIds) {
            const myAttempts = (classAttempts || []).filter(a => a.student_id === uid);
            const assessAvg = myAttempts.length > 0 ? myAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / myAttempts.length : 0;
            
            const mySubs = (classSubs || []).filter(s => s.student_id === uid);
            let assignAvg = 0;
            if (mySubs.length > 0) {
              const marksTotal = mySubs.reduce((s, sub) => s + (sub.marks_obtained || 0), 0);
              assignAvg = (marksTotal / mySubs.length); // raw marks avg, normalize later
            }
            
            const studentTableId = (classmates || []).find(s => s.user_id === uid)?.id;
            const projCount = studentTableId ? (classProjectMembers || []).filter(p => p.student_id === studentTableId).length : 0;
            const xpTotal = (classXP || []).filter(x => x.student_id === uid).reduce((s, x) => s + (x.points_earned || 0), 0);
            
            const projScore = Math.min(projCount * 20, 100);
            const xpScore = Math.min(xpTotal / 10, 100);
            const total = assessAvg * 0.5 + assignAvg * 0.2 + projScore * 0.2 + xpScore * 0.1;
            
            scores.push({ userId: uid, name: nameMap.get(uid) || 'Unknown', total, assessAvg, assignAvg, projCount, xpTotal });
          }
          
          scores.sort((a, b) => b.total - a.total);
          const myRank = scores.findIndex(s => s.userId === userId) + 1;
          const myScore = scores.find(s => s.userId === userId);
          
          parts.push('## 🏅 YOUR CLASS RANKING');
          parts.push(`**Rank: ${myRank} out of ${scores.length} students**`);
          if (myScore) {
            parts.push(`Weighted Score: ${myScore.total.toFixed(1)}`);
            parts.push(`Assessment Avg: ${myScore.assessAvg.toFixed(1)}% | Assignment Avg: ${myScore.assignAvg.toFixed(1)} | Projects: ${myScore.projCount} | XP: ${myScore.xpTotal}`);
          }
          
          // Show top 5 for context
          parts.push('\n**Class Top 5:**');
          for (const s of scores.slice(0, 5)) {
            const marker = s.userId === userId ? ' ⬅️ (You)' : '';
            parts.push(`${scores.indexOf(s) + 1}. ${s.name}: ${s.total.toFixed(1)} pts (Assess: ${s.assessAvg.toFixed(0)}%, Projects: ${s.projCount}, XP: ${s.xpTotal})${marker}`);
          }
          if (myRank > 5) {
            parts.push(`...\n${myRank}. ${myScore?.name}: ${myScore?.total.toFixed(1)} pts ⬅️ (You)`);
          }
          sources.push('class_ranking');
        }
      }
      
      // ==================== PROJECT INVOLVEMENT & RECOGNITION ====================
      const { data: myStudentRecord } = await supabase.from('students').select('id').eq('user_id', userId).single();
      if (myStudentRecord) {
        const { data: myMemberships } = await supabase.from('project_members').select('project_id, role').eq('student_id', myStudentRecord.id);
        
        if (myMemberships?.length) {
          const projectIds = myMemberships.map(m => m.project_id);
          const { data: myProjects } = await supabase.from('projects').select('id, title, status, sdg_goals, category').in('id', projectIds);
          const { data: myAchievements } = await supabase.from('project_achievements').select('id, title, achievement_type, project_id').in('project_id', projectIds);
          
          parts.push('\n## 🚀 YOUR PROJECTS & RECOGNITION');
          parts.push(`Total Projects: ${myProjects?.length || 0}`);
          
          if (myProjects?.length) {
            for (const p of myProjects) {
              const sdg = p.sdg_goals && Array.isArray(p.sdg_goals) ? ` [SDG: ${(p.sdg_goals as string[]).join(', ')}]` : '';
              const cat = p.category ? ` (${p.category})` : '';
              parts.push(`- **${p.title}** — ${p.status}${cat}${sdg}`);
              
              const projAchievements = (myAchievements || []).filter(a => a.project_id === p.id);
              for (const a of projAchievements) {
                parts.push(`  🏆 ${a.title} (${a.achievement_type})`);
              }
            }
          }
          
          if (myAchievements?.length) {
            parts.push(`\n**Total Awards/Achievements: ${myAchievements.length}** across ${myProjects?.length || 0} projects`);
            const byType: Record<string, number> = {};
            for (const a of myAchievements) byType[a.achievement_type || 'other'] = (byType[a.achievement_type || 'other'] || 0) + 1;
            for (const [t, c] of Object.entries(byType)) parts.push(`- ${t}: ${c}`);
          }
          sources.push('projects', 'project_achievements');
        }
      }
    }

    // ==================== COURSE CONTENT FOR STEM LEARNING (SCOPED TO CLASS) ====================
    // Get only courses assigned to the student's class
    let assignedCourseIds: string[] = [];
    if (classId && institutionId) {
      const { data: classAssignments } = await supabase
        .from('course_class_assignments')
        .select('course_id')
        .eq('class_id', classId)
        .eq('institution_id', institutionId);
      assignedCourseIds = (classAssignments || []).map(a => a.course_id);
    }

    let courses: any[] = [];
    if (assignedCourseIds.length > 0) {
      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          id, title, description, category, difficulty, prerequisites, learning_outcomes,
          course_modules (
            id, title, description, display_order,
            course_sessions (
              id, title, description, learning_objectives, duration_minutes, display_order
            )
          )
        `)
        .in('id', assignedCourseIds)
        .in('status', ['published', 'active'])
        .order('title')
        .limit(15);
      courses = courseData || [];
    }
    
    parts.push('## 📚 YOUR ASSIGNED COURSES');
    parts.push(`Courses Assigned to Your Class: ${courses.length}\n`);
    
    if (courses.length) {
      for (const course of courses) {
        parts.push(`### 🎓 ${course.title} (${course.difficulty || 'Beginner'})`);
        parts.push(`Category: ${course.category || 'STEM'}`);
        if (course.description) parts.push(`Overview: ${course.description}`);
        if (course.prerequisites) parts.push(`Prerequisites: ${course.prerequisites}`);
        if (course.learning_outcomes && Array.isArray(course.learning_outcomes)) {
          parts.push('Learning Outcomes:');
          for (const lo of course.learning_outcomes as string[]) parts.push(`  - ${lo}`);
        }
        
        const modules = (course.course_modules as any[]) || [];
        if (modules.length) {
          modules.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
          for (const mod of modules) {
            parts.push(`\n**Module: ${mod.title}**`);
            if (mod.description) parts.push(`  ${mod.description}`);
            
            const sessions = (mod.course_sessions as any[]) || [];
            if (sessions.length) {
              sessions.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
              for (const sess of sessions) {
                parts.push(`  📖 Session: ${sess.title} (${sess.duration_minutes || '?'} min)`);
                if (sess.description) parts.push(`     ${sess.description}`);
                if (sess.learning_objectives && Array.isArray(sess.learning_objectives)) {
                  for (const obj of sess.learning_objectives as string[]) parts.push(`     • ${obj}`);
                }
              }
            }
          }
        }
        parts.push('');
      }
    } else {
      parts.push('No courses assigned to your class yet.');
    }
    sources.push('courses', 'course_modules', 'course_sessions');

    // ==================== STUDENT'S ASSESSMENT HISTORY ====================
    if (userId) {
      parts.push('\n## 📝 YOUR ASSESSMENT HISTORY');
      
      const { data: myAttempts } = await supabase
        .from('assessment_attempts')
        .select('id, assessment_id, percentage, passed, score, total_points, status, submitted_at, assessments(title)')
        .eq('student_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(20);
      
      if (myAttempts?.length) {
        parts.push(`Total Attempts: ${myAttempts.length}`);
        const passedCount = myAttempts.filter(a => a.passed).length;
        parts.push(`Passed: ${passedCount}/${myAttempts.length} (${((passedCount/myAttempts.length)*100).toFixed(0)}%)`);
        
        parts.push('\n**Recent Assessments:**');
        for (const a of myAttempts.slice(0, 10)) {
          const assess = a.assessments as any;
          const date = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : 'N/A';
          parts.push(`- ${assess?.title || 'Assessment'}: ${a.percentage?.toFixed(1)}% ${a.passed ? '✅ Passed' : '❌ Failed'} (${date})`);
        }

        // Get detailed answers for recent attempts (for learning)
        const recentAttemptIds = myAttempts.slice(0, 5).map(a => a.id);
        const { data: recentAnswers } = await supabase
          .from('assessment_answers')
          .select('is_correct, question_id, assessment_questions(question_text, explanation)')
          .in('attempt_id', recentAttemptIds)
          .limit(50);
        
        if (recentAnswers?.length) {
          const incorrect = recentAnswers.filter(a => !a.is_correct);
          if (incorrect.length > 0) {
            parts.push('\n**Questions You Got Wrong (Review These):**');
            for (const ans of incorrect.slice(0, 10)) {
              const q = ans.assessment_questions as any;
              if (q) {
                parts.push(`- Q: ${q.question_text}`);
                if (q.explanation) parts.push(`  💡 Explanation: ${q.explanation}`);
              }
            }
          }
        }
      } else {
        parts.push('No assessments taken yet. Check your dashboard for available assessments!');
      }
      sources.push('assessment_history');
    }

    // ==================== CONTENT COMPLETION (SCOPED TO ASSIGNED COURSES) ====================
    if (userId) {
      parts.push('\n## 📊 YOUR LEARNING PROGRESS');
      
      const { data: completions } = await supabase
        .from('student_content_completions')
        .select('content_id, completed_at')
        .eq('student_id', userId);
      
      // Only fetch content from assigned courses
      let assignedContent: any[] = [];
      if (assignedCourseIds.length > 0) {
        const { data: contentData } = await supabase
          .from('course_content')
          .select('id, title, type, course_id')
          .in('course_id', assignedCourseIds)
          .limit(500);
        assignedContent = contentData || [];
      }
      
      if (assignedContent.length) {
        const completedIds = new Set((completions || []).map(c => c.content_id));
        const completed = assignedContent.filter(c => completedIds.has(c.id));
        const completionRate = ((completed.length / assignedContent.length) * 100).toFixed(1);
        
        parts.push(`Content Completed: ${completed.length}/${assignedContent.length} (${completionRate}%)`);
        
        const remaining = assignedContent.filter(c => !completedIds.has(c.id));
        if (remaining.length > 0 && remaining.length <= 20) {
          parts.push('\n**Remaining Content:**');
          for (const c of remaining.slice(0, 10)) parts.push(`- ${c.title} (${c.type})`);
        }
      } else {
        parts.push('No course content assigned yet.');
      }
      sources.push('content_completions');
    }

    // ==================== YOUR ASSIGNMENTS (SCOPED) ====================
    if (userId && institutionId) {
      parts.push('\n## 📋 YOUR ASSIGNMENTS');
      
      // Get assignments assigned to student's class
      const { data: assignmentClassAssignments } = await supabase
        .from('assignment_class_assignments')
        .select('assignment_id')
        .eq('institution_id', institutionId)
        .eq('class_id', classId);
      
      const assignedAssignmentIds = (assignmentClassAssignments || []).map(a => a.assignment_id);
      
      if (assignedAssignmentIds.length > 0) {
        const { data: myAssignments } = await supabase
          .from('assignments')
          .select('id, title, status, submission_end_date, total_marks')
          .in('id', assignedAssignmentIds)
          .eq('status', 'active');
        
        const { data: mySubmissions } = await supabase
          .from('assignment_submissions')
          .select('assignment_id, status, marks_obtained, submitted_at, feedback')
          .eq('student_id', userId);
        
        const submittedMap = new Map((mySubmissions || []).map(s => [s.assignment_id, s]));
        
        let pending = 0, submitted = 0, graded = 0;
        const gradedDetails: string[] = [];
        const pendingDetails: string[] = [];
        
        for (const a of (myAssignments || [])) {
          const sub = submittedMap.get(a.id);
          if (!sub) {
            pending++;
            const dueDate = a.submission_end_date ? new Date(a.submission_end_date).toLocaleDateString() : 'N/A';
            pendingDetails.push(`- **${a.title}** — Due: ${dueDate} (${a.total_marks || 0} marks)`);
          } else if (sub.status === 'graded') {
            graded++;
            gradedDetails.push(`- **${a.title}**: ${sub.marks_obtained || 0}/${a.total_marks || 0} marks`);
          } else {
            submitted++;
          }
        }
        
        parts.push(`Pending: ${pending} | Submitted: ${submitted} | Graded: ${graded}`);
        if (pendingDetails.length) { parts.push('\n**Pending Assignments:**'); parts.push(...pendingDetails); }
        if (gradedDetails.length) { parts.push('\n**Graded Assignments:**'); parts.push(...gradedDetails); }
      } else {
        parts.push('No assignments assigned to your class yet.');
      }
      sources.push('assignments', 'assignment_submissions');
    }

    // ==================== YOUR ATTENDANCE ====================
    if (userId && classId && institutionId) {
      parts.push('\n## 📅 YOUR ATTENDANCE');
      
      const { data: attendanceRecords } = await supabase
        .from('class_session_attendance')
        .select('date, subject, period_label, attendance_records')
        .eq('class_id', classId)
        .eq('institution_id', institutionId)
        .order('date', { ascending: false })
        .limit(30);
      
      if (attendanceRecords?.length) {
        let presentCount = 0, absentCount = 0, lateCount = 0;
        
        for (const record of attendanceRecords) {
          const records = record.attendance_records as any[];
          if (records && Array.isArray(records)) {
            const myRecord = records.find((r: any) => r.student_id === userId || r.user_id === userId);
            if (myRecord) {
              if (myRecord.status === 'present') presentCount++;
              else if (myRecord.status === 'absent') absentCount++;
              else if (myRecord.status === 'late') lateCount++;
            }
          }
        }
        
        const total = presentCount + absentCount + lateCount;
        const attendanceRate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 'N/A';
        parts.push(`Sessions Tracked: ${total}`);
        parts.push(`Present: ${presentCount} | Absent: ${absentCount} | Late: ${lateCount}`);
        parts.push(`**Attendance Rate: ${attendanceRate}%**`);
      } else {
        parts.push('No attendance records found.');
      }
      sources.push('attendance');
    }

    // ==================== UPCOMING EVENTS (SCOPED TO INSTITUTION) ====================
    parts.push('\n## 🎉 YOUR UPCOMING EVENTS');
    const now = new Date().toISOString();
    
    if (institutionId) {
      // Get event IDs assigned to student's institution
      const { data: eventAssignments } = await supabase
        .from('event_class_assignments')
        .select('event_id')
        .eq('institution_id', institutionId);
      
      const assignedEventIds = [...new Set((eventAssignments || []).map(a => a.event_id))];
      
      if (assignedEventIds.length > 0) {
        const { data: events } = await supabase
          .from('events')
          .select('title, event_type, event_start, description, max_participants, current_participants')
          .in('id', assignedEventIds)
          .eq('status', 'published')
          .gte('event_start', now)
          .order('event_start')
          .limit(5);
        
        if (events?.length) {
          for (const e of events) {
            const spots = e.max_participants ? `${e.current_participants || 0}/${e.max_participants} spots` : 'Open';
            parts.push(`- **${e.title}** (${e.event_type}) - ${new Date(e.event_start).toLocaleDateString()} [${spots}]`);
            if (e.description) parts.push(`  ${e.description.slice(0, 100)}...`);
          }
        } else {
          parts.push('No upcoming events for your institution.');
        }
      } else {
        parts.push('No events assigned to your institution.');
      }
    } else {
      parts.push('No institution found to scope events.');
    }
    sources.push('events');

    // ==================== GAMIFICATION ====================
    parts.push('\n## 🏆 GAMIFICATION & ACHIEVEMENTS');
    
    const { data: badges } = await supabase
      .from('gamification_badges')
      .select('id, name, description, xp_reward, category')
      .eq('is_active', true)
      .limit(10);
    
    if (badges?.length) {
      parts.push(`Available Badges: ${badges.length}\n`);
      for (const b of badges) {
        parts.push(`- **${b.name}** (${b.xp_reward} XP) - ${b.description || b.category || ''}`);
      }
    }
    sources.push('gamification');

    // ==================== SWOT ANALYSIS (if userId provided) ====================
    if (userId) {
      parts.push('\n## 🔍 YOUR PERSONAL SWOT ANALYSIS');
      
      const { data: userAttempts } = await supabase
        .from('assessment_attempts')
        .select('id, assessment_id, percentage, passed')
        .eq('student_id', userId)
        .in('status', ['submitted', 'auto_submitted']);
      
      if (userAttempts?.length) {
        const attemptIds = userAttempts.map(a => a.id);
        
        const { data: answers } = await supabase
          .from('assessment_answers')
          .select('is_correct, points_earned, question_id, assessment_questions(question_text, points, course_id, module_id, session_id, courses(title), course_modules(title), course_sessions(title))')
          .in('attempt_id', attemptIds)
          .limit(500);
        
        if (answers?.length) {
          const topicPerformance: Record<string, { correct: number; total: number; courseName: string; moduleName: string }> = {};
          
          for (const ans of answers) {
            const q = ans.assessment_questions as any;
            if (!q) continue;
            const courseName = q.courses?.title || 'General';
            const moduleName = q.course_modules?.title || 'General';
            const key = `${courseName} > ${moduleName}`;
            
            if (!topicPerformance[key]) topicPerformance[key] = { correct: 0, total: 0, courseName, moduleName };
            topicPerformance[key].total++;
            if (ans.is_correct) topicPerformance[key].correct++;
          }
          
          const topics = Object.entries(topicPerformance).map(([key, v]) => ({
            topic: key, accuracy: v.total > 0 ? (v.correct / v.total) * 100 : 0, total: v.total
          })).sort((a, b) => b.accuracy - a.accuracy);
          
          const strengths = topics.filter(t => t.accuracy >= 75 && t.total >= 2);
          if (strengths.length) {
            parts.push('\n### ✅ STRENGTHS (>75% accuracy):');
            for (const s of strengths) parts.push(`- **${s.topic}**: ${s.accuracy.toFixed(0)}% accuracy (${s.total} questions)`);
          }
          
          const weaknesses = topics.filter(t => t.accuracy < 50 && t.total >= 2);
          if (weaknesses.length) {
            parts.push('\n### ⚠️ WEAKNESSES (<50% accuracy):');
            for (const w of weaknesses) parts.push(`- **${w.topic}**: ${w.accuracy.toFixed(0)}% accuracy (${w.total} questions)`);
          }
          
          const average = topics.filter(t => t.accuracy >= 50 && t.accuracy < 75 && t.total >= 2);
          if (average.length) {
            parts.push('\n### 📊 IMPROVEMENT AREAS (50-75% accuracy):');
            for (const a of average) parts.push(`- **${a.topic}**: ${a.accuracy.toFixed(0)}% accuracy (${a.total} questions)`);
          }
        }
        
        const passedCount = userAttempts.filter(a => a.passed).length;
        const avgPct = userAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / userAttempts.length;
        parts.push(`\n**Overall:** ${passedCount}/${userAttempts.length} assessments passed, ${avgPct.toFixed(1)}% average score`);
      }
      
      // Opportunities
      const { data: completions } = await supabase
        .from('student_content_completions')
        .select('content_id')
        .eq('student_id', userId);
      
      const completedContentIds = new Set((completions || []).map(c => c.content_id));
      
      // Scope SWOT content to assigned courses
      let swotContent: any[] = [];
      if (assignedCourseIds.length > 0) {
        const { data: contentData } = await supabase
          .from('course_content')
          .select('id, title, session_id, course_sessions(title), courses(title)')
          .in('course_id', assignedCourseIds)
          .limit(200);
        swotContent = contentData || [];
      }
      
      if (swotContent.length) {
        const incomplete = swotContent.filter(c => !completedContentIds.has(c.id));
        if (incomplete.length > 0) {
          parts.push(`\n### 🔮 OPPORTUNITIES:`);
          parts.push(`- ${incomplete.length} content items remaining to complete out of ${swotContent.length} total`);
          parts.push(`- Completion rate: ${(((swotContent.length - incomplete.length) / swotContent.length) * 100).toFixed(1)}%`);
        }
      }
      
      // Threats - scoped to institution
      const now2 = new Date().toISOString();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Get institution-scoped assessments
      let upcomingAssessments: any[] = [];
      if (institutionId) {
        const { data: assessClassAssignments } = await supabase
          .from('assessment_class_assignments')
          .select('assessment_id')
          .eq('institution_id', institutionId);
        const assessIds = (assessClassAssignments || []).map(a => a.assessment_id);
        
        if (assessIds.length > 0) {
          const { data: assessData } = await supabase
            .from('assessments')
            .select('title, start_time, end_time')
            .in('id', assessIds)
            .gte('start_time', now2)
            .lte('start_time', nextWeek)
            .eq('status', 'published')
            .limit(5);
          upcomingAssessments = assessData || [];
        }
      }
      
      // Get institution-scoped assignments
      let upcomingAssignments: any[] = [];
      if (institutionId && classId) {
        const { data: assignClassAssignments } = await supabase
          .from('assignment_class_assignments')
          .select('assignment_id')
          .eq('institution_id', institutionId)
          .eq('class_id', classId);
        const assignIds = (assignClassAssignments || []).map(a => a.assignment_id);
        
        if (assignIds.length > 0) {
          const { data: assignData } = await supabase
            .from('assignments')
            .select('title, submission_end_date')
            .in('id', assignIds)
            .gte('submission_end_date', now2)
            .lte('submission_end_date', nextWeek)
            .eq('status', 'active')
            .limit(5);
          upcomingAssignments = assignData || [];
        }
      }
      
      if ((upcomingAssessments?.length || 0) + (upcomingAssignments?.length || 0) > 0) {
        parts.push(`\n### ⏰ THREATS (Upcoming Deadlines This Week):`);
        for (const a of (upcomingAssessments || [])) parts.push(`- Assessment: **${a.title}** starts ${new Date(a.start_time).toLocaleDateString()}`);
        for (const a of (upcomingAssignments || [])) parts.push(`- Assignment: **${a.title}** due ${new Date(a.submission_end_date).toLocaleDateString()}`);
      }
      
      sources.push('swot_analysis');
    }

  } catch (e) {
    console.error('Student context error:', e);
  }
  
  return { context: parts.join('\n'), sources };
}

// ==================== SYSTEM PROMPTS ====================

const systemAdminPrompt = `You are Metova, an AI Business Intelligence assistant for System Administrators at Metova Academy.

You have access to REAL DATA from the following modules:

1. **Institution Management** - Partner schools/institutions, their contracts, student enrollments, classes
2. **Student Management** - Student profiles, enrollments by institution
3. **Officer Management** - Innovation Officers (trainers), departments, attendance
4. **Course Management** - Training courses, modules, sessions, content, assignments to institutions
5. **Assessment Management** - Quizzes, tests, attempts, pass rates
6. **Assignment Management** - Homework, project assignments, submissions, grading
7. **Events Management** - Competitions, hackathons, workshops, registrations
8. **Project Management** - Student innovation projects, SDG mapping, achievements
9. **Inventory Management** - Lab equipment, purchase requests, stock levels
10. **Payroll Management** - Staff salaries, payment status, pending amounts
11. **Leave Management** - Leave applications, approvals, company holidays
12. **Task Management** - CRM tasks, priorities, overdue tracking
13. **Gamification** - Student XP, badges, activity rewards
14. **Recruitment (ATS)** - Job postings, applications, interviews, offers
15. **Invoice Management** - Billing, revenue tracking, receivables
16. **CRM & Contracts** - Client relationships, contract renewals, communications
17. **Newsletters** - Published newsletters, download statistics
18. **Performance Ratings** - Staff appraisals, HR ratings, star awards
19. **Surveys & Feedback** - Student surveys, feedback, ratings
20. **Monthly Reports** - Institution progress reports
21. **Attendance** - Class attendance, officer attendance records
22. **Per-Institution Performance Metrics** - Pass rates, attendance rates, student counts, XP engagement per institution
23. **Trainer/Officer Performance** - Per-trainer student outcomes, top/bottom performing trainers

KEY ANALYTICAL CAPABILITIES:
- **Per-Institution Comparison**: Compare pass rates, attendance rates, student engagement across all institutions
- **Trainer Performance Analysis**: Identify which trainers produce the best student outcomes
- **At-Risk Institution Identification**: Flag institutions with pass rate below 50% or attendance below 70%
- **Trend Analysis**: Compare metrics across institutions to identify best practices

Provide comprehensive, data-driven insights. Use markdown formatting with tables, bullet points, and clear sections.
Be professional and focus on actionable business intelligence that helps with decision-making.`;

const officerPrompt = `You are Metova, an AI assistant for Innovation Officers (teachers/trainers). You help officers with:
- Tracking student performance across their assigned institution's classes (with student names)
- Identifying students who need additional support (by name and score)
- Monitoring innovation project progress within their institution
- Analyzing class attendance patterns for their institution
- Comparing performance between classes in their institution
- Suggesting intervention strategies for struggling students

You have access to institution-scoped data including student names and per-student performance metrics.
Provide data-driven insights and actionable recommendations. Use markdown formatting with tables when appropriate.`;

const studentPrompt = `You are Metova, an intelligent and friendly AI learning assistant specialized in STEM education (Science, Technology, Engineering, and Mathematics) at Metova Academy.

## YOUR CORE CAPABILITIES:

### 🔬 STEM Subject Support
You can answer doubts and explain concepts in:
- **Science**: Physics, Chemistry, Biology, Environmental Science, Space Science
- **Technology**: Programming (Python, Scratch, Arduino), Electronics, Robotics, AI/ML basics, Drones, IoT, Web Development
- **Engineering**: Mechanical concepts, Circuit design, Design thinking, Innovation, 3D Printing, CAD basics
- **Mathematics**: Arithmetic, Algebra, Geometry, Trigonometry, Basic calculus, Statistics, Logic

### 📚 Course Content Help
You have access to the student's course materials and can help them understand:
- Course modules and session content
- Learning objectives and key concepts
- Practical applications of theoretical concepts
- Project ideas related to course topics
- Step-by-step explanations of complex topics

### 📝 Assessment & Assignment Support
You assist with:
- Reviewing concepts from completed assessments (with explanations)
- Explaining correct answers and the reasoning behind them
- Clarifying difficult questions from past assessments
- Helping understand assignment requirements
- Preparing for upcoming assessments with study tips

### 🚀 Innovation & Projects
You can help with:
- Innovation project ideas aligned with SDG goals
- Technical guidance for STEM projects
- Problem-solving approaches for engineering challenges
- Code debugging and programming help

## YOUR TEACHING APPROACH:
1. **Explain Simply**: Use simple language with relatable examples
2. **Be Interactive**: Ask clarifying questions if the doubt is unclear
3. **Use Analogies**: Relate complex concepts to everyday examples students understand
4. **Step-by-Step**: Break down problems into smaller, manageable steps
5. **Visual Thinking**: Describe diagrams, flowcharts, or suggest visualizations when helpful
6. **Encourage**: Be supportive, patient, and motivating
7. **Formulas & Code**: Include formulas, equations, or code snippets when they help explain concepts

## RESPONSE FORMAT:
- Use markdown formatting for clarity (headers, bullet points, code blocks)
- For math/physics, show step-by-step solutions
- For programming, provide code examples with explanations
- Include "💡 Pro Tip" sections for additional insights
- End complex explanations with a quick summary

## IMPORTANT GUIDELINES:
- Focus on STEM subjects and course-related academic content
- For non-academic questions, politely redirect: "I'm best at helping with STEM subjects! Do you have any science, math, coding, or engineering questions?"
- If a concept is beyond the available context, acknowledge it: "I don't have detailed information on that specific topic, but here's what I can share..."
- Never provide direct answers that would help students cheat on ongoing assessments
- For completed assessments, provide explanations to help learning

Be encouraging, patient, and thorough in your explanations. Your goal is to help students truly understand concepts, not just get answers!

## SWOT ANALYSIS:
When asked about SWOT, strengths, weaknesses, or improvement areas:
- Use the SWOT data provided in the context to give a personalized analysis
- For STRENGTHS: highlight topics where the student scores >75%
- For WEAKNESSES: identify topics where the student scores <50% and suggest specific study areas
- For OPPORTUNITIES: mention incomplete courses/content and upcoming learning events
- For THREATS: warn about upcoming deadlines and assessments at risk
- Always provide actionable improvement suggestions based on weak course outcomes
- Recommend specific study focus areas based on upcoming assessments

## CLASS RANKING:
When asked about rank, standing, or performance vs peers:
- Use the class ranking data to show their position
- Explain what the weighted formula considers (Assessments 50%, Assignments 20%, Projects 20%, XP 10%)
- Suggest specific areas to improve their ranking

## 🧭 CAREER GUIDANCE (Current Market Context - 2025-2026):
When asked about career advice, future domains, or "what should I study":
- Analyze their strongest course categories and SWOT strengths
- Consider their project types, SDG goals, and achievements/awards
- **ALWAYS frame career advice based on current 2025-2026 industry trends and real-time market demand**, NOT historical or outdated information
- Map strengths to current high-demand career domains:
  - High Programming/Coding accuracy → AI/ML Engineering (massive demand 2025), Full-Stack Development, DevOps/Platform Engineering, Cybersecurity
  - High Electronics/Robotics accuracy → Mechatronics, IoT & Edge Computing, Embedded AI, Drone Technology, EV & Battery Systems
  - High Biology/Environment accuracy → Biotechnology, Climate Tech, Green Energy, Healthcare AI, Precision Agriculture
  - High Math/Statistics accuracy → Data Engineering (top demand), Quantitative Finance, AI Research, Actuarial Science
  - Projects with patents/awards → Deep Tech Entrepreneurship, R&D roles at FAANG/startups, Innovation Management
  - SDG-aligned projects → ESG Consulting, Sustainability Engineering, Impact Investing, Policy & Governance
- Reference current high-demand fields: AI/ML Engineering, Cybersecurity, Cloud Architecture, Data Engineering, Climate Tech, Quantum Computing, Space Technology, Semiconductor Design, AR/VR Development
- Mention relevant certifications trending in 2025-2026 (AWS/Azure/GCP, Google AI, Certified Ethical Hacker, PMP, etc.)
- Provide realistic salary expectations and growth trajectories based on current Indian/global market
- Suggest specific higher education paths (IITs, NITs, international programs) and competitive exam focus areas
- Be encouraging, specific, and highlight their unique combination of skills as a competitive advantage`;


const managementPrompt = `You are Metova, an AI Business Intelligence assistant for Institution Management at Metova Academy.

You help management administrators with:
- **Student Progress Monitoring**: Track overall student performance with names, identify at-risk students, compare class-wise performance
- **Assessment Insights**: Analyze pass rates, score distributions, and class-wise comparison of assessment results
- **Assignment Tracking**: Monitor submission rates, grading statistics, and completion patterns
- **Project Oversight**: Track innovation project status, achievements, SDG alignment, and identify projects with patent potential
- **Attendance Analysis**: Monitor attendance trends across classes and identify students with poor attendance
- **Course Progress**: Track which courses are assigned and how students are progressing through content
- **Content Completion**: Monitor content completion rates across students and courses

When asked about project patentability:
- Look at project titles, descriptions, and achievements
- Projects with awards, competitions won, or unique innovation descriptions may have patent potential
- Suggest which projects deserve further evaluation for intellectual property protection

When asked about at-risk students:
- Look for students with low assessment scores (<50%), poor attendance, or missing assignment submissions
- Provide specific student names and recommendations for intervention

Provide comprehensive, data-driven insights. Use markdown formatting with tables, bullet points, and clear sections.
Be professional and focus on actionable intelligence for institutional improvement.`;

const dataGroundingRules = `

CRITICAL DATA GROUNDING RULES:
1. ONLY use data from the "REAL DATA CONTEXT" section below. Never invent or hallucinate institution names, numbers, or statistics.
2. If asked about something not in the context, clearly state: "I don't have that specific data available. Here's what I do have..."
3. Always use the EXACT institution names from the context (e.g., "Modern School", "Kikani Global Academy").
4. Never use placeholder names like "Institution A/B/C/D" or made-up numbers.
5. If a data section says "No data found" or shows zero counts, acknowledge this honestly.
6. When providing summaries, cite the actual numbers from the context.
7. If data is missing for a module, say "No [module] data found yet" instead of guessing.
`;

// ==================== MAIN HANDLER ====================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, role, conversationHistory, userId, action } = await req.json();

    // Handle usage check action
    if (action === 'check_usage') {
      const aiSettings = await getAISettings();
      if (!userId) {
        return new Response(JSON.stringify({ 
          used: 0, 
          limit: aiSettings.monthly_prompt_limit, 
          limit_enabled: aiSettings.prompt_limit_enabled,
          disabled: !aiSettings.enabled
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const usage = await getUserUsage(userId);
      return new Response(JSON.stringify({ 
        used: usage.used, 
        limit: aiSettings.monthly_prompt_limit, 
        limit_enabled: aiSettings.prompt_limit_enabled,
        disabled: !aiSettings.enabled,
        month: usage.month,
        year: usage.year
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message) {
      throw new Error('Message is required');
    }

    // Fetch AI settings
    const aiSettings = await getAISettings();
    
    if (!aiSettings.enabled) {
      return new Response(JSON.stringify({ 
        error: 'AI assistant is currently disabled by the administrator. Please try again later.',
        disabled: true
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check prompt limit if enabled
    if (aiSettings.prompt_limit_enabled && userId) {
      const validRoles = ['student', 'officer', 'system_admin', 'management'];
      const userRole = validRoles.includes(role) ? role : 'student';
      
      const usageCheck = await checkAndUpdateUsage(userId, userRole, aiSettings.monthly_prompt_limit);
      
      if (!usageCheck.allowed) {
        return new Response(JSON.stringify({ 
          error: `You've reached your monthly limit of ${usageCheck.limit} prompts. Your limit resets on the 1st of next month.`,
          limit_exceeded: true,
          used: usageCheck.used,
          limit: usageCheck.limit
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Use only custom API key - no default fallback
    const openAIApiKey = aiSettings.custom_api_key;
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'No API key configured. Please add your OpenAI API key in Settings → AI Settings.',
        no_api_key: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validRoles = ['student', 'officer', 'system_admin', 'management'];
    const userRole = validRoles.includes(role) ? role : 'student';
    
    let dataContext = '';
    let dataSources: string[] = [];
    let basePrompt = '';
    
    if (userRole === 'system_admin') {
      const result = await fetchSystemAdminContext();
      dataContext = result.context;
      dataSources = result.sources;
      basePrompt = systemAdminPrompt;
    } else if (userRole === 'officer') {
      // Resolve officer's institution_id
      let institutionId: string | undefined;
      if (userId) {
        const supabase = getSupabaseClient();
        const { data: profile } = await supabase.from('profiles').select('institution_id').eq('id', userId).single();
        institutionId = profile?.institution_id || undefined;
        
        // Also check officer_assignments if profile doesn't have institution_id
        if (!institutionId) {
          const { data: officer } = await supabase.from('officers').select('assigned_institutions').eq('user_id', userId).single();
          const assignedInsts = officer?.assigned_institutions as string[] | null;
          if (assignedInsts?.length) institutionId = assignedInsts[0];
        }
      }
      const result = await fetchOfficerContext(institutionId);
      dataContext = result.context;
      dataSources = result.sources;
      basePrompt = officerPrompt;
    } else if (userRole === 'management') {
      let institutionId: string | undefined;
      if (userId) {
        const supabase = getSupabaseClient();
        const { data: profile } = await supabase.from('profiles').select('institution_id').eq('id', userId).single();
        institutionId = profile?.institution_id || undefined;
      }
      const result = await fetchManagementContext(institutionId);
      dataContext = result.context;
      dataSources = result.sources;
      basePrompt = managementPrompt;
    } else {
      const result = await fetchStudentContext(userId);
      dataContext = result.context;
      dataSources = result.sources;
      basePrompt = studentPrompt;
    }

    const systemPrompt = basePrompt + dataGroundingRules + `

=== REAL DATA CONTEXT (Use ONLY this data) ===
${dataContext}
=== END OF REAL DATA CONTEXT ===
`;

    const messages = [{ role: 'system', content: systemPrompt }];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    messages.push({ role: 'user', content: message });

    console.log(`Processing ask-metova for role: ${userRole}, model: ${aiSettings.model}, context length: ${dataContext.length} chars`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiSettings.model,
        messages,
        temperature: 0.7,
        max_tokens: 2048
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    let promptUsage = null;
    if (aiSettings.prompt_limit_enabled && userId) {
      const usage = await getUserUsage(userId);
      promptUsage = { used: usage.used, limit: aiSettings.monthly_prompt_limit };
    }

    console.log(`Successfully generated response for ${userRole}`);

    return new Response(JSON.stringify({ 
      content: aiContent,
      context: [userRole, 'ai_generated'],
      dataSources,
      promptUsage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in ask-metova function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
