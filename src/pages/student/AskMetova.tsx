import { Layout } from "@/components/layout/Layout";
import { WelcomeMessage } from "@/components/student/WelcomeMessage";
import { ChatMessage } from "@/components/student/ChatMessage";
import { ChatInput } from "@/components/student/ChatInput";
import { ChatSidebar } from "@/components/student/ChatSidebar";
import { TypingIndicator } from "@/components/student/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChatConversation, ChatMessage as ChatMessageType, mockChatConversations } from "@/data/mockChatData";
import { useAuth } from "@/contexts/AuthContext";

export default function AskMetova() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [currentMessages, setCurrentMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversations from localStorage or use mock data
    const stored = localStorage.getItem('metova_conversations');
    if (stored) {
      const parsedConversations = JSON.parse(stored);
      setConversations(parsedConversations);
      if (parsedConversations.length > 0) {
        setActiveConversationId(parsedConversations[0].id);
        setCurrentMessages(parsedConversations[0].messages);
      }
    } else {
      setConversations(mockChatConversations);
      localStorage.setItem('metova_conversations', JSON.stringify(mockChatConversations));
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
      localStorage.removeItem('metova_conversations');
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    // Mock AI responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing')) {
      return "Based on your current progress:\n\n• **Data Science**: 65% complete - You're making steady progress\n• **Web Development**: 80% complete - Excellent work!\n• **AI & Machine Learning**: 45% complete\n\nYour overall performance is strong with an 85% average. Keep up the good work!";
    }
    
    if (lowerMessage.includes('assignment') || lowerMessage.includes('deadline')) {
      return "You have **2 pending assignments**:\n\n1. **Data Science Assignment 3** - Due in 2 days\n   - Topic: Statistical Analysis\n   - Estimated time: 3-4 hours\n\n2. **Web Development Project** - Due in 5 days\n   - Topic: React Components\n   - Estimated time: 5-6 hours\n\nI recommend starting with the Data Science assignment first!";
    }
    
    if (lowerMessage.includes('attendance')) {
      return "Your attendance record:\n\n• **Overall Attendance**: 85%\n• **Data Science**: 90%\n• **Web Development**: 82%\n• **AI & Machine Learning**: 83%\n\nYou're doing well! Keep maintaining above 80% to stay in good standing.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return "I can help you with:\n\n• Track your course progress and grades\n• View upcoming assignments and deadlines\n• Check your attendance records\n• Provide study tips and recommendations\n• Answer questions about your courses\n• Guide you on career paths\n\nWhat would you like to know?";
    }
    
    return `I understand you're asking about: "${userMessage}"\n\nBased on your student profile, I'd be happy to provide more specific information. Could you please clarify what aspect you'd like to know more about? I can help with courses, assignments, attendance, or general learning guidance.`;
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
      const aiResponse: ChatMessageType = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date().toISOString(),
        context_used: ['course_progress', 'attendance', 'assignments']
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
        localStorage.setItem('metova_conversations', JSON.stringify(updatedConversations));
      } else {
        // Create new conversation
        const newConversation: ChatConversation = {
          id: `chat-${Date.now()}`,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: newMessages
        };
        const updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        setActiveConversationId(newConversation.id);
        localStorage.setItem('metova_conversations', JSON.stringify(updatedConversations));
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
                <p className="text-xs text-muted-foreground">AI Learning Assistant</p>
              </div>
            </div>
          </div>

          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {currentMessages.length === 0 ? (
                <WelcomeMessage />
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
