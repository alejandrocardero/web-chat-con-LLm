import { useState } from 'react';
import * as mammoth from 'mammoth';

export function useDocumentExtractor() {
  const [extracting, setExtracting] = useState(false);

  const extractText = async (file) => {
    setExtracting(true);
    try {
      const extension = file.name.split('.').pop().toLowerCase();
      
      if (extension === 'txt' || extension === 'csv' || extension === 'json') {
        const text = await file.text();
        setExtracting(false);
        return text;
      }
      
      if (extension === 'docx' || extension === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtracting(false);
        return result.value;
      }
      
      if (extension === 'pdf') {
        setExtracting(false);
        return `[PDF: ${file.name}] - Por favor, el contenido del PDF no puede ser extraído automáticamente.`;
      }
      
      setExtracting(false);
      return `[Documento: ${file.name}]`;
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtracting(false);
      return `[Error al extraer contenido: ${file.name}]`;
    }
  };

  return { extractText, extracting };
}