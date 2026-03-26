// Document text extraction utilities

// Extract text from plain text files
const extractTextFromTxt = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Extract text from DOCX files using mammoth
const extractTextFromDocx = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const mammoth = await import('mammoth/mammoth.browser.js');
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value || '');
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Extract text from JSON files
const extractTextFromJson = async (file) => {
  const text = await extractTextFromTxt(file);
  try {
    const data = JSON.parse(text);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return text;
  }
};

// Extract text from CSV files
const extractTextFromCsv = async (file) => {
  return await extractTextFromTxt(file);
};

// Main extraction function
export const extractTextFromFile = async (file) => {
  const type = file.type;
  const name = file.name.toLowerCase();
  
  // Text files
  if (type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.md')) {
    return { text: await extractTextFromTxt(file), type: 'text' };
  }
  
  // DOCX files
  if (type.includes('officedocument.wordprocessingml') || name.endsWith('.docx')) {
    return { text: await extractTextFromDocx(file), type: 'docx' };
  }
  
  // JSON files
  if (type === 'application/json' || name.endsWith('.json')) {
    return { text: await extractTextFromJson(file), type: 'json' };
  }
  
  // CSV files
  if (type === 'text/csv' || name.endsWith('.csv')) {
    return { text: await extractTextFromCsv(file), type: 'csv' };
  }
  
  // Fallback: try to read as text
  try {
    return { text: await extractTextFromTxt(file), type: 'text' };
  } catch (error) {
    throw new Error(`Formato no soportado: ${file.type || name.split('.').pop()}`);
  }
};

// Truncate text if too long (for context limits)
export const truncateText = (text, maxLength = 8000) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '\n\n[... documento truncado ...]';
};
