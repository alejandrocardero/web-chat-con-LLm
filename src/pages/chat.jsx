import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import LLMSettingsModal from '../components/chat/LLMSettingsModal';
import { Bot, Menu, X } from 'lucide-react';

// Build a chat prompt from message history (for Hugging Face models)
function buildPromptFromHistory(history) {
  // Format for Llama-3.1/Mistral-style models
  let prompt = '';
  for (const msg of history) {
    if (msg.role === 'user') {
      prompt += `<|start_header_id|>user<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
    } else if (msg.role === 'assistant') {
      prompt += `<|start_header_id|>assistant<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
    }
  }
  prompt += `<|start_header_id|>assistant<|end_header_id|>\n\n`;
  return prompt;
}

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [llmConfig, setLlmConfig] = useState(null);
  const [sending, setSending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

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

  const DEFAULT_HF_TOKEN = '';

  const loadLLMConfig = async () => {
    const list = await base44.entities.LLMConfig.list();
    if (list.length > 0) {
      const cfg = list[0];
      setLlmConfig({
        provider: cfg.provider || 'huggingface',
        base_url: cfg.base_url || 'https://router.huggingface.co/v1',
        model: cfg.model || 'meta-llama/Llama-3.2-1B-Instruct',
        api_key: cfg.provider === 'huggingface' ? DEFAULT_HF_TOKEN : (cfg.api_key || ''),
        temperature: cfg.temperature ?? 0.7,
        max_tokens: cfg.max_tokens ?? 2048
      });
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
    if (!activeId) return;
    if (!llmConfig) {
      // On mobile, show a prompt instead of opening the modal directly
      const shouldOpen = window.confirm('No tienes configurado un modelo LLM. ¿Deseas configurarlo ahora?');
      if (shouldOpen) {
        setSettingsOpen(true);
      }
      return;
    }

    // Build user message content
    let content = text || '';
    let type = 'text';
    let file_url = null;
    let file_name = null;

    if (attachment) {
      type = attachment.type;
      file_name = attachment.name;
      // Upload file
      const { file_url: url } = await base44.integrations.Core.UploadFile({ file: attachment.file });
      file_url = url;
      if (!content) content = attachment.type === 'audio' ? '[Mensaje de audio]' : `[Documento: ${attachment.name}]`;
    }

    const userMsg = await base44.entities.Message.create({ conversation_id: activeId, role: 'user', content, type, file_url, file_name });
    setMessages(p => [...p, userMsg]);

    setSending(true);

    // Build context for LLM
    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    let assistantText = '';

    // Call API based on provider
if (llmConfig.provider === 'huggingface') {
      const apiUrl = `${window.location.origin}/hf-api/chat/completions`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmConfig.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: history,
          temperature: llmConfig.temperature ?? 0.7,
          max_tokens: llmConfig.max_tokens ?? 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        assistantText = `Error del modelo: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`;
      } else {
        const data = await response.json();
        assistantText = data.choices?.[0]?.message?.content || 'Sin respuesta del modelo.';
      }
    } else if (llmConfig.provider === 'custom') {
      // Custom SLM API (your own deployed service)
      const apiUrl = `${llmConfig.base_url}/v1/chat/completions`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(llmConfig.api_key ? { Authorization: `Bearer ${llmConfig.api_key}` } : {}),
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: history,
          temperature: llmConfig.temperature ?? 0.7,
          max_tokens: llmConfig.max_tokens ?? 2048,
        }),
        // First request may take time to load model
        signal: AbortSignal.timeout(180000), // 3 min timeout
      });

      if (!response.ok) {
        const errorData = await response.json();
        assistantText = `Error del modelo: ${response.status} - ${errorData.detail || JSON.stringify(errorData)}`;
      } else {
        const data = await response.json();
        assistantText = data.choices?.[0]?.message?.content || 'Sin respuesta del modelo.';
      }
    } else {
      // OpenAI-compatible API (Ollama, OpenAI, etc.)
      const response = await fetch(`${llmConfig.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(llmConfig.api_key ? { Authorization: `Bearer ${llmConfig.api_key}` } : {}),
        },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: history,
          temperature: llmConfig.temperature ?? 0.7,
          max_tokens: llmConfig.max_tokens ?? 2048,
          stream: false,
        }),
      });

      const data = await response.json();
      assistantText = data.choices?.[0]?.message?.content || 'Sin respuesta del modelo.';
    }

    const assistantMsg = await base44.entities.Message.create({
      conversation_id: activeId,
      role: 'assistant',
      content: assistantText,
      type: 'text',
    });

    setMessages(p => [...p, assistantMsg]);

    // Update conversation preview
    await base44.entities.Conversation.update(activeId, { preview: assistantText.slice(0, 100) });
    setConversations(p => p.map(c => c.id === activeId ? { ...c, preview: assistantText.slice(0, 100) } : c));

    setSending(false);
  };

  const activeConv = conversations.find(c => c.id === activeId);

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col h-full fixed md:relative z-40 md:z-auto w-[calc(100%-4rem)] sm:w-72 md:w-auto transition-all`}>
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
          onCreate={() => { createConversation(); setSidebarOpen(false); }}
          onDelete={deleteConversation}
          onRename={renameConversation}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-3 md:px-4 py-3.5 border-b border-border shrink-0">
          <button onClick={() => setSidebarOpen(p => !p)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
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
        <div className="flex-1 overflow-y-auto py-3 md:py-4 space-y-3">
          {!activeId && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 md:px-8">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <p className="text-sm md:text-base text-foreground font-medium">Bienvenido a Chat con SLMs</p>
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
            <div className="flex gap-3 px-3 md:px-4 justify-start">
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
          <ChatInput onSend={sendMessage} disabled={sending} />
        )}
      </div>

      <LLMSettingsModal open={settingsOpen} onClose={() => { setSettingsOpen(false); loadLLMConfig(); }} />
    </div>
  );
}