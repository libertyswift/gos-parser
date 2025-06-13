import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export async function convertDocToDocx(docFilePath) {
  try {
    // Путь к сконвертированному файлу .docx
    const outputFilePath = docFilePath.replace(/\.doc$/, '.docx');
    
    // Запускаем unoconv для конвертации
    await execFileAsync('unoconv', ['-f', 'docx', '-o', outputFilePath, docFilePath]);
    
    return outputFilePath;
  } catch (err) {
    console.error('Ошибка конвертации файла через unoconv:', err);
    return null;
  }
}
