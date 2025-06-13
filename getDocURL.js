import { downloadFile } from './downlodFile.js'
import { checkDocument } from './checkDocument.js'

export async function getDocURL(page, docUrl, numberToFind) {
  const regex = typeof numberToFind === 'string' ? new RegExp(numberToFind) : numberToFind;
  
  await page.goto(docUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
  
  const [attachment] = await page.$$('div.attachment[class="attachment  "]');
  
  const showMoreLink = await attachment.$('a[onclick="openClosedFilesDocs(this)"]');
  
  
  if (showMoreLink) {
    await showMoreLink.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    try {
      await showMoreLink.click({ timeout: 1000 });
      await page.waitForTimeout(500);
    } catch (err) {
      console.warn('⚠️ Не удалось раскрыть скрытые файлы');
    }
  }
  
  
  const links = await attachment.$$('a[title]');
  
  for (const link of links) {
    const title = await link.getAttribute('title');
    const text = await link.evaluate(el => el.textContent.trim());
    
    if (!title && !text) continue;
    
    const normalizedTitle = (title || '').trim().toLowerCase();
    const normalizedText = (text || '').trim().toLowerCase();
    
    const hasDocxExtension = /\.(docx?|rtf|doc)(\s|\(|$)/i.test(normalizedTitle);

// Сначала проверяем в title, если не нашли — проверяем в text
    const containsKeyword =
      /контракт[а-яё]*/i.test(normalizedTitle) ||
      /контракт[а-яё]*/i.test(normalizedText);
    
    if (hasDocxExtension && containsKeyword) {
      const url = await link.getAttribute('href');
      console.log('📥 Найдена ссылка для скачивания Word файла:', url);
      
      const filePath = await downloadFile(page, link);
      if (!filePath) continue;
      
      const found = await checkDocument(filePath, regex);
      console.log(found ? '🔍 Число найдено!' : '🚫 Не найдено.');
      
      return found;
    } else {
      console.log('⛔ Не подошло:', {
        url: docUrl,
        title,
        text,
        hasDocxExtension,
        containsKeyword
      });
    }
  }
}

