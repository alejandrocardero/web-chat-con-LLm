// Local authentication service for development
// Stores users in localStorage with hashed passwords

const USERS_KEY = 'nexus_chat_users';
const SESSION_KEY = 'nexus_chat_session';

// Manual UUID generator (works over HTTP, unlike crypto.randomUUID)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Simple synchronous hash (replace with bcrypt in production)
// Uses a string-based hash instead of crypto.subtle to work over HTTP
function hashPassword(password) {
  const salt = 'nexus-salt-2026';
  const data = password + salt;
  // djb2 hash - simple, fast, works everywhere (no HTTPS needed)
  let hash = 5381;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) + hash + data.charCodeAt(i)) & 0xFFFFFFFF;
  }
  // Return as hex string for consistency with localStorage
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function getUsers() {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const authService = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User display name
   * @returns {Promise<{user: object, token: string}>}
   */
  async register(email, password, name) {
    const users = getUsers();

    // Check if user already exists
    if (users.find(u => u.email === email.toLowerCase())) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = hashPassword(password);
    const newUser = {
      id: generateUUID(),
      email: email.toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      created_date: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    console.log('[Auth] User registered:', { email: newUser.email, hashedPassword });

    // Auto login after registration
    const token = generateUUID();
    const session = {
      userId: newUser.id,
      token,
      created_date: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return {
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token,
    };
  },

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: object, token: string}>}
   */
  async login(email, password) {
    const users = getUsers();
    const hashedPassword = hashPassword(password);
    
    // Debug: log registered users (without passwords)
    console.log('[Auth] Users in database:', users.map(u => ({ email: u.email, hasPassword: !!u.password })));
    console.log('[Auth] Attempting login with hashed password:', hashedPassword);
    
    const user = users.find(u => u.email === email.toLowerCase() && u.password === hashedPassword);

    if (!user) {
      // Check if email exists but password is wrong
      const emailExists = users.find(u => u.email === email.toLowerCase());
      if (emailExists) {
        throw new Error('Contraseña incorrecta');
      }
      throw new Error('Email no registrado. Crea una cuenta primero.');
    }

    const token = generateUUID();
    const session = {
      userId: user.id,
      token,
      created_date: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  },

  /**
   * Get current logged in user
   * @returns {Promise<object|null>}
   */
  async getCurrentUser() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    const users = getUsers();
    const user = users.find(u => u.id === session.userId);

    if (!user) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_date: user.created_date,
    };
  },

  /**
   * Logout current user
   */
  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem(SESSION_KEY);
  },
};
