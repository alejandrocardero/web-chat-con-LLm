// Local storage based client - no Base44 dependency
import { storage } from '@/lib/storage';

// Mock base44 client using localStorage
const base44 = {
  entities: {
    Conversation: {
      list: (orderBy = '-updated_date', limit = 50) => {
        let conversations = storage.getConversations();
        // Simple ordering
        if (orderBy.startsWith('-')) {
          const field = orderBy.substring(1);
          conversations.sort((a, b) => new Date(b[field]) - new Date(a[field]));
        }
        return conversations.slice(0, limit);
      },
      create: (data) => storage.saveConversation(data),
      update: (id, data) => storage.updateConversation(id, data),
      delete: (id) => storage.deleteConversation(id)
    },
    Message: {
      filter: (filters, orderBy = 'created_date', limit = 200) => {
        let messages = storage.getMessages();
        if (filters.conversation_id) {
          messages = messages.filter(m => m.conversation_id === filters.conversation_id);
        }
        // Simple ordering
        if (orderBy.startsWith('-')) {
          const field = orderBy.substring(1);
          messages.sort((a, b) => new Date(b[field]) - new Date(a[field]));
        } else {
          messages.sort((a, b) => new Date(a[field]) - new Date(b[field]));
        }
        return messages.slice(0, limit);
      },
      create: (data) => storage.saveMessage(data)
    },
    LLMConfig: {
      list: () => {
        const config = storage.getLLMConfig();
        return config ? [config] : [];
      },
      create: (data) => {
        storage.saveLLMConfig(data);
        return data;
      },
      update: (id, data) => {
        storage.saveLLMConfig(data);
        return data;
      }
    }
  },
  auth: {
    me: async () => ({ id: 'local-user', name: 'Local User' }),
    logout: () => {},
    redirectToLogin: () => {}
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        // For local storage, we can't actually upload files
        // Return a placeholder URL
        return { file_url: URL.createObjectURL(file) };
      }
    }
  }
};

export { base44 };
