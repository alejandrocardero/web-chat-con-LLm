import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Settings, Trash2, Edit2, Check, X, Bot, LogOut, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/hooks/useTheme.jsx';

export default function ConversationSidebar({ conversations, activeId, onSelect, onCreate, onDelete, onRename, onOpenSettings, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-full sm:w-72 md:w-64 pb-[env(safe-area-inset-bottom,0px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 md:hidden text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
              <X className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-base font-semibold text-sidebar-foreground tracking-tight">Chat con SLMs</h1>
        </div>
        <div className="flex items-center">
          <Link to="/rag">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent" title="RAG">
              <Bot className="h-4 w-4" />
            </Button>
          </Link>
<Button size="icon" variant="ghost" onClick={onCreate} className="h-8 w-8 text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent" title="Nueva conversación">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {conversations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8 px-4">
            No hay conversaciones aún.<br />Crea una nueva para comenzar.
          </p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
              activeId === conv.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />

            {editingId === conv.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmEdit(conv.id, e)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent border-b border-primary outline-none text-xs text-foreground min-w-0"
              />
            ) : (
              <span className="flex-1 text-xs font-medium truncate">{conv.title}</span>
            )}

            {editingId === conv.id ? (
              <div className="flex gap-1">
                <button onClick={(e) => confirmEdit(conv.id, e)} className="text-green-400 hover:text-green-300">
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="hidden group-hover:flex gap-1">
                <button onClick={(e) => startEdit(conv, e)} className="text-muted-foreground hover:text-foreground">
                  <Edit2 className="h-3 w-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User profile & settings */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="h-7 w-7 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

{/* Action buttons */}
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="flex-1 justify-start gap-1.5 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs"
          >
            <Settings className="h-3.5 w-3.5" />
            LLM
          </Button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="justify-start gap-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}