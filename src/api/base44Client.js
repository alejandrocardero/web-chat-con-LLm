// Mock client for development without chat SLM SDK
// Replace with actual chat SLM SDK when available

// Manual UUID generator (works over HTTP, unlike crypto.randomUUID)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const createMockStorage = (key) => ({
  list: async () => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  create: async (item) => {
    const data = localStorage.getItem(key);
    const list = data ? JSON.parse(data) : [];
    const newItem = { 
      ...item, 
      id: generateUUID(), 
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    list.unshift(newItem);
    localStorage.setItem(key, JSON.stringify(list));
    return newItem;
  },
  update: async (id, updates) => {
    const data = localStorage.getItem(key);
    const list = data ? JSON.parse(data) : [];
    const index = list.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Not found');
    list[index] = { ...list[index], ...updates, updated_date: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(list));
    return list[index];
  },
  delete: async (id) => {
    const data = localStorage.getItem(key);
    const list = data ? JSON.parse(data) : [];
    const filtered = list.filter(i => i.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  },
  filter: async (criteria, sortBy = 'created_date', limit = 100) => {
    const data = localStorage.getItem(key);
    const list = data ? JSON.parse(data) : [];
    let filtered = list;
    if (criteria) {
      const entries = Object.entries(criteria);
      filtered = list.filter(item => 
        entries.every(([k, v]) => item[k] === v)
      );
    }
    filtered.sort((a, b) => {
      const dir = sortBy.startsWith('-') ? -1 : 1;
      const field = sortBy.replace('-', '');
      return dir * (new Date(b[field]) - new Date(a[field]));
    });
    return filtered.slice(0, limit);
  }
});

export const base44 = {
  entities: {
    Conversation: createMockStorage('conversations'),
    Message: createMockStorage('messages'),
    LLMConfig: createMockStorage('llmConfigs')
  },
  auth: {
    me: async () => ({ id: 'mock-user', name: 'Demo User' }),
    logout: (redirectUrl) => {
      localStorage.removeItem('base44_token');
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        // Mock file upload - returns a local URL
        return { file_url: URL.createObjectURL(file) };
      }
    }
  }
};
