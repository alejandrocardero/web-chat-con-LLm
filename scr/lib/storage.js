// Simple storage utility using localStorage
const STORAGE_KEYS = {
  CONVERSATIONS: 'chat_llm_conversations',
  MESSAGES: 'chat_llm_messages',
  LLM_CONFIG: 'chat_llm_config'
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const storage = {
  // Conversations
  getConversations: () => {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveConversation: (conversation) => {
    const conversations = storage.getConversations();
    const newConv = { 
      ...conversation, 
      id: conversation.id || generateId(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    conversations.unshift(newConv);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    return newConv;
  },

  updateConversation: (id, updates) => {
    const conversations = storage.getConversations();
    const index = conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      conversations[index] = { 
        ...conversations[index], 
        ...updates,
        updated_date: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
      return conversations[index];
    }
    return null;
  },

  deleteConversation: (id) => {
    const conversations = storage.getConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    
    // Also delete associated messages
    const messages = storage.getMessages();
    const filteredMessages = messages.filter(m => m.conversation_id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filteredMessages));
  },

  // Messages
  getMessages: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  getMessagesByConversation: (conversationId) => {
    const messages = storage.getMessages();
    return messages.filter(m => m.conversation_id === conversationId);
  },

  saveMessage: (message) => {
    const messages = storage.getMessages();
    const newMessage = {
      ...message,
      id: message.id || generateId(),
      created_date: new Date().toISOString()
    };
    messages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return newMessage;
  },

  // LLM Config
  getLLMConfig: () => {
    const data = localStorage.getItem(STORAGE_KEYS.LLM_CONFIG);
    return data ? JSON.parse(data) : null;
  },

  saveLLMConfig: (config) => {
    localStorage.setItem(STORAGE_KEYS.LLM_CONFIG, JSON.stringify(config));
    return config;
  }
};
