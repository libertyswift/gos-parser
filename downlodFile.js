import fs from 'fs';
import path from 'path';

const downloadDir = './downloads';

export async function downloadFile(page, elementHandle) {
  try {
    const [ download ] = await Promise.all([
      page.waitForEvent('download'),
      elementHandle.click()
    ]);
    
    const suggestedName = download.suggestedFilename();
    const fullPath = path.join(downloadDir, suggestedName);
    fs.mkdirSync(downloadDir, { recursive: true });
    await download.saveAs(fullPath);
    console.log(`✅ Файл загружен: ${suggestedName}`);
    
    return fullPath;
  } catch (error) {
    const currentUrl = await page.url();
    console.error(`❌ Ошибка при загрузке файла на странице: ${currentUrl}`);
    console.error('⛔ Детали ошибки:', error);
    return null;
  }
}

