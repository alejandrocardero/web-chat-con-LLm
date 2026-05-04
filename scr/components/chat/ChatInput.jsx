import { useState, useRef } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDocumentExtractor } from '@/hooks/useDocumentExtractor';

const STT_API_URL = `${window.location.origin}/stt-api/transcribe`;
const TTS_API_URL = `${window.location.origin}/tts-api/synthesize`;

/**
 * Check if browser has Speech Recognition API (works locally on mobile)
 */
const hasBrowserSTT = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractingText, setExtractingText] = useState('');
  const [extractionStatus, setExtractionStatus] = useState(null); // 'extracting' | 'done' | 'error'
  const { extractText, extracting } = useDocumentExtractor();
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const handleSend = () => {
    if ((!text.trim() && !attachment && !extractingText) || disabled) return;
    const messageText = extractingText ? `${extractingText}\n\n---Pregunta sobre el documento---` : text.trim();
    onSend({ text: messageText, attachment });
    setText('');
    setAttachment(null);
    setExtractingText('');
    setExtractionStatus(null);
  };

const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Use browser's speech recognition (no server needed)
  const startBrowserRecording = () => {
    return new Promise((resolve) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        resolve(null);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      let finalTranscript = '';
      
      recognition.onresult = (event) => {
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onend = () => {
        resolve(finalTranscript.trim());
      };

      recognition.onerror = () => {
        resolve('');
      };

      recognition.start();
    });
  };

  // Server-based transcription for PC
  const transcribeWithServer = async (audioBlob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const response = await fetch(STT_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text?.trim() || '';
    } catch (error) {
      console.error('Error al transcribir audio:', error);
      return '';
    } finally {
      setTranscribing(false);
    }
  };

  /**
   * Start voice recording
   * Mobile: browser Speech API (no server)
   * PC: MediaRecorder + server STT
   */
  const startRecording = async () => {
    if (hasBrowserSTT()) {
      // Mobile: use browser's built-in STT (no server needed!)
      setRecording(true);
      const text = await startBrowserRecording();
      setRecording(false);
      if (text) {
        onSend({ text, attachment: null });
      }
      return;
    }

    // PC: use MediaRecorder + server STT
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        const transcribedText = await transcribeWithServer(blob);
        if (transcribedText) {
          onSend({ text: transcribedText, attachment: null });
        }
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAttachment({ file, name: file.name, type: 'document', url: null });
    setExtractingText('');
    setExtractionStatus('extracting');
    e.target.value = '';
    
    try {
      const extracted = await extractText(file);
      setExtractingText(extracted || '');
      setExtractionStatus('done');
    } catch (err) {
      console.error('Error extracting:', err);
      setExtractionStatus('error');
    }
  };

  return (
    <div className="px-3 md:px-4 pb-3 md:pb-4 pt-2">
      {/* Attachment preview with extraction status */}
      {attachment && (
        <div className="flex items-start gap-2 mb-2 px-3 py-2 bg-secondary rounded-xl border border-border text-xs text-foreground">
          {attachment.type === 'audio' ? <Mic className="h-3.5 w-3.5 text-primary mt-0.5" /> : <FileText className="h-3.5 w-3.5 text-primary mt-0.5" />}
          <div className="flex-1 min-w-0">
            <span className="block truncate">{attachment.name}</span>
            {extractionStatus === 'extracting' && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Extrayendo texto...
              </span>
            )}
            {extractionStatus === 'done' && extractingText && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle className="h-3 w-3" />
                ✓ Texto extraído
              </span>
            )}
            {extractionStatus === 'done' && !extractingText && (
              <span className="flex items-center gap-1 text-yellow-500">
                <AlertCircle className="h-3 w-3" />
                No se pudo extraer (PDF)
              </span>
            )}
            {extractionStatus === 'error' && (
              <span className="flex items-center gap-1 text-red-500">
                <AlertCircle className="h-3 w-3" />
                Error al extraer
              </span>
            )}
          </div>
          <button onClick={() => { setAttachment(null); setExtractingText(''); setExtractionStatus(null); }} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-secondary rounded-2xl border border-border px-2 md:px-3 py-2">
        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,.csv,.json" className="hidden" onChange={handleFile} />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || recording || transcribing}
          className="p-2 text-muted-foreground hover:text-primary transition-colors shrink-0 mb-0.5"
        >
          <Paperclip className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={transcribing ? 'Transcribiendo...' : 'Escribe un mensaje o usa el micrófono...'}
          disabled={disabled || recording || transcribing}
          rows={1}
          className={cn(
            "flex-1 bg-transparent outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground max-h-32 py-0.5 min-h-[24px]",
            "leading-relaxed"
          )}
          style={{ height: 'auto', minHeight: '24px' }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
        />

        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled || transcribing || !!attachment}
          className={cn(
            "p-2 shrink-0 mb-0.5 transition-colors",
            recording ? "text-red-400 animate-pulse" : transcribing ? "text-yellow-400 animate-pulse" : "text-muted-foreground hover:text-primary"
          )}
          title={transcribing ? 'Transcribiendo audio...' : recording ? 'Detener grabación' : 'Grabar audio'}
        >
          {transcribing ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : recording ? (
            <MicOff className="h-[18px] w-[18px]" />
          ) : (
            <Mic className="h-[18px] w-[18px]" />
          )}
        </button>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || transcribing || (!text.trim() && !attachment && !extractingText)}
          className="h-9 w-9 md:h-8 md:w-8 rounded-xl shrink-0 bg-primary hover:bg-primary/90"
        >
          {disabled || transcribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {/* Transcribing indicator */}
      {transcribing && (
        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 text-xs text-yellow-400/80">
          <Loader2 className="h-3 w-3 animate-spin" />
          Transcribiendo audio a texto...
        </div>
      )}
    </div>
  );
}