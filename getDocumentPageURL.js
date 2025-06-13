export async function getDocumentPageUrl(page, contractUrl) {
  await page.goto(contractUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
  const linkHandle = await page.$('a.tabsNav__item[href*="document-info.html"]');
  if (!linkHandle) return null;
  const href = await linkHandle.getAttribute('href');
  return href ? `https://zakupki.gov.ru${href}` : null;
}
