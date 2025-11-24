import { Layout } from "@/components/layout/Layout";
import { ChatMessage } from "@/components/student/ChatMessage";
import { ChatInput } from "@/components/student/ChatInput";
import { ChatSidebar } from "@/components/student/ChatSidebar";
import { TypingIndicator } from "@/components/student/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PanelLeftClose, PanelLeft, Users, TrendingUp, FolderKanban, AlertCircle, Award, CalendarCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChatConversation, ChatMessage as ChatMessageType, mockOfficerChatConversations } from "@/data/mockOfficerChatData";
import { useAuth } from "@/contexts/AuthContext";

function OfficerWelcomeMessage() {
  const suggestedPrompts = [
    { icon: <TrendingUp className="h-5 w-5" />, text: "How is Class 6A performing this month?" },
    { icon: <AlertCircle className="h-5 w-5" />, text: "Show me students who need more attention" },
    { icon: <FolderKanban className="h-5 w-5" />, text: "Which students are working on innovation projects?" },
    { icon: <Users className="h-5 w-5" />, text: "Compare performance between my classes" },
    { icon: <Award className="h-5 w-5" />, text: "Who are my top performing students?" },
    { icon: <CalendarCheck className="h-5 w-5" />, text: "Which students have low attendance?" }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Ask Metova
          </h1>
          <p className="text-lg text-muted-foreground">
            Your AI assistant for student performance insights and class management
          </p>
        </div>

        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          I can help you track student performance, identify those who need support, monitor innovation projects, 
          analyze class trends, and provide data-driven insights for better decision-making.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
          {suggestedPrompts.map((prompt, index) => (
            <Card
              key={index}
              className="p-4 hover:bg-accent cursor-pointer transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="text-primary mt-0.5">
                  {prompt.icon}
                </div>
                <p className="text-sm text-left group-hover:text-foreground transition-colors">
                  {prompt.text}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OfficerAskMetova() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [currentMessages, setCurrentMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversations from localStorage or use mock data
    const stored = localStorage.getItem('officer_metova_conversations');
    if (stored) {
      const parsedConversations = JSON.parse(stored);
      setConversations(parsedConversations);
      if (parsedConversations.length > 0) {
        setActiveConversationId(parsedConversations[0].id);
        setCurrentMessages(parsedConversations[0].messages);
      }
    } else {
      setConversations(mockOfficerChatConversations);
      localStorage.setItem('officer_metova_conversations', JSON.stringify(mockOfficerChatConversations));
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [currentMessages, isTyping]);

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    setCurrentMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setActiveConversationId(id);
      setCurrentMessages(conversation.messages);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      setConversations([]);
      setActiveConversationId(undefined);
      setCurrentMessages([]);
      localStorage.removeItem('officer_metova_conversations');
    }
  };

  const generateAIResponse = (userMessage: string): { content: string; context: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('class') && (lowerMessage.includes('performing') || lowerMessage.includes('performance'))) {
      return {
        content: "**Class Performance Summary**\n\nBased on recent data:\n\n📊 **Overall Metrics:**\n• Average Score: 78-82% across sections\n• Attendance Rate: 84-89%\n• Project Participation: 68-92%\n\n✅ **Strong Areas:**\n• STEM subject engagement\n• Innovation project completion\n• Peer collaboration\n\n⚠️ **Areas Needing Support:**\n• 5-8 students per class below 60%\n• Assignment submission rates varying\n• Some attendance consistency issues\n\n🎯 **Top Performers:** Aarav Sharma (94%), Ananya Verma (91%), Vivaan Gupta (89%)\n\n⚠️ **Students Needing Attention:** I can identify specific students who need intervention. Would you like a detailed breakdown?",
        context: ['class_performance', 'student_grades', 'attendance']
      };
    }
    
    if (lowerMessage.includes('attention') || lowerMessage.includes('struggling') || lowerMessage.includes('help')) {
      return {
        content: "**Students Requiring Additional Support**\n\n🔴 **Priority - Immediate Action:**\n• 8 students with academic scores below 60%\n• 12 students with attendance below 80%\n• 7 students not participating in projects\n\n**Key Concerns:**\n1. **Academic Performance:** Students struggling with Math & Science fundamentals\n2. **Attendance Issues:** Pattern of Monday/Friday absences\n3. **Engagement:** Low participation in collaborative activities\n\n**Recommended Actions:**\n• Parent-teacher meetings for priority cases\n• Peer mentoring program\n• Targeted study groups\n• Regular check-ins (weekly for priority, bi-weekly for moderate)\n\nWould you like detailed profiles of specific students?",
        context: ['student_performance', 'attendance', 'engagement_metrics']
      };
    }
    
    if (lowerMessage.includes('project') || lowerMessage.includes('innovation')) {
      return {
        content: "**Innovation Projects Overview**\n\n📌 **Active Projects:** 12 projects\n📌 **Students Involved:** 48 students\n📌 **SDG Goals:** 8 different goals addressed\n\n**🚀 On Track (67%):**\n• Smart Waste Segregation - 65% complete\n• Solar Water Purifier - Prototype done ✅\n• AI Crop Disease Detection - 58% complete\n\n**⚠️ At-Risk (33%):**\n• Smart Traffic Management - 28% complete (team coordination issues)\n• Eco-Friendly Packaging - 15% complete (material delays)\n\n**Top Project Teams:**\n1. Aarav Sharma's team - Excellent progress\n2. Ananya Verma's team - Milestone achieved\n3. Vivaan Gupta's team - Strong technical execution\n\n**Next Steps:** Review at-risk projects, schedule mentor meetings, celebrate milestone achievements.\n\nWould you like details on a specific project?",
        context: ['projects', 'student_participation', 'sdg_goals']
      };
    }
    
    if (lowerMessage.includes('compare') || lowerMessage.includes('comparison')) {
      return {
        content: "**Class Comparison Analysis**\n\nI can compare performance across different sections. Here's a sample comparison:\n\n| Metric | Section A | Section B |\n|--------|-----------|----------|\n| Average Score | 76% | 82% |\n| Attendance | 84% | 89% |\n| Projects | 68% | 85% |\n\n**Key Insights:**\n• Section B shows stronger overall performance\n• Both sections excel in different areas\n• Opportunity for cross-section peer learning\n\n**Recommendations:**\n• Share best practices between sections\n• Joint collaborative projects\n• Targeted support for weaker areas\n\nWhich specific classes would you like me to compare?",
        context: ['class_analytics', 'comparative_analysis']
      };
    }
    
    if (lowerMessage.includes('top') || lowerMessage.includes('best') || lowerMessage.includes('excellent')) {
      return {
        content: "**Top Performing Students**\n\n🏆 **Excellence Category (90%+):**\n\n1. **Aarav Sharma** - 94%\n   • Strengths: Math, Science, Innovation\n   • Leading: Smart Waste Segregation project\n   • Attendance: 97%\n\n2. **Ananya Verma** - 91%\n   • Strengths: Science, English, Leadership\n   • Project: Solar Water Purifier ✅\n   • Attendance: 95%\n\n3. **Vivaan Gupta** - 89%\n   • Strengths: AI/ML, Programming\n   • Project: AI Crop Disease Detection\n   • Attendance: 93%\n\n⭐ **High Achievers (85-89%):** 7 additional students\n\n**Recognition Opportunities:**\n• Monthly Star Student Awards\n• Peer Mentorship roles\n• Advanced course recommendations\n• Parent appreciation letters\n\nThese students can serve as excellent peer mentors!",
        context: ['student_grades', 'projects', 'attendance', 'gamification']
      };
    }
    
    if (lowerMessage.includes('attendance')) {
      return {
        content: "**Attendance Analysis**\n\n🔴 **Critical (<75%):** 8 students requiring immediate intervention\n🟡 **At-Risk (75-80%):** 12 students needing monitoring\n✅ **Good Standing (>80%):** Majority of students\n\n**Patterns Identified:**\n• Monday absences: Highest (32%)\n• Friday absences: Second highest (26%)\n• Medical issues: Most common reason (35%)\n\n**Impact on Performance:**\n• Students with <75% attendance show 12% lower grades on average\n• Strong correlation with project participation\n\n**Intervention Strategy:**\n• Parent meetings scheduled for critical cases\n• Weekly monitoring system\n• Peer buddy system for reintegration\n• Early warning triggers at 85%\n\n**Success Story:** Arjun Reddy improved from 68% to 88% in 6 weeks through daily check-ins and parent partnership.\n\nWould you like the detailed list of students needing attendance intervention?",
        context: ['attendance_records', 'intervention_strategies']
      };
    }
    
    return {
      content: `I understand you're asking about: "${userMessage}"\n\nI can help you with:\n\n📊 **Performance Tracking**\n• Class-wise performance analysis\n• Individual student progress\n• Subject-wise insights\n\n👥 **Student Management**\n• Identify students needing support\n• Track top performers\n• Monitor engagement levels\n\n🎯 **Project Oversight**\n• Innovation project status\n• Team progress tracking\n• SDG goal alignment\n\n📈 **Analytics & Insights**\n• Attendance patterns\n• Comparative class analysis\n• Trend identification\n\nWhat specific information would you like to explore?`,
      context: ['general_assistance']
    };
  };

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setCurrentMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateAIResponse(content);
      const aiResponse: ChatMessageType = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        context_used: response.context
      };

      setCurrentMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Save to conversations
      const newMessages = [...currentMessages, userMessage, aiResponse];
      
      if (activeConversationId) {
        // Update existing conversation
        const updatedConversations = conversations.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: newMessages, updated_at: new Date().toISOString() }
            : conv
        );
        setConversations(updatedConversations);
        localStorage.setItem('officer_metova_conversations', JSON.stringify(updatedConversations));
      } else {
        // Create new conversation
        const newConversation: ChatConversation = {
          id: `officer-chat-${Date.now()}`,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: newMessages
        };
        const updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        setActiveConversationId(newConversation.id);
        localStorage.setItem('officer_metova_conversations', JSON.stringify(updatedConversations));
      }
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {!sidebarCollapsed && (
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onClearHistory={handleClearHistory}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b border-border p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Ask Metova</h1>
                <p className="text-xs text-muted-foreground">AI Assistant for Innovation Officers</p>
              </div>
            </div>
          </div>

          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {currentMessages.length === 0 ? (
                <OfficerWelcomeMessage />
              ) : (
                <>
                  {currentMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      userName={user?.name || 'You'}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground font-semibold text-sm">M</span>
                      </div>
                      <TypingIndicator />
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </Layout>
  );
}
