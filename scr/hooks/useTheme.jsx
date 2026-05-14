import { createContext, useContext, useEffect, useState } from 'react';

function getCurrentUserId() {
  try {
    const session = JSON.parse(localStorage.getItem('nexus_chat_session'));
    return session?.userId || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

function getUserThemeKey() {
  return `theme_${getCurrentUserId()}`;
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(getUserThemeKey()) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(getUserThemeKey(), theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}