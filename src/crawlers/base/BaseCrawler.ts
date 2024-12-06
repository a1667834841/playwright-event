import { ExtractData } from '../../extractors/core/extractor';
import { ICrawler, ICrawlerConfig } from '../interfaces/ICrawler';
import { IFetcher } from '../interfaces/IFetcher';
import { IParser } from '../interfaces/IParser';
import { CrawlResult } from '../models/CrawlResult';
import { Response } from 'playwright';

export class CrawlOptions {
    extractTimes?: number; // 提取次数，满足后停止抓取
    startUrl?: string; // 开始抓取的URL
}

export abstract class BaseCrawler implements ICrawler {
  protected isRunning: boolean = false;
  protected urlQueue: string[] = [];
  protected visitedUrls: Set<string> = new Set();
  protected extractDatas: ExtractData[] = [];
  
  constructor(
    public readonly config: ICrawlerConfig,
    protected readonly fetcher: IFetcher,
    protected readonly parser: IParser
  ) {}

  public setExtractDatas(extractDatas: ExtractData[]): void {
    this.extractDatas = extractDatas;
  }
  protected pushExtractDatas(extractDatas: ExtractData[]): void {
    // 修改数组的push方法调用
    if (Array.isArray(extractDatas)) {
        this.extractDatas.push(...extractDatas);
    }
  }


  // 开始爬取
  public async start(options: CrawlOptions): Promise<void> {
    if (options == null) {
      throw new Error('Crawl options is required');
    }
    if (options.startUrl == null) {
      throw new Error('Start URL is required');
    }
    await this.crawl(options);
  }

  // 核心爬取方法
  public async crawl( options: CrawlOptions): Promise<ExtractData[]> {
    try {
      this.isRunning = true;
      if (options?.startUrl) {
        this.urlQueue.push(options.startUrl);
      }
      
      
      while (this.isRunning && this.urlQueue.length > 0) {
        const urls = this.getBatch();
        const batchResults = await this.processBatch(urls);
        for (const result of batchResults) {
          if (result.success && Array.isArray(result.data)) {
            // 确保result.data是数组再进行操作
            this.pushExtractDatas(result.data);
            // 移除已抓取的页面
            await this.fetcher.removeFetchedPages();
          }
        }
        if (options?.extractTimes && this.extractDatas.length >= options.extractTimes) {
          this.stop();
          break;
        }

        
        // 控制爬取间隔
        await this.delay(this.config.interval || 1000);
      }
      
      return this.extractDatas;
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // 定义一个回调函数
  public onStoped: ((extractDatas: ExtractData[]) => void) | null = null;
 

  // 停止爬取
  public async stop(): Promise<void> {
    try{
      this.isRunning = false;
      this.urlQueue = [];
      if (this.onStoped) {
        this.onStoped(this.extractDatas);
      }
    } finally {
      // 关闭浏览器
      await this.fetcher.close();
    }
  
  }



  // 设置爬取间隔
  public setInterval(ms: number): void {
    this.config.interval = ms;
  }

  // 设置并发数
  public setConcurrency(limit: number): void {
    this.config.concurrency = limit;
  }

  // 获取要处理的URL批次
  protected getBatch(): string[] {
    const batchSize = this.config.concurrency || 1;
    return this.urlQueue.splice(0, batchSize);
  }

  // 处理一批URL
  protected async processBatch(urls: string[]): Promise<CrawlResult[]> {
    const promises = urls.map(url => this.processUrl(url));

    // 过滤掉失败的结果
    return Promise.all(promises).then(results => {
      return results.filter(result => result.success && result.data && result.data.length > 0);
    });
  }

  // 处理单个URL
  protected async processUrl(url: string): Promise<CrawlResult> {
    try {
      // 检查URL是否已访问
      if (this.visitedUrls.has(url)) {
        return {  success: false, reason: 'URL already visited' };
      }
      
      this.visitedUrls.add(url);

      // 获取内容
      const response = await this.fetcher.fetch(url, {
        timeout: this.config.timeout,
        headers: this.config.headers,
      });

      // 解析内容
      const content = await this.parser.parse(await response.text());
      
      // 提取新的URL
      const newUrls = await this.extractUrls(content);
      this.addNewUrls(newUrls);

      // 处理页面数据
      const result = await this.extractData(content);
      
      return result;

    } catch (error) {
      return this.handleUrlError(url, error);
    } 
  }

  // 提取URL的抽象方法 - 由子类实现
  protected abstract extractUrls(content: any): Promise<string[]>;

  // 提取数据的抽象方法 - 由子类实现
  protected abstract extractData(content: any): Promise<any>;

  // 添加新的URL到队列
  protected addNewUrls(urls: string[]): void {
    const newUrls = urls.filter(url => !this.visitedUrls.has(url));
    this.urlQueue.push(...newUrls);
  }

  // 延迟函数
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 错误处理
  protected handleError(error: any): void {
    console.error('Crawler error:', error);
  }

  // URL处理错误
  protected handleUrlError(url: string, error: any): CrawlResult {
    return {
      success: false,
      reason: error.message,
    };
  }

  // 合并爬取结果
  public mergeCrawlResults(): CrawlResult {
    // 实现结果合并逻辑
   return {
      success: true,
      data: this.extractDatas,
    };
  }

  public getVisitedUrls(): Set<string> {
    return this.visitedUrls;
  }
}
