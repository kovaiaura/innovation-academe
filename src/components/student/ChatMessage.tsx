import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ChatMessage as ChatMessageType } from "@/data/mockChatData";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
  userName?: string;
  userAvatar?: string;
}

export function ChatMessage({ message, userName = "You", userAvatar }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            M
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-medium text-foreground">
            {isUser ? userName : 'Metova'}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
        </div>

        <div className={`relative ${isUser ? 'max-w-[80%]' : 'max-w-[85%]'}`}>
          <div 
            className={`px-4 py-3 rounded-2xl ${
              isUser 
                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                : 'bg-muted text-foreground rounded-tl-sm'
            }`}
          >
            {isUser ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0 whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-accent [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs [&_tr:nth-child(even)]:bg-accent/30 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:bg-accent [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-accent [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-2 [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_hr]:my-3 [&_strong]:font-semibold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {!isUser && message.context_used && message.context_used.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.context_used.map((context, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {context.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}

          {!isUser && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
