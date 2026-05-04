import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Mic, User, Bot, Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TTS_API_URL = 'https://8002-01kp9rrxbcsd6cndbwf3qk8r6m.cloudspaces.litng.ai/synthesize';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const [ttsError, setTtsError] = useState(null);

  const playAudio = async () => {
    if (playing || !message.content) return;
    setPlaying(true);
    setTtsError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const response = await fetch(TTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`TTS error: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('TTS response empty');
      }
      const blob = new Blob([buffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setPlaying(false);
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setTtsError('TTS no disponible (servidor no encontrado)');
      setPlaying(false);
    }
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  return (
    <div className={cn("flex gap-2 md:gap-3 px-2 md:px-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
        </div>
      )}

      <div className={cn("max-w-[85%] md:max-w-[75%] space-y-0.5 md:space-y-1", isUser && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-2xl px-3 py-2 md:px-4 md:py-2.5 text-sm leading-relaxed",
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
              <span className="truncate max-w-[150px] md:max-w-[200px]">{message.file_name}</span>
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

        <span className="text-[10px] text-muted-foreground px-1 flex items-center gap-1 flex-wrap">
          {new Date(message.created_date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          {!isUser && message.content && (
            <button
              onClick={playing ? stopAudio : playAudio}
              disabled={playing}
              className="ml-1 p-1 hover:text-primary transition-colors"
              title={playing ? 'Detener' : 'Escuchar'}
            >
              {playing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
            </button>
          )}
          {ttsError && <span className="text-yellow-400">{ttsError}</span>}
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