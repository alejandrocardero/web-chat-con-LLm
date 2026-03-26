import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import LLMSettingsModal from '../components/chat/LLMSettingsModal';
import { Bot, Menu, X } from 'lucide-react';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [llmConfig, setLlmConfig] = useState(null);
  const [sending, setSending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);

  // Default Ollama config
  const defaultLlmConfig = {
    base_url: 'http://localhost:11434/v1',
    model: 'glm-4.6:cloud',
    api_key: '',
    temperature: 0.7,
    max_tokens: 2048
  };

  useEffect(() => {
    loadConversations();
    loadLLMConfig();
  }, []);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const list = await base44.entities.Conversation.list('-updated_date', 50);
    setConversations(list);
    if (list.length > 0 && !activeId) setActiveId(list[0].id);
  };

  const loadMessages = async (convId) => {
    const msgs = await base44.entities.Message.filter({ conversation_id: convId }, 'created_date', 200);
    setMessages(msgs);
  };

  const loadLLMConfig = async () => {
    const list = await base44.entities.LLMConfig.list();
    if (list.length > 0) {
      setLlmConfig(list[0]);
    } else {
      // Use default config if none saved
      setLlmConfig(defaultLlmConfig);
    }
  };

  const createConversation = async () => {
    const conv = await base44.entities.Conversation.create({ title: `Chat ${conversations.length + 1}`, model: llmConfig?.model || '' });
    setConversations(p => [conv, ...p]);
    setActiveId(conv.id);
    setMessages([]);
  };

  const deleteConversation = async (id) => {
    await base44.entities.Conversation.delete(id);
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeId === id) {
      setActiveId(updated[0]?.id || null);
      setMessages([]);
    }
  };

  const renameConversation = async (id, title) => {
    await base44.entities.Conversation.update(id, { title });
    setConversations(p => p.map(c => c.id === id ? { ...c, title } : c));
  };

  const sendMessage = async ({ text, attachment }) => {
    if (!activeId) {
      console.error('No hay conversación activa');
      return;
    }
    
    const currentConfig = llmConfig || defaultLlmConfig;
    
    // Build user message content
    let content = text || '';
    let type = 'text';
    let file_url = null;
    let file_name = null;
    let documentContent = null;

    if (attachment) {
      type = attachment.type;
      file_name = attachment.name;
      
      if (attachment.type === 'document' && attachment.content) {
        // Document was uploaded - extract and include content
        documentContent = attachment.content;
        file_url = 'document'; // Marker for document content
        if (!content) {
          content = `Analiza este documento y responde mis preguntas sobre él.\n\n[Documento: ${attachment.name}]\n\n${documentContent}`;
        } else {
          content = `${text}\n\n[Documento adjunto: ${attachment.name}]\n\n${documentContent}`;
        }
      } else if (attachment.type === 'audio') {
        if (!content) content = '[Mensaje de audio]';
      }
    }

    console.log('Enviando mensaje...', { text, attachment, config: currentConfig, hasDocContent: !!documentContent });

    const userMsg = await base44.entities.Message.create({ conversation_id: activeId, role: 'user', content, type, file_url, file_name });
    setMessages(p => [...p, userMsg]);

    setSending(true);

    try {
      // Build context for LLM - include conversation history
      const history = [...messages, userMsg].map(m => {
        // For document messages, include the full content
        if (m.type === 'document' && m.file_url === 'document') {
          return { role: m.role, content: m.content };
        }
        return { role: m.role, content: m.content };
      });
      
      console.log('Historial:', history.length, 'mensajes');

      const apiUrl = `${currentConfig.base_url}/chat/completions`;
      console.log('Llamando a:', apiUrl);

      // Call Ollama API with streaming
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentConfig.api_key ? { Authorization: `Bearer ${currentConfig.api_key}` } : {}),
        },
        body: JSON.stringify({
          model: currentConfig.model,
          messages: history,
          temperature: currentConfig.temperature ?? 0.7,
          max_tokens: currentConfig.max_tokens ?? 8192,
          stream: true, // Enable streaming
        }),
      });

      console.log('Respuesta status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Create placeholder for assistant message
      const assistantMsgId = Date.now().toString();
      let assistantText = '';
      
      // Add placeholder message
      setMessages(p => [...p, { 
        id: assistantMsgId, 
        conversation_id: activeId, 
        role: 'assistant', 
        content: '', 
        type: 'text',
        created_date: new Date().toISOString()
      }]);

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              assistantText += delta;
              
              // Update message content in real-time
              setMessages(p => p.map(m => 
                m.id === assistantMsgId 
                  ? { ...m, content: assistantText }
                  : m
              ));
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Save final message to storage
      const finalMsg = await base44.entities.Message.create({
        conversation_id: activeId,
        role: 'assistant',
        content: assistantText,
        type: 'text',
      });

      // Replace placeholder with real message
      setMessages(p => p.map(m => m.id === assistantMsgId ? finalMsg : m));

      // Update conversation preview
      await base44.entities.Conversation.update(activeId, { preview: assistantText.slice(0, 100) });
      setConversations(p => p.map(c => c.id === activeId ? { ...c, preview: assistantText.slice(0, 100) } : c));
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeId);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col h-full transition-all`}>
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={createConversation}
          onDelete={deleteConversation}
          onRename={renameConversation}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0">
          <button onClick={() => setSidebarOpen(p => !p)} className="md:hidden text-muted-foreground hover:text-foreground">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{activeConv?.title || 'Selecciona un chat'}</p>
            {llmConfig && <p className="text-[11px] text-muted-foreground">{llmConfig.model}</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {!activeId && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <p className="text-foreground font-medium">Bienvenido a Chat LLM</p>
              <p className="text-xs text-muted-foreground">Crea una nueva conversación o selecciona una existente para comenzar.</p>
            </div>
          )}

          {activeId && messages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-8">
              <p className="text-muted-foreground text-sm">Envía un mensaje para iniciar la conversación.</p>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {sending && (
            <div className="flex gap-3 px-4 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-4 py-2.5">
                <div className="flex gap-1 items-center h-5">
                  <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {activeId && (
          <ChatInput onSend={sendMessage} disabled={false} isSending={sending} />
        )}
      </div>

      <LLMSettingsModal open={settingsOpen} onClose={() => { setSettingsOpen(false); loadLLMConfig(); }} />
    </div>
  );
}