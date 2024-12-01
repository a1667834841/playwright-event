import { test, expect, chromium } from '@playwright/test';
import { QilePanCrawler } from '../../src/crawlers/base/pan/QilePanCrawler';
import * as fs from 'fs';
import path from 'path';
import { CrawlOptions } from '../../src/crawlers/base/BaseCrawler';



test.describe('QilePan Crawler Tests', () => {
  let crawler: QilePanCrawler;

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
    
    crawler = await QilePanCrawler.create();
  });

  test('应该能成功抓取阿里云盘分享页面', async ({ page }) => {
    test.setTimeout(60000);

    try {

      const options: CrawlOptions = {
        startUrl: 'https://www.qileso.com/62136.html',
        extractTimes: 1,
      };

      // 添加详细日志
      console.log('开始抓取:', 'https://www.qileso.com/62136.html');

      await crawler.start(options);

      const visitedUrls = crawler.getVisitedUrls();
      console.log('已访问的URL:', visitedUrls);
      expect(visitedUrls.size).toBeGreaterThan(0);
      
    } catch (error) {
      console.error('抓取失败:', error);
      throw error;
    }
  });
  test('测试满足规定次数后停止抓取', async ({ page }) => {
    test.setTimeout(60000);
    const options: CrawlOptions = {
      startUrl: 'https://www.qileso.com/62136.html',
      extractTimes: 1,
    };

    crawler.onStoped = (datas) => {
      console.log('爬取完成，共获取到 %d 条数据', datas.length);
      expect(datas.length).toBeGreaterThanOrEqual(2);
    }

    await crawler.start(options);
    
  });

  test('提取出正确的阿里云盘地址', async () => {
    // 读取html内容
    const html = fs.readFileSync(
      path.join(process.cwd(), './tests/crawlers/aliyunpan.html'),
      'utf8'
    );
    const result = await crawler.extractData(html);
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].url).toBe('https://www.alipan.com/s/biQQ5o37rAE/folder/6683d86765b5f4a99fe34239b1293a9af8312d06');
  });

  test('测试toMd方法生成正确的markdown格式', async () => {
    // 准备测试数据
    crawler.setExtractDatas([
      {
        title: '测试标题1',
        panType: '阿里云盘',
        url: 'https://www.alipan.com/s/test1'
      },
      {
        title: '测试标题2', 
        panType: '阿里云盘',
        url: 'https://www.alipan.com/s/test2'
      }
    ]);

    const md = await crawler.toMd();

    // 验证生成的markdown格式
    expect(md).toBe(
      '| 标题 | 网盘类型 | 链接 |\n' +
      '| --- | --- | --- |\n' +
      '| 测试标题1 | 阿里云盘 | https://www.alipan.com/s/test1 |\n' +
      '| 测试标题2 | 阿里云盘 | https://www.alipan.com/s/test2 |\n'
    );
  });

  test('测试toMd方法在没有数据时返回空字符串', async () => {
    crawler.setExtractDatas([]);
    const md = await crawler.toMd();
    expect(md).toBe('');
  });
}); 