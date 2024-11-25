import { chromium } from 'playwright';

const google_url = 'https://www.google.com';

export const searchGoogle = async (keyword: string) => {
  const browser = await chromium.launch({
    headless: true
  });
  const page = await browser.newPage();
  
  // 访问谷歌
  await page.goto(google_url);
  
  // 定位搜索框并输入关键词
  await page.fill('textarea[name="q"]', keyword);
  
  // 点击搜索按钮
  await page.click('input[name="btnK"]');
  
  // 等待搜索结果加载
  await page.waitForSelector('#search');
  
  // 获取搜索结果
  const results = await page.$$eval('#search .g', elements => 
    elements.map(el => ({
      title: el.querySelector('h3')?.textContent || '',
      link: el.querySelector('a')?.href || ''
    }))
  );

  await browser.close();
  // 在控制台打印搜索结果
  // console.log('搜索结果:', results);
  return results;
};