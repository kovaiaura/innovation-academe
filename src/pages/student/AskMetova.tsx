import { Layout } from "@/components/layout/Layout";
import { WelcomeMessage } from "@/components/student/WelcomeMessage";
import { ChatMessage } from "@/components/student/ChatMessage";
import { ChatInput } from "@/components/student/ChatInput";
import { ChatSidebar } from "@/components/student/ChatSidebar";
import { TypingIndicator } from "@/components/student/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";
import { useAskMetova } from "@/hooks/useAskMetova";

export default function AskMetova() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const {
    conversations,
    activeConversationId,
    currentMessages,
    isLoading,
    scrollAreaRef,
    sendMessage,
    handleNewChat,
    handleSelectConversation,
    handleClearHistory,
    userName
  } = useAskMetova('student');

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
                      userName={userName}
                    />
                  ))}
                  {isLoading && (
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

          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </Layout>
  );
}
