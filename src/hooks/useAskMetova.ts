import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context_used?: string[];
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

type Role = 'student' | 'officer' | 'system_admin';

const STORAGE_KEYS: Record<Role, string> = {
  student: 'metova_conversations',
  officer: 'officer_metova_conversations',
  system_admin: 'system_admin_metova_conversations'
};

export function useAskMetova(role: Role) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIDisabled, setIsAIDisabled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const storageKey = STORAGE_KEYS[role];

  // Check AI enabled status on mount
  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const { data } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'ask_metova_settings')
        .single();

      if (data?.value) {
        const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setIsAIDisabled(!settings.enabled);
      }
    } catch (e) {
      console.error('Error checking AI status:', e);
    }
  };

  // Load conversations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsedConversations = JSON.parse(stored);
        setConversations(parsedConversations);
        if (parsedConversations.length > 0) {
          setActiveConversationId(parsedConversations[0].id);
          setCurrentMessages(parsedConversations[0].messages);
        }
      } catch (e) {
        console.error('Error parsing stored conversations:', e);
      }
    }
  }, [storageKey]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [currentMessages, isLoading]);

  const handleNewChat = useCallback(() => {
    setActiveConversationId(undefined);
    setCurrentMessages([]);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setActiveConversationId(id);
      setCurrentMessages(conversation.messages);
    }
  }, [conversations]);

  const handleClearHistory = useCallback(() => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      setConversations([]);
      setActiveConversationId(undefined);
      setCurrentMessages([]);
      localStorage.removeItem(storageKey);
      toast.success('Chat history cleared');
    }
  }, [storageKey]);

  const sendMessage = useCallback(async (content: string) => {
    // Check if AI is disabled before sending
    if (isAIDisabled) {
      const disabledMessage: ChatMessage = {
        id: `msg-${Date.now()}-disabled`,
        role: 'assistant',
        content: '🚫 **AI Assistant is Currently Disabled**\n\nThe AI assistant has been temporarily disabled by the administrator. Please try again later or contact your system administrator for more information.',
        timestamp: new Date().toISOString()
      };
      setCurrentMessages([...currentMessages, disabledMessage]);
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const messagesWithUser = [...currentMessages, userMessage];
    setCurrentMessages(messagesWithUser);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ask-metova', {
        body: {
          message: content,
          role,
          conversationHistory: currentMessages,
          userId: user?.id
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response');
      }

      // Check if AI is disabled from the response
      if (data?.disabled) {
        setIsAIDisabled(true);
        const disabledMessage: ChatMessage = {
          id: `msg-${Date.now()}-disabled`,
          role: 'assistant',
          content: '🚫 **AI Assistant is Currently Disabled**\n\nThe AI assistant has been temporarily disabled by the administrator. Please try again later or contact your system administrator for more information.',
          timestamp: new Date().toISOString()
        };
        setCurrentMessages([...messagesWithUser, disabledMessage]);
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const aiResponse: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        context_used: data.context
      };

      const newMessages = [...messagesWithUser, aiResponse];
      setCurrentMessages(newMessages);

      // Save to localStorage
      if (activeConversationId) {
        const updatedConversations = conversations.map(conv =>
          conv.id === activeConversationId
            ? { ...conv, messages: newMessages, updated_at: new Date().toISOString() }
            : conv
        );
        setConversations(updatedConversations);
        localStorage.setItem(storageKey, JSON.stringify(updatedConversations));
      } else {
        const newConversation: ChatConversation = {
          id: `${role}-chat-${Date.now()}`,
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: newMessages
        };
        const updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        setActiveConversationId(newConversation.id);
        localStorage.setItem(storageKey, JSON.stringify(updatedConversations));
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to get AI response. Please try again.');
      
      // Remove the user message if the API call failed
      setCurrentMessages(currentMessages);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessages, role, user?.id, activeConversationId, conversations, storageKey, isAIDisabled]);

  return {
    conversations,
    activeConversationId,
    currentMessages,
    isLoading,
    isAIDisabled,
    scrollAreaRef,
    sendMessage,
    handleNewChat,
    handleSelectConversation,
    handleClearHistory,
    userName: user?.name || 'You'
  };
}
