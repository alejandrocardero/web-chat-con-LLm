import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, Cloud } from 'lucide-react';

const HF_MODELS = [
  // Modelos VERIFICADOS y funcionando (abril 2026)
  // Ultra ligeros
  { value: 'meta-llama/Llama-3.2-1B-Instruct', label: 'Llama 3.2 1B', desc: 'Ultra ligero, rapido' },

  // Ligeros (3B)
  { value: 'Qwen/Qwen2.5-Coder-3B-Instruct', label: 'Qwen 2.5 Coder 3B', desc: 'Especializado en codigo' },

  // Medianos (7B-8B)
  { value: 'meta-llama/Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B', desc: 'Buena calidad general' },
  { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B', desc: 'Excelente en tareas complejas' },

  // Grandes (70B+)
  { value: 'meta-llama/Llama-3.3-70B-Instruct', label: 'Llama 3.3 70B', desc: 'Alta calidad, mas lento' },
  { value: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B', desc: 'Muy potente, mayor contexto' },

  // Razonamiento (DeepSeek R1)
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', label: 'DeepSeek R1 1.5B', desc: 'Razonamiento paso a paso' },
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B', label: 'DeepSeek R1 8B', desc: 'Razonamiento avanzado' },

  // NO disponibles: SmolLM2, SmolLM3, Phi-3.5, Gemma-2, Mistral-7B, Qwen 1.5B/3B/3B-Instruct
];

const HF_TOKEN = import.meta.env.VITE_HUGGING_FACE_TOKEN;

export default function LLMSettingsModal({ open, onClose }) {

  const [config, setConfig] = useState({
    base_url: 'https://router.huggingface.co/v1',
    provider: 'huggingface',
    model: 'meta-llama/Llama-3.2-1B-Instruct',
    api_key: HF_TOKEN,
    temperature: 0.7,
    max_tokens: 2048
  });
  const [configId, setConfigId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    base44.entities.LLMConfig.list().then((list) => {
      if (list.length > 0) {
        const loadedConfig = list[0];
        // Always use HF_TOKEN for huggingface provider
        const finalToken = loadedConfig.provider === 'huggingface' ? HF_TOKEN : (loadedConfig.api_key || '');
        setConfig({
          provider: loadedConfig.provider || 'huggingface',
          base_url: loadedConfig.base_url || 'https://router.huggingface.co/v1',
          model: loadedConfig.model || 'meta-llama/Llama-3.2-1B-Instruct',
          api_key: finalToken,
          temperature: loadedConfig.temperature ?? 0.7,
          max_tokens: loadedConfig.max_tokens ?? 2048
        });
        setConfigId(loadedConfig.id);
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
      let apiUrl, headers, body;
      const token = config.api_key || HF_TOKEN;
      console.log('Testing with token:', token.slice(0,10) + '...');
      
      if (config.provider === 'huggingface') {
        apiUrl = 'https://router.huggingface.co/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
      } else if (config.provider === 'custom') {
        apiUrl = `${config.base_url}/v1/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      } else {
        apiUrl = `${config.base_url}/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      }
      
      body = JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(30000),
      });
      
      const responseText = await res.text();
      if (!responseText || responseText.trim() === '') {
        setTestResult({ ok: false, msg: `Error ${res.status}: Respuesta vacía` });
        setTesting(false);
        return;
      }
      
      const data = JSON.parse(responseText);
      const errorMsg = data.error?.message || data.detail || JSON.stringify(data);
      setTestResult(res.ok ? { ok: true, msg: '✓ Conexión exitosa' } : { ok: false, msg: `Error ${res.status}: ${errorMsg}` });
    } catch (e) {
      setTestResult({ ok: false, msg: `Error: ${e.message}` });
    }
    setTesting(false);
  };

  const update = (key, val) => setConfig(p => ({ ...p, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" /> Configuración del LLM
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Selecciona el proveedor, modelo y configura los parámetros de generación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Provider selection */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Proveedor</Label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={config.provider === 'huggingface' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => update('provider', 'huggingface')}
                className="flex-1 min-w-[70px] text-[10px]"
              >
                HF
              </Button>
              <Button
                variant={config.provider === 'openai' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => update('provider', 'openai')}
                className="flex-1 min-w-[70px] text-[10px]"
              >
                Ollama
              </Button>
              <Button
                variant={config.provider === 'custom' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => update('provider', 'custom')}
                className="flex-1 min-w-[70px] text-[10px]"
              >
                Custom
              </Button>
            </div>
          </div>

          {/* Hugging Face fields */}
          {config.provider === 'huggingface' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Modelo</Label>
                <select
                  value={config.model}
                  onChange={(e) => update('model', e.target.value)}
                  className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {HF_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">
                  Modelos verificados funcionando en abril 2026
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Hugging Face API Token
                </Label>
                <Input
                  type="password"
                  value={config.api_key}
                  onChange={(e) => update('api_key', e.target.value)}
                  placeholder="Token pre-configurado"
                  className="bg-input border-border text-sm"
                  disabled
                />
                <p className="text-[10px] text-muted-foreground">
                  Ya viene pre-configurado. Puedes usar tu propio token en <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">huggingface.co/settings/tokens</a>
                </p>
              </div>
            </>
          )}

          {/* OpenAI / Ollama fields */}
          {config.provider === 'openai' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Base URL</Label>
                <Input
                  value={config.base_url}
                  onChange={(e) => update('base_url', e.target.value)}
                  placeholder="http://192.168.x.x:11434/v1"
                  className="bg-input border-border text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Para Ollama en tu PC: usa la IP local (ej: <code className="text-primary">http://192.168.43.171:11434/v1</code>)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nombre del modelo</Label>
                <Input
                  value={config.model}
                  onChange={(e) => update('model', e.target.value)}
                  placeholder="llama3, mistral, phi3..."
                  className="bg-input border-border text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">API Key (opcional)</Label>
                <Input
                  type="password"
                  value={config.api_key}
                  onChange={(e) => update('api_key', e.target.value)}
                  placeholder="sk-..."
                  className="bg-input border-border text-sm"
                />
              </div>
            </>
          )}

          {/* Custom API fields */}
          {config.provider === 'custom' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">URL de tu API</Label>
                <Input
                  value={config.base_url}
                  onChange={(e) => update('base_url', e.target.value)}
                  placeholder="http://192.168.43.171:8000"
                  className="bg-input border-border text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  URL de tu SLM API desplegada (Lightning AI, tu servidor, etc.)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Modelo</Label>
                <Input
                  value={config.model}
                  onChange={(e) => update('model', e.target.value)}
                  placeholder="smollm3-3b"
                  className="bg-input border-border text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  ID del modelo: <code className="text-primary">smollm3-3b</code>, <code className="text-primary">qwen-3b</code>, <code className="text-primary">llama-1b</code>, etc.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">API Key (opcional)</Label>
                <Input
                  type="password"
                  value={config.api_key}
                  onChange={(e) => update('api_key', e.target.value)}
                  placeholder="opcional"
                  className="bg-input border-border text-sm"
                />
              </div>
            </>
          )}

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
                type="number" min={256} max={8192}
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
          <Button variant="outline" size="sm" onClick={testConnection} disabled={testing || !config.model} className="border-border text-muted-foreground hover:text-foreground">
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            Probar conexión
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !config.model} className="ml-auto bg-primary hover:bg-primary/90">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}