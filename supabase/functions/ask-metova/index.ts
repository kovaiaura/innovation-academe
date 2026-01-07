import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompts: Record<string, string> = {
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
    const systemPrompt = systemPrompts[userRole];

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
      context: [userRole, 'ai_generated']
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
