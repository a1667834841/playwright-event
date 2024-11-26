import { BaseCrawler } from "./BaseCrawler";
import { JSDOM } from 'jsdom';

export class AliYunPanCrawler extends BaseCrawler {
   public extractUrls(content: string): Promise<string[]> {
        return Promise.resolve([]);
    }

    public extractData(content: string): Promise<any> {
      const dom = new JSDOM(content);
      const document = dom.window.document;

      // 找到页面 rel="bookmark"的text
      const bookmark = document.querySelector('a[rel="bookmark"]')?.textContent;
      
      // 查找所有阿里云盘链接
      const links = document.querySelectorAll('a');
      const aliyunpanUrls = Array.from(links)
          .map(link => link.href)
          .filter(href => href.startsWith('https://www.alipan.com/s'));

      // 去重
      const uniqueUrls = [...new Set(aliyunpanUrls)];
      return Promise.resolve({
        bookmark,
        urls: uniqueUrls,
      });
    }
}