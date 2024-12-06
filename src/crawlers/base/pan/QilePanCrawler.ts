import { chromium } from "playwright";
import { ICrawlerConfig } from "../../interfaces/ICrawler";
import { BaseCrawler } from "../BaseCrawler";
import { JSDOM } from 'jsdom';
import { BaseParser } from "../../interfaces/IParser";
import { BaseFetcher } from "../../interfaces/IFetcher";
import { AliYunPanExtractor } from "../../../extractors/AliYunPanExtractor";
import { CrawlPanSite } from "../../../types/PanSiteType";
import fs from 'fs';

export class QilePanCrawler extends BaseCrawler {



  public static async create(): Promise<QilePanCrawler> {

    const config: ICrawlerConfig = {
      timeout: 60000,
      retries: 3,
      interval: 1000,
      concurrency: 5,
  };

  const browser = await chromium.launch({
      headless: true,
    });

    return new QilePanCrawler(config, new BaseFetcher(browser), new BaseParser());
  }


  public extractUrls(content: string): Promise<string[]> {
    // 匹配 https://www.qileso.com/72326.html 类似的网址
    const regex = /https:\/\/www\.qileso\.com\/\d+\.html/g;
    const matches = content.match(regex);
    return Promise.resolve(matches || []);
  }

  public extractData(content: string): Promise<any> {
    const aliYunPanExtractor = new AliYunPanExtractor({
      siteUrl: CrawlPanSite.QILE_PAN,
    });
    return aliYunPanExtractor.extract(content);
  }

  public async toMd(): Promise<string> {
      if (this.extractDatas.length == 0) {
        return '';
      }
      
      // 将提取结果转换为markdown格式
      const extractDatas = this.extractDatas;
  
      let md = '| 标题 | 网盘类型 | 更新时间 | 链接 |\n| --- | --- | --- | --- |\n';
      
      for (const extractData of extractDatas) {
        md += `| ${extractData.title || ''} | ${extractData.panType || ''} | ${extractData.updateTime || ''} | ${extractData.url || ''} |\n`;
      }
      
      return md;
  }

  public async createMdFile(path: string): Promise<void> {
    const md = await this.toMd();
    // 当前日期
    const date = new Date().toISOString().split('T')[0];
    fs.writeFileSync(`${path}/aliyun-pan-${date}.md`, md, { encoding: 'utf-8' });
  }


}
