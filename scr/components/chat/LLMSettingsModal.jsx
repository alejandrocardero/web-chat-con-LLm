import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap } from 'lucide-react';

// Default Ollama configuration - using glm-4.6:cloud as default
const DEFAULT_OLLAMA_CONFIG = {
  base_url: 'http://localhost:11434/v1',
  model: 'glm-4.6:cloud',
  api_key: '',
  temperature: 0.7,
  max_tokens: 8192
};

export default function LLMSettingsModal({ open, onClose }) {
  const [config, setConfig] = useState(DEFAULT_OLLAMA_CONFIG);
  const [configId, setConfigId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    base44.entities.LLMConfig.list().then((list) => {
      if (list.length > 0) {
        setConfig({ ...DEFAULT_OLLAMA_CONFIG, ...list[0] });
        setConfigId(list[0].id);
      } else {
        // No config saved, use Ollama defaults
        setConfig(DEFAULT_OLLAMA_CONFIG);
      }
    });
  }, [open]);

  const save = async () => {
    setSaving(true);
    if (configId) {
      await base44.entities.LLMConfig.update(configId, config);
    } else {
      const created = await base44.entities.LLMConfig.create(config);
      setConfigId(created.id);
    }
    setSaving(false);
    onClose();
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Ollama uses /tags endpoint to list models
      const res = await fetch(`${config.base_url.replace('/v1', '')}/api/tags`, {
        method: 'GET',
        headers: config.api_key ? { Authorization: `Bearer ${config.api_key}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.models?.map(m => m.name).join(', ') || 'Modelos disponibles';
        setTestResult({ ok: true, msg: `✓ Ollama conectado - ${models}` });
      } else {
        setTestResult({ ok: false, msg: `Error ${res.status}` });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `Error: ${e.message}` });
    }
    setTesting(false);
  };

  const update = (key, val) => setConfig(p => ({ ...p, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Configuración de Ollama
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Ollama URL</Label>
            <Input
              value={config.base_url}
              onChange={(e) => update('base_url', e.target.value)}
              placeholder="http://localhost:11434/v1"
              className="bg-input border-border text-sm"
            />
            <p className="text-[10px] text-muted-foreground">Por defecto: http://localhost:11434/v1</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Modelo</Label>
            <Input
              value={config.model}
              onChange={(e) => update('model', e.target.value)}
              placeholder="glm-4.6:cloud, glm-5:cloud..."
              className="bg-input border-border text-sm"
            />
            <p className="text-[10px] text-muted-foreground">Ejecuta <code className="bg-muted px-1 rounded">ollama list</code> para ver modelos instalados</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">API Key (opcional)</Label>
            <Input
              type="password"
              value={config.api_key}
              onChange={(e) => update('api_key', e.target.value)}
              placeholder="Ollama no requiere API key por defecto"
              className="bg-input border-border text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Temperatura</Label>
              <Input
                type="number" min={0} max={2} step={0.1}
                value={config.temperature}
                onChange={(e) => update('temperature', parseFloat(e.target.value))}
                className="bg-input border-border text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Máx. tokens</Label>
              <Input
                type="number" min={512} max={32768} step={512}
                value={config.max_tokens}
                onChange={(e) => update('max_tokens', parseInt(e.target.value))}
                className="bg-input border-border text-sm"
              />
            </div>
          </div>

          {testResult && (
            <p className={`text-xs font-medium ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.msg}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={testConnection} disabled={testing || !config.base_url} className="border-border text-muted-foreground hover:text-foreground">
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            Probar conexión
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !config.base_url || !config.model} className="ml-auto bg-primary hover:bg-primary/90">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}