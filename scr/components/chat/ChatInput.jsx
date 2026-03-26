import { useState, useRef } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ChatInput({ onSend, disabled, isSending }) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if ((!text.trim() && !attachment) || disabled || isSending) return;
    onSend({ text: text.trim(), attachment });
    setText('');
    setAttachment(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });
      stream.getTracks().forEach(t => t.stop());
      setAttachment({ file, name: file.name, type: 'audio', url: URL.createObjectURL(blob) });
      setRecording(false);
    };
    mediaRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setExtracting(true);
    try {
      const { extractTextFromFile, truncateText } = await import('@/lib/documentExtractor');
      const { text, type } = await extractTextFromFile(file);
      
      setAttachment({ 
        file, 
        name: file.name, 
        type: 'document', 
        url: null,
        content: truncateText(text, 8000), // Extract and truncate
        fileType: type
      });
    } catch (error) {
      console.error('Error extracting text:', error);
      alert(`Error al leer el documento: ${error.message}\n\nFormatos soportados: TXT, MD, DOCX, JSON, CSV`);
    } finally {
      setExtracting(false);
    }
    e.target.value = '';
  };

  return (
    <div className="px-4 pb-4 pt-2">
      {attachment && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-secondary rounded-xl border border-border text-xs text-foreground">
          {attachment.type === 'audio' ? (
            <Mic className="h-3.5 w-3.5 text-primary" />
          ) : extracting ? (
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="flex-1 truncate">
            {extracting ? 'Leyendo documento...' : attachment.name}
            {attachment.fileType && ` (${attachment.fileType})`}
          </span>
          {!extracting && (
            <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-end gap-2 bg-secondary rounded-2xl border border-border px-3 py-2">
        <input ref={fileInputRef} type="file" accept=".txt,.md,.docx,.json,.csv" className="hidden" onChange={handleFile} />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={extracting || recording}
          className="text-muted-foreground hover:text-primary transition-colors shrink-0 mb-0.5"
        >
          {extracting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Paperclip className="h-4.5 w-4.5 h-[18px] w-[18px]" />}
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          disabled={recording}
          rows={1}
          className={cn(
            "flex-1 bg-transparent outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground max-h-32 py-0.5",
            "leading-relaxed"
          )}
          style={{ height: 'auto', minHeight: '24px' }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
        />

        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={!!attachment || recording}
          className={cn(
            "shrink-0 mb-0.5 transition-colors",
            recording ? "text-red-400 animate-pulse" : "text-muted-foreground hover:text-primary"
          )}
        >
          {recording ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
        </button>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !attachment)}
          className="h-8 w-8 rounded-xl shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}