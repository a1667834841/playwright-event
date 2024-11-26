import { chromium } from 'playwright';

const google_url = 'https://www.google.com';

export type SearchResult = {
  title: string;
  link: string;
}

const browser = await chromium.launch({
  headless: true
});

export const searchGoogle = async (keyword: string,pageLimit:number = 10) => {
  

  let searchResults:SearchResult[] = [];
  const page = await browser.newPage();
  await page.goto(google_url);
  
  // 输入搜索关键词
  await page.fill('textarea[name="q"]', keyword);
  await page.press('textarea[name="q"]', 'Enter');
  await page.waitForLoadState('networkidle');

  // 获取总页数
  const totalPages = Math.min(pageLimit, 5); // 限制最大5页并发
  const promises = [];

  // 并发执行5个任务
  for(let i = 0; i < totalPages; i++) {
    promises.push((async () => {
      const results: SearchResult[] = [];
      const currentPage = await browser.newPage();
      
      // 访问对应页码
      if(i > 0) {
        await currentPage.goto(`${google_url}/search?q=${keyword}&start=${i * 10}`);
        await currentPage.waitForLoadState('networkidle');
      } else {
        await currentPage.goto(`${google_url}/search?q=${keyword}`);
        await currentPage.waitForLoadState('networkidle');
      }

      // 提取搜索结果
      const links = await currentPage.$$('div.g');
      for(const link of links) {
        const titleElement = await link.$('h3');
        const linkElement = await link.$('a');
        
        if(titleElement && linkElement) {
          const title = await titleElement.innerText();
          const url = await linkElement.getAttribute('href') || '';
          results.push({
            title,
            link: url
          });
        }
      }

      await currentPage.close();
      return results;
    })());
  }

  await page.close();

  const results = await Promise.all(promises);
  searchResults = searchResults.concat(...results);

  await browser.close();
  // 在控制台打印搜索结果
  // console.log('搜索结果:', results);
  return searchResults;
};

export const aliyunpanSearch = async (pageLimit:number = 10) => {
  const keyword = '阿里云盘';
  const results = await searchGoogle(keyword,pageLimit);
  // console.log('搜索结果:', results);
  return results;
};