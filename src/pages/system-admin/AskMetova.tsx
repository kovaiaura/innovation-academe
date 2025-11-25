import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatInput } from '@/components/student/ChatInput';
import { ChatMessage } from '@/components/student/ChatMessage';
import { ChatSidebar } from '@/components/student/ChatSidebar';
import { TypingIndicator } from '@/components/student/TypingIndicator';
import { mockSystemAdminChatConversations } from '@/data/mockSystemAdminChatData';
import { ChatConversation, ChatMessage as ChatMessageType } from '@/data/mockOfficerChatData';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  FileText, 
  DollarSign,
  ClipboardCheck,
  Sparkles
} from 'lucide-react';

export default function SystemAdminAskMetova() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [currentMessages, setCurrentMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversations from localStorage or use mock data
    const stored = localStorage.getItem('system_admin_metova_conversations');
    if (stored) {
      const parsedConversations = JSON.parse(stored);
      setConversations(parsedConversations);
      if (parsedConversations.length > 0) {
        setActiveConversationId(parsedConversations[0].id);
        setCurrentMessages(parsedConversations[0].messages);
      }
    } else {
      setConversations(mockSystemAdminChatConversations);
      localStorage.setItem('system_admin_metova_conversations', JSON.stringify(mockSystemAdminChatConversations));
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

  const generateSystemAdminAIResponse = (userMessage: string): { content: string; context: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('attendance') || lowerMessage.includes('staff')) {
      return {
        content: "**Staff Attendance Summary (November 2024)**\n\n• **Innovation Officers**: 94% avg attendance\n• **Managers**: 98% avg attendance\n• **Admin Staff**: 96% avg attendance\n\n**Top Performers:**\n1. Mr. Atif Ansari - 100%\n2. Mr. Saran T - 98%\n3. Mr. Sreeram R - 96%\n\n**Attention Needed:**\n• 2 officers below 85% threshold\n\nWould you like detailed reports?",
        context: ['staff_attendance', 'performance_tracking']
      };
    }
    
    if (lowerMessage.includes('institution') || lowerMessage.includes('performance') || lowerMessage.includes('performing')) {
      return {
        content: "**Institution Performance Overview**\n\n🏆 **Top Performing:**\n• Kikani Global Academy - 92% engagement\n• Modern School Vasant Vihar - 89% engagement\n\n📊 **Key Metrics:**\n• Student Enrollment: 870 total\n• Active Projects: 45\n• Course Completion: 78% avg\n\n💡 **Recommendations:**\n• Focus on project-based learning initiatives\n• Increase parent engagement programs",
        context: ['institutions', 'analytics', 'performance_metrics']
      };
    }
    
    if (lowerMessage.includes('contract') || lowerMessage.includes('renewal') || lowerMessage.includes('crm')) {
      return {
        content: "**CRM & Contract Status**\n\n📋 **Upcoming Renewals (30 days):**\n• Modern School - Dec 15, 2024\n• Kikani Global - Jan 5, 2025\n\n💰 **Revenue Pipeline:**\n• Pending: ₹12,50,000\n• Confirmed: ₹45,00,000\n\n📞 **Pending Communications:**\n• 8 follow-ups required\n• 3 high-priority tasks\n\nShall I generate detailed renewal reports?",
        context: ['crm', 'contracts', 'renewals']
      };
    }
    
    if (lowerMessage.includes('revenue') || lowerMessage.includes('financial') || lowerMessage.includes('report')) {
      return {
        content: "**Monthly Revenue Report (November 2024)**\n\n💵 **Total Revenue:** ₹58,75,000\n\n**Breakdown by Institution:**\n• Modern School: ₹25,50,000\n• Kikani Global: ₹33,25,000\n\n**Revenue Streams:**\n• LMS Subscriptions: 45%\n• Trainer Fees: 35%\n• Lab Setup: 20%\n\n📈 **Growth:** +15% vs October\n\nWould you like a detailed breakdown?",
        context: ['revenue', 'financial_reports', 'billing']
      };
    }
    
    if (lowerMessage.includes('inventory') || lowerMessage.includes('project') || lowerMessage.includes('operational') || lowerMessage.includes('task')) {
      return {
        content: "**Operational Insights**\n\n📦 **Inventory Status:**\n• Total Items: 1,245\n• Low Stock Alerts: 12 items\n• Pending Purchases: 5 requests\n\n🚀 **Project Tracking:**\n• Active Projects: 45\n• On Schedule: 32 (71%)\n• Behind Schedule: 8 (18%)\n• Completed This Month: 5\n\n⚠️ **Attention Required:**\n• 3 purchase requests awaiting approval\n• 2 projects need resource allocation",
        context: ['inventory', 'projects', 'operations']
      };
    }
    
    return {
      content: `I understand you're asking about: "${userMessage}"\n\nAs your AI Business Intelligence Assistant, I can help you with:\n\n• **Staff Management**: Attendance, payroll, performance tracking\n• **Institution Analytics**: Performance metrics, enrollment, engagement\n• **CRM**: Contract renewals, communications, tasks\n• **Financial Reports**: Revenue, invoices, billing\n• **Operations**: Inventory, projects, resource allocation\n\nWhat specific information would you like to know?`,
      context: ['general_assistance']
    };
  };

  const handleSend = (content: string) => {
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setCurrentMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateSystemAdminAIResponse(content);
      const aiResponse: ChatMessageType = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        context_used: response.context
      };

      setCurrentMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      const newMessages = [...currentMessages, userMessage, aiResponse];
      
      if (activeConversationId) {
        const updatedConversations = conversations.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: newMessages, updated_at: new Date().toISOString() }
            : conv
        );
        setConversations(updatedConversations);
        localStorage.setItem('system_admin_metova_conversations', JSON.stringify(updatedConversations));
      } else {
        const newConversation: ChatConversation = {
          id: `admin-chat-${Date.now()}`,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: newMessages
        };
        const updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        setActiveConversationId(newConversation.id);
        localStorage.setItem('system_admin_metova_conversations', JSON.stringify(updatedConversations));
      }
    }, 1500);
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setActiveConversationId(id);
      setCurrentMessages(conversation.messages);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    setCurrentMessages([]);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      setConversations([]);
      setActiveConversationId(undefined);
      setCurrentMessages([]);
      localStorage.removeItem('system_admin_metova_conversations');
      toast.success('Chat history cleared successfully');
    }
  };

  const suggestedPrompts = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Staff Attendance",
      prompt: "Generate attendance report for all managers for November 2024"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Institution Performance",
      prompt: "Which institutions are performing well this year?"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Contract Renewals",
      prompt: "Show me all contracts expiring in the next 30 days"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Revenue Report",
      prompt: "Generate monthly revenue report by institution for November 2024"
    },
    {
      icon: <ClipboardCheck className="h-5 w-5" />,
      title: "CRM Tasks",
      prompt: "What CRM tasks are pending and on hold?"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Operational Insights",
      prompt: "Show me inventory status and projects behind schedule"
    }
  ];

  const WelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Ask Metova</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Your AI-powered business intelligence assistant
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Generate reports, analyze data, and get insights on attendance, revenue, 
            institution performance, CRM activities, and operational metrics - all in natural language.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Try asking me about:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedPrompts.map((item, index) => (
              <Card
                key={index}
                className="p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleSend(item.prompt)}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary">
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.prompt}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What I Can Help You With
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Reports:</strong> Attendance, revenue, financial, operational reports</li>
            <li>• <strong>Analytics:</strong> Institution performance, engagement metrics, trends</li>
            <li>• <strong>CRM:</strong> Contract renewals, communication logs, pending tasks</li>
            <li>• <strong>Operations:</strong> Inventory status, project tracking, resource allocation</li>
            <li>• <strong>Insights:</strong> Data-driven recommendations and forecasts</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Ask Metova</h1>
            <p className="text-sm text-muted-foreground">AI Business Intelligence Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onClearHistory={handleClearHistory}
        />

        <div className="flex-1 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="flex-1">
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              {currentMessages.length === 0 ? (
                <WelcomeMessage />
              ) : (
                <>
                  {currentMessages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <TypingIndicator />
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-background">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSend={handleSend} disabled={isTyping} />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Ask Metova can generate reports and insights based on your data. Always verify important information.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
