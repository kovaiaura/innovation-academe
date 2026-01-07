import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch real data context for system admin
async function fetchSystemAdminContext(): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const contextParts: string[] = [];
  
  try {
    // Fetch institutions with student counts
    const { data: institutions } = await supabase
      .from('institutions')
      .select('id, name, status, current_users, max_users, contract_expiry_date, contract_value')
      .order('name');
    
    if (institutions && institutions.length > 0) {
      contextParts.push('## Institutions in the System');
      for (const inst of institutions) {
        contextParts.push(`- **${inst.name}**: Status: ${inst.status}, Contract Value: ₹${inst.contract_value || 0}, Expiry: ${inst.contract_expiry_date || 'Not set'}`);
      }
    } else {
      contextParts.push('## Institutions: No institutions found in the system yet.');
    }

    // Fetch student counts per institution
    const { data: studentCounts } = await supabase
      .from('profiles')
      .select('institution_id, institutions(name)')
      .not('institution_id', 'is', null);
    
    if (studentCounts && studentCounts.length > 0) {
      const countMap: Record<string, number> = {};
      for (const s of studentCounts) {
        const inst = s.institutions as unknown as { name: string } | null;
        const instName = inst?.name || 'Unknown';
        countMap[instName] = (countMap[instName] || 0) + 1;
      }
      contextParts.push('\n## Student Counts by Institution');
      for (const [name, count] of Object.entries(countMap)) {
        contextParts.push(`- ${name}: ${count} students`);
      }
    }

    // Fetch officers count
    const { count: officersCount } = await supabase
      .from('officers')
      .select('*', { count: 'exact', head: true });
    
    contextParts.push(`\n## Staff Overview`);
    contextParts.push(`- Total Officers/Trainers: ${officersCount || 0}`);

    // Fetch CRM contracts summary
    const { data: contracts } = await supabase
      .from('crm_contracts')
      .select('status, contract_value, institution_name');
    
    if (contracts && contracts.length > 0) {
      const totalValue = contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0);
      const activeContracts = contracts.filter(c => c.status === 'active').length;
      contextParts.push(`\n## CRM Contracts`);
      contextParts.push(`- Total Contracts: ${contracts.length}`);
      contextParts.push(`- Active Contracts: ${activeContracts}`);
      contextParts.push(`- Total Contract Value: ₹${totalValue.toLocaleString()}`);
    } else {
      contextParts.push(`\n## CRM Contracts: No contracts found yet.`);
    }

    // Fetch communication logs count
    const { count: commLogsCount } = await supabase
      .from('communication_logs')
      .select('*', { count: 'exact', head: true });
    
    contextParts.push(`\n## Communications`);
    contextParts.push(`- Total Communication Logs: ${commLogsCount || 0}`);

    // Fetch courses count
    const { count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    contextParts.push(`\n## Courses`);
    contextParts.push(`- Total Courses: ${coursesCount || 0}`);

    // Fetch events count
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    contextParts.push(`\n## Events`);
    contextParts.push(`- Total Events: ${eventsCount || 0}`);

  } catch (error) {
    console.error('Error fetching context:', error);
    contextParts.push('Note: Some data could not be fetched. Please try again.');
  }

  return contextParts.join('\n');
}

// Fetch real data context for officer
async function fetchOfficerContext(): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const contextParts: string[] = [];
  
  try {
    // Fetch classes count
    const { count: classesCount } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true });
    
    contextParts.push(`## Overview`);
    contextParts.push(`- Total Classes: ${classesCount || 0}`);

    // Fetch assessments count
    const { count: assessmentsCount } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true });
    
    contextParts.push(`- Total Assessments: ${assessmentsCount || 0}`);

    // Fetch assignments count  
    const { count: assignmentsCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true });
    
    contextParts.push(`- Total Assignments: ${assignmentsCount || 0}`);

  } catch (error) {
    console.error('Error fetching officer context:', error);
  }

  return contextParts.join('\n');
}

