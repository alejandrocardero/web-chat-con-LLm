import { useState } from 'react';
import * as mammoth from 'mammoth';

export function useDocumentExtractor() {
  const [extracting, setExtracting] = useState(false);

  const extractText = async (file) => {
    return extractTextFromFile(file);
  };

  return { extractText, extracting };
}

// Export standalone function for use in other components
export async function extractTextFromFile(file) {
  try {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'txt' || extension === 'csv' || extension === 'json' || extension === 'md') {
      return await file.text();
    }
    
    if (extension === 'docx' || extension === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    
    if (extension === 'pdf') {
      return `[PDF: ${file.name}] - Por favor, pregunta sobre el contenido que te interesa del PDF.`;
    }
    
    return `[Documento: ${file.name}]`;
  } catch (error) {
    console.error('Error extracting text:', error);
    return `[Error al extraer contenido: ${file.name}]`;
  }
}