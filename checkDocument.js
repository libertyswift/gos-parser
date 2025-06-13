import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { convertDocToDocx } from './convertDocToDocx.js'; // импортируй из файла с функцией выше

export async function checkDocument(filePath, numberRegex) {
  let fileToCheck = filePath;
  
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    // Если .doc — конвертируем в .docx
    if (ext === '.doc') {
      const converted = await convertDocToDocx(filePath);
      if (!converted) return false;
      fileToCheck = converted;
    }
    
    if (path.extname(fileToCheck).toLowerCase() !== '.docx') {
      console.warn(`⚠️ Неподдерживаемый формат файла: ${ext}`);
      return false;
    }
    
    const { value: text } = await mammoth.extractRawText({ path: fileToCheck });
    return numberRegex.test(text);
    
  } catch (error) {
    console.error(`❌ Ошибка при чтении файла ${fileToCheck}:`, error.message);
    return false;
    
  } finally {
    try {
      await fs.unlink(filePath);
      if (fileToCheck !== filePath) {
        await fs.unlink(fileToCheck);
      }
      console.log(`🧹 Удалены временные файлы.`);
    } catch (err) {
      console.warn(`⚠️ Ошибка при удалении файла:`, err.message);
    }
  }
}