// Fetch real data context for student
async function fetchStudentContext(): Promise<string> {
  const contextParts: string[] = [];
  contextParts.push('## Your Learning Dashboard');
  contextParts.push('- Access your courses, assignments, and assessments from your dashboard.');
  contextParts.push('- Check your progress and upcoming deadlines regularly.');
  return contextParts.join('\n');
}

const baseSystemPrompts: Record<string, string> = {
  student: `You are Metova, a friendly and supportive AI learning assistant for students. You help students with:
- Tracking their course progress and grades
- Understanding their assignments and deadlines
- Analyzing their attendance patterns
- Providing study tips and learning strategies
- Career guidance and skill development advice
- Project support and innovation ideas

Be encouraging, clear, and helpful. Use markdown formatting for better readability. 
Keep responses concise but informative. Address the student directly and be supportive of their learning journey.`,

  officer: `You are Metova, an AI assistant for Innovation Officers (teachers/trainers). You help officers with:
- Tracking student performance across their classes
- Identifying students who need additional support
- Monitoring innovation project progress
- Analyzing class attendance patterns
- Comparing performance between classes
- Suggesting intervention strategies

Provide data-driven insights and actionable recommendations. Use markdown formatting with tables when appropriate.
Be professional and focus on helping officers make informed decisions about their students.`,

  system_admin: `You are Metova, an AI Business Intelligence assistant for System Administrators. You help admins with:
- Staff attendance and performance tracking
- Institution performance metrics and analytics
- CRM activities, contract renewals, and communications
- Revenue reports and financial insights
- Inventory management and operational metrics
- Project tracking and resource allocation

Provide comprehensive, data-driven insights. Use markdown formatting with tables, bullet points, and clear sections.
Be professional and focus on actionable business intelligence that helps with decision-making.`
};

const dataGroundingRules = `

CRITICAL DATA GROUNDING RULES:
1. ONLY use data from the "REAL DATA CONTEXT" section below. Never invent or hallucinate institution names, numbers, or statistics.
2. If asked about something not in the context, clearly state: "I don't have that specific data available. Here's what I do have..."
3. Always use the EXACT institution names from the context (e.g., "Modern School", "Kikani Global Academy").
4. Never use placeholder names like "Institution A/B/C/D" or made-up numbers.
5. If a data section says "No data found" or shows zero counts, acknowledge this honestly.
6. When providing summaries, cite the actual numbers from the context.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, role, conversationHistory, userId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const validRoles = ['student', 'officer', 'system_admin'];
    const userRole = validRoles.includes(role) ? role : 'student';
    
    // Fetch real data context based on role
    let dataContext = '';
    const dataSources: string[] = [];
    
    if (userRole === 'system_admin') {
      dataContext = await fetchSystemAdminContext();
      dataSources.push('institutions', 'students', 'officers', 'contracts', 'communications', 'courses', 'events');
    } else if (userRole === 'officer') {
      dataContext = await fetchOfficerContext();
      dataSources.push('classes', 'assessments', 'assignments');
    } else {
      dataContext = await fetchStudentContext();
      dataSources.push('learning_dashboard');
    }

    // Build the complete system prompt with data grounding
    const systemPrompt = baseSystemPrompts[userRole] + dataGroundingRules + `

=== REAL DATA CONTEXT (Use ONLY this data) ===
${dataContext}
=== END OF REAL DATA CONTEXT ===
`;

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided (last 10 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    console.log(`Processing ask-metova request for role: ${userRole}, userId: ${userId || 'anonymous'}`);
    console.log(`Data context length: ${dataContext.length} chars`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1024
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    console.log(`Successfully generated response for ${userRole}`);

    return new Response(JSON.stringify({ 
      content: aiContent,
      context: [userRole, 'ai_generated'],
      dataSources: dataSources
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in ask-metova function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
