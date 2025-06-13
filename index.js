import { chromium } from 'playwright';
import  { getAllContracts } from './getAllContracts.js'
import { getDocumentPageUrl } from './getDocumentPageURL.js'
import { getDocURL } from './getDocURL.js'



(async () => {
  const start = Date.now();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const contracts = await getAllContracts(page);
  const foundNumber = '046577674'
  // const firstOnly = contracts.slice(0, 2); // [1]
  
  

  
  for (const contract of contracts) {
    const docPageUrl = await getDocumentPageUrl(page, contract.url);
    if (docPageUrl) {
      const isFound = await getDocURL(page, docPageUrl, foundNumber);
      contract.isFound = isFound;
    } else {
      console.log('❌ Не удалось найти страницу с вложениями', contract.url);
    }
  }

  await browser.close();
  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);
  console.log(contracts)
  console.log(`Время выполнения скрипта: ${seconds} сек.`);
})();
