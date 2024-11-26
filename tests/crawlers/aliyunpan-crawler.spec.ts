import { test, expect, chromium } from '@playwright/test';
import { AliYunPanCrawler } from '../../src/crawlers/base/AliYunPanCrawler';
import { ICrawlerConfig } from '../../src/crawlers/interfaces/ICrawler';
import { BaseFetcher } from '../../src/crawlers/interfaces/IFetcher';
import { BaseParser } from '../../src/crawlers/interfaces/IParser';
import * as fs from 'fs';
import path from 'path';



test.describe('AliYunPan Crawler Tests', () => {
  let crawler: AliYunPanCrawler;

  test.beforeEach(async ({ context }) => {
    // 监听网络请求
    context.on('request', request => {
      console.log('请求:', request.url());
    });
    
    context.on('response', response => {
      console.log('响应:', response.url(), response.status());
    });
    
    // 捕获控制台日志
    context.on('console', msg => {
      console.log('页面日志:', msg.text());
    });
  });

  test.beforeEach(async () => {
    const config: ICrawlerConfig = {
      timeout: 10000,
      retries: 3,
      interval: 1000,
      concurrency: 5,
    };

    const browser = await chromium.launch({
      headless: true,
    });

    crawler = new AliYunPanCrawler(config, new BaseFetcher(browser), new BaseParser());
  });

  test('应该能成功抓取阿里云盘分享页面', async ({ page }) => {
    // 设置较长的超时时间
    test.setTimeout(30000);
    
    try {
      const shareUrl = 'https://www.qileso.com/72008.html';
      
      // 添加详细日志
      console.log('开始抓取:', shareUrl);
      
      // 使用 page.pause() 在浏览器中暂停执行
      await page.pause();
      
      const result = await crawler.crawl(shareUrl);
      // console.log('抓取结果:', JSON.stringify(result, null, 2));
      expect(result.success).toBe(true);
    } catch (error) {
      console.error('抓取失败:', error);
      throw error;
    }
  });

  test('提取出正确的阿里云盘地址', async () => {
    // 读取html内容
    const html = fs.readFileSync(
      path.join(process.cwd(), './tests/crawlers/aliyunpan.html'),
      'utf8'
    );
    const result = await crawler.extractData(html);
    expect(result.urls[0]).toEqual('https://www.alipan.com/s/biQQ5o37rAE/folder/6683d86765b5f4a99fe34239b1293a9af8312d06');
  });
}); 