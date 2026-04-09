import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';

export default function RAG() {
  const [file, setFile] = useState(null);
  const [indexedChunks, setIndexedChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Configura tu API token de Hugging Face para usar RAG');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [modelStatus, setModelStatus] = useState('config');
  const [hfToken, setHfToken] = useState(() => localStorage.getItem('hf_token') || '');
  const [showTokenInput, setShowTokenInput] = useState(!localStorage.getItem('hf_token'));

  useEffect(() => {
    if (hfToken) {
      setModelStatus('ready');
      setStatus('✅ Token configurado. Selecciona un archivo para indexar.');
    }
  }, [hfToken]);

  const saveToken = (token) => {
    setHfToken(token);
    if (token) {
      localStorage.setItem('hf_token', token);
      setModelStatus('ready');
      setStatus('✅ Token configurado. Selecciona un archivo para indexar.');
    } else {
      localStorage.removeItem('hf_token');
      setModelStatus('config');
      setStatus('Configura tu API token de Hugging Face para usar RAG');
    }
  };

  const getEmbedding = async (text) => {
    const apiUrl = import.meta.env.DEV
      ? '/hf-embed/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction'
      : 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error ${response.status}`);
    }

    return await response.json();
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setIndexedChunks([]);
    setSearchResults([]);
    setProgress({ current: 0, total: 0 });
    setStatus('Archivo seleccionado. Haz clic en "Indexar" para procesar.');
  };

  const extractTextFromFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    return await file.text();
  };

  const chunkText = (text, chunkSize = 500, overlap = 50) => {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
    }

    return chunks;
  };

  const handleIndexFile = async () => {
    if (!file) {
      setStatus('Por favor, selecciona un archivo primero.');
      return;
    }
    if (modelStatus !== 'ready') {
      setStatus('Primero configura tu API token.');
      return;
    }

    setLoading(true);
    setStatus('Extrayendo texto del archivo...');
    setProgress({ current: 0, total: 0 });

    try {
      const text = await extractTextFromFile(file);

      if (!text || text.trim().length === 0) {
        setStatus('El archivo está vacío o no se pudo extraer texto.');
        setLoading(false);
        return;
      }

      setStatus('Dividiendo texto en fragmentos...');
      const chunks = chunkText(text);
      setProgress({ current: 0, total: chunks.length });

      const newIndexedChunks = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await getEmbedding(chunk);
        newIndexedChunks.push({
          text: chunk,
          embedding: Array.isArray(embedding) ? embedding : embedding[0],
        });
        setProgress({ current: i + 1, total: chunks.length });
      }

      setIndexedChunks(newIndexedChunks);
      setStatus(`✅ Indexación completa. Se indexaron ${newIndexedChunks.length} fragmentos de "${file.name}".`);
    } catch (error) {
      console.error('Error durante la indexación:', error);
      setStatus(`❌ Error durante la indexación: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = async () => {
    if (!query) {
      setStatus('Por favor, introduce una consulta para buscar.');
      return;
    }
    if (modelStatus !== 'ready') {
      setStatus('Primero configura tu API token.');
      return;
    }
    if (indexedChunks.length === 0) {
      setStatus('No hay fragmentos indexados. Por favor, indexa un archivo primero.');
      return;
    }

    setLoading(true);
    setStatus('Buscando en fragmentos indexados...');

    try {
      const queryEmbedding = await getEmbedding(query);
      const queryVec = Array.isArray(queryEmbedding) ? queryEmbedding : queryEmbedding[0];

      const scores = indexedChunks.map((chunk, index) => {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < queryVec.length; i++) {
          dotProduct += queryVec[i] * chunk.embedding[i];
          normA += queryVec[i] * queryVec[i];
          normB += chunk.embedding[i] * chunk.embedding[i];
        }
        const cosineSim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
        return { index, score: cosineSim, text: chunk.text };
      });

      scores.sort((a, b) => b.score - a.score);
      setSearchResults(scores.slice(0, 5));
      setStatus(`Búsqueda completa. Encontrados ${scores.length} resultados.`);
    } catch (error) {
      console.error('Error durante la búsqueda:', error);
      setStatus(`Error durante la búsqueda: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">Motor RAG: Indexación y Consulta</h1>

      {/* API Token Configuration */}
      <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
        <h2 className="text-lg font-semibold text-foreground">Configuración de API Token</h2>
        <p className="text-xs text-muted-foreground">
          Necesitas un token de Hugging Face para generar embeddings. Consíguelo gratis en{' '}
          <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            huggingface.co/settings/tokens
          </a>
        </p>
        {showTokenInput && (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
              placeholder="hf_..."
              className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => saveToken(hfToken)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm"
            >
              Guardar
            </button>
          </div>
        )}
        {hfToken && !showTokenInput && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Token: <span className="text-foreground font-mono">hf_****{hfToken.slice(-4)}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTokenInput(true)}
                className="text-xs text-primary hover:underline"
              >
                Cambiar
              </button>
              <button
                onClick={() => saveToken('')}
                className="text-xs text-red-400 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status message */}
      <div className={`p-3 rounded-lg text-sm ${
        modelStatus === 'error' ? 'bg-red-900/20 text-red-400 border border-red-800' :
        modelStatus === 'ready' ? 'bg-green-900/20 text-green-400 border border-green-800' :
        'bg-muted text-muted-foreground'
      }`}>
        {modelStatus === 'loading' && (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {status}
          </span>
        )}
        {modelStatus !== 'loading' && status}
      </div>

      {/* File Indexing Section */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
        <h2 className="text-xl font-semibold text-foreground">Indexar Documento</h2>
        <input
          type="file"
          accept=".txt,.md,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-foreground
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/90"
        />
        {file && (
          <p className="text-xs text-muted-foreground">
            Archivo: <span className="text-foreground font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <button
          onClick={handleIndexFile}
          disabled={loading || !file || modelStatus !== 'ready'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            modelStatus !== 'ready' ? 'Configura tu API token primero' :
            !file ? 'Selecciona un archivo primero' :
            'Indexar archivo'
          }
        >
          {loading ? 'Indexando...' : modelStatus !== 'ready' ? 'Configura tu token' : !file ? 'Selecciona un archivo' : 'Indexar Archivo'}
        </button>

        {/* Progress bar */}
        {progress.total > 0 && (
          <div className="space-y-1">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {progress.current} / {progress.total} fragmentos
            </p>
          </div>
        )}

        {indexedChunks.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Fragmentos indexados: <span className="text-foreground font-medium">{indexedChunks.length}</span>
          </p>
        )}
      </div>

      {/* Query Section */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
        <h2 className="text-xl font-semibold text-foreground">Consultar Fragmentos</h2>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Introduce tu consulta aquí..."
          className="block w-full p-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || indexedChunks.length === 0}
        />
        <button
          onClick={handleSearch}
          disabled={loading || query.trim().length === 0 || indexedChunks.length === 0 || modelStatus !== 'ready'}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Buscando...' : indexedChunks.length === 0 ? 'Indexa un archivo primero' : 'Buscar'}
        </button>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-lg font-medium text-foreground">Resultados de la búsqueda (Top 5):</h3>
            {searchResults.map((result, i) => (
              <div key={i} className="bg-secondary p-3 rounded-md border border-border">
                <p className="text-sm font-semibold text-foreground">Score: {(result.score * 100).toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">{result.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
