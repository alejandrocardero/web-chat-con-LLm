import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext.jsx';
import { ThemeProvider } from '@/hooks/useTheme.jsx';

// Pages
import Chat from '@/pages/chat';
import RAG from '@/pages/RAG';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Auth guard component - redirects to login if not authenticated
const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Guest guard - redirects to chat if already authenticated
const GuestGuard = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Routes>
              {/* Public routes - only for guests */}
              <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
              <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />

              {/* Protected routes - require authentication */}
              <Route path="/" element={<AuthGuard><Chat /></AuthGuard>} />
              <Route path="/rag" element={<AuthGuard><RAG /></AuthGuard>} />

              {/* Catch all */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;
