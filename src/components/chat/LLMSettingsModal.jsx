import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, Cloud } from 'lucide-react';

const HF_MODELS = [
  // ── Ultra ligeros (< 2B) — rápidos, ideales para pruebas
  { value: 'meta-llama/Llama-3.2-1B-Instruct', label: 'Llama 3.2 1B', desc: 'Ultra ligero, respuesta rápida' },
  { value: 'HuggingFaceTB/SmolLM2-1.7B-Instruct', label: 'SmolLM2 1.7B', desc: 'SLM oficial de Hugging Face' },
  { value: 'Qwen/Qwen2.5-1.5B-Instruct', label: 'Qwen 2.5 1.5B', desc: 'Compacto, buen rendimiento' },

  // ── Ligeros (3B–4B) — mejor calidad sin mucho costo
  { value: 'meta-llama/Llama-3.2-3B-Instruct', label: 'Llama 3.2 3B', desc: 'Equilibrio calidad/velocidad' },
  { value: 'microsoft/Phi-3.5-mini-instruct', label: 'Phi-3.5 Mini 3.8B', desc: 'Microsoft, excelente razonamiento' },
  { value: 'HuggingFaceTB/SmolLM3-3B', label: 'SmolLM3 3B', desc: 'Nueva generación SmolLM' },
  { value: 'Qwen/Qwen2.5-3B-Instruct', label: 'Qwen 2.5 3B', desc: 'Multilingüe, buen código' },
  { value: 'Qwen/Qwen2.5-Coder-3B-Instruct', label: 'Qwen 2.5 Coder 3B', desc: 'Especializado en código' },
  { value: 'google/gemma-2-2b-it', label: 'Gemma 2 2B', desc: 'Google, eficiente' },

  // ── Calidad media (7B–9B) — mejor razonamiento y contexto
  { value: 'meta-llama/Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B', desc: 'Buena calidad general' },
  { value: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B', desc: 'Excelente en tareas complejas' },
  { value: 'google/gemma-2-9b-it', label: 'Gemma 2 9B', desc: 'Google, alto rendimiento' },
  { value: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B v0.3', desc: 'Popular y versátil' },

  // ── Modelos de razonamiento
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', label: 'DeepSeek R1 1.5B', desc: 'Razonamiento paso a paso' },
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B', label: 'DeepSeek R1 8B', desc: 'Razonamiento avanzado' },
];

export default function LLMSettingsModal({ open, onClose }) {
  const [config, setConfig] = useState({
    base_url: 'https://router.huggingface.co/v1',
    provider: 'huggingface',
    model: 'HuggingFaceTB/SmolLM3-3B',
    api_key: '',
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
        setConfig({ 
          provider: list[0].provider || 'huggingface',
          ...list[0] 
        });
        setConfigId(list[0].id);
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
      
      if (config.provider === 'huggingface') {
        apiUrl = import.meta.env.DEV
          ? `/hf-api/chat/completions`
          : `${config.base_url}/chat/completions`;
        headers = {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json',
        };
      } else if (config.provider === 'custom') {
        apiUrl = `${config.base_url}/v1/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          ...(config.api_key ? { Authorization: `Bearer ${config.api_key}` } : {}),
        };
      } else {
        // OpenAI / Ollama
        apiUrl = `${config.base_url}/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          ...(config.api_key ? { Authorization: `Bearer ${config.api_key}` } : {}),
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
      
      const data = await res.json();
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
                  <optgroup label="⚡ Ultra ligeros (< 2B)">
                    {HF_MODELS.filter(m => m.desc === 'Ultra ligero, respuesta rápida' || m.desc === 'SLM oficial de Hugging Face' || m.desc === 'Compacto, buen rendimiento').map((m) => (
                      <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🚀 Ligeros (3B–4B)">
                    {HF_MODELS.filter(m => ['Equilibrio calidad/velocidad', 'Microsoft, excelente razonamiento', 'Nueva generación SmolLM', 'Multilingüe, buen código', 'Especializado en código', 'Google, eficiente'].includes(m.desc)).map((m) => (
                      <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🧠 Calidad media (7B–9B)">
                    {HF_MODELS.filter(m => ['Buena calidad general', 'Excelente en tareas complejas', 'Google, alto rendimiento', 'Popular y versátil'].includes(m.desc)).map((m) => (
                      <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                    ))}
                  </optgroup>
                  <optgroup label="💡 Razonamiento">
                    {HF_MODELS.filter(m => m.desc.includes('Razonamiento')).map((m) => (
                      <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-muted-foreground">
                  ¿Quieres otro modelo? <a href="https://huggingface.co/models?inference_api=true&pipeline_tag=text-generation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver lista completa</a>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Hugging Face API Token <span className="text-red-400">*</span>
                </Label>
                <Input
                  type="password"
                  value={config.api_key}
                  onChange={(e) => update('api_key', e.target.value)}
                  placeholder="hf_..."
                  className="bg-input border-border text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Consigue tu token gratis en <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">huggingface.co/settings/tokens</a>
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
          <Button variant="outline" size="sm" onClick={testConnection} disabled={testing || !config.model || (config.provider === 'huggingface' && !config.api_key)} className="border-border text-muted-foreground hover:text-foreground">
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            Probar conexión
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !config.model || (config.provider === 'huggingface' && !config.api_key)} className="ml-auto bg-primary hover:bg-primary/90">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}