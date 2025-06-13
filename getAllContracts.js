import { MAIN_URL, PER_PAGE } from './constants.js'

export async function getAllContracts(page, { maxPages = 1, goodsDescription = 'Рельсовая система' } = {}) {
  const baseParams = {
    morphology: 'on',
    fz44: 'on',
    contractStageList_0: 'on',
    contractStageList: '0',
    selectedContractDataChanges: 'ANY',
    budgetLevelsIdNameHidden: '{}',
    countryRegIdNameHidden: '{}',
    sortBy: 'UPDATE_DATE',
    sortDirection: 'false',
    recordsPerPage: PER_PAGE,
    showLotsInfoHidden: 'false',
    goodsDescription: goodsDescription.replace(/\s+/g, '+'),
  };
  
  const searchParams = new URLSearchParams({ ...baseParams, pageNumber: '1' });
  const firstPageUrl = `${MAIN_URL}${searchParams.toString()}`;
  
  try {
    await page.goto(firstPageUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
    await page.waitForSelector('.search-results__total');
    
    const totalRecords = await page.$eval('.search-results__total', el => {
      const match = el.textContent.match(/\d+/g);
      return match ? parseInt(match.join(''), 10) : 0;
    });
    
    const totalPages = Math.min(Math.ceil(totalRecords / PER_PAGE), maxPages);
    const contractObjects = [];
    
    for (let i = 1; i <= totalPages; i++) {
      const pageParams = new URLSearchParams({ ...baseParams, pageNumber: i.toString() });
      const pageUrl = `${MAIN_URL}${pageParams.toString()}`;
      
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
      await page.waitForSelector('.registry-entry__header-mid__number a');
      
      const contractsOnPage = await page.$$eval('.registry-entry__header-mid__number a', links =>
        links.map(link => {
          const text = link.textContent.trim();
          const number = text.replace('№', '').trim();
          return {
            url: `https://zakupki.gov.ru/epz/contract/contractCard/common-info.html?reestrNumber=${number}`,
            id: number,
          };
        })
      );
      
      contractObjects.push(...contractsOnPage);
    }
    
    return contractObjects;
  } catch (err) {
    console.error('Error fetching contracts:', err);
    return [];
  }
}

