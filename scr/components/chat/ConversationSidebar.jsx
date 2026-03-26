import { useState } from 'react';
import { Plus, MessageSquare, Settings, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ConversationSidebar({ conversations, activeId, onSelect, onCreate, onDelete, onRename, onOpenSettings }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const confirmEdit = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) onRename(id, editTitle.trim());
    setEditingId(null);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(222,47%,7%)] border-r border-border w-64 min-w-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h1 className="text-base font-semibold text-foreground tracking-tight">Chat LLM</h1>
        <Button size="icon" variant="ghost" onClick={onCreate} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" />
        </Button>
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

      {/* Settings button */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary text-xs"
        >
          <Settings className="h-3.5 w-3.5" />
          Configurar LLM
        </Button>
      </div>
    </div>
  );
}