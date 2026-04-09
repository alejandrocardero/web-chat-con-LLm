import ReactMarkdown from 'react-markdown';
import { FileText, Mic, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-2 md:gap-3 px-3 md:px-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={cn("max-w-[80%] md:max-w-[75%] space-y-1", isUser && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-secondary text-foreground rounded-tl-sm border border-border"
        )}>
          {message.type === 'audio' && (
            <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
              <Mic className="h-3.5 w-3.5" />
              <span>Mensaje de audio</span>
            </div>
          )}
          {message.type === 'document' && message.file_name && (
            <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">{message.file_name}</span>
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="bg-black/30 px-1 py-0.5 rounded text-xs">{children}</code>
                  ) : (
                    <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto text-xs my-2">
                      <code>{children}</code>
                    </pre>
                  ),
                p: ({ children }) => <p className="my-1">{children}</p>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        <span className="text-[10px] text-muted-foreground px-1">
          {new Date(message.created_date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}