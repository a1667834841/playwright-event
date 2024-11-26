import { ICrawler, ICrawlerConfig } from '../interfaces/ICrawler';
import { IFetcher } from '../interfaces/IFetcher';
import { IParser } from '../interfaces/IParser';
import { CrawlResult } from '../models/CrawlResult';
import { Response } from 'playwright';

export class CrawlOptions {
    extractCode?: string;
}

export abstract class BaseCrawler implements ICrawler {
  protected isRunning: boolean = false;
  protected urlQueue: string[] = [];
  protected visitedUrls: Set<string> = new Set();
  
  constructor(
    public readonly config: ICrawlerConfig,
    protected readonly fetcher: IFetcher,
    protected readonly parser: IParser
  ) {}

  // 核心爬取方法
  public async crawl(startUrl: string, options?: CrawlOptions): Promise<CrawlResult> {
    try {
      this.isRunning = true;
      this.urlQueue.push(startUrl);
      
      const results: CrawlResult[] = [];
      
      while (this.isRunning && this.urlQueue.length > 0) {
        const urls = this.getBatch();
        const batchResults = await this.processBatch(urls);
        results.push(...batchResults);
        
        // 控制爬取间隔
        await this.delay(this.config.interval || 1000);
      }
      
      return this.mergeCrawlResults(results);
      
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // 停止爬取
  public stop(): void {
    this.isRunning = false;
    this.urlQueue = [];
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
    return Promise.all(promises);
  }

  // 处理单个URL
  protected async processUrl(url: string): Promise<CrawlResult> {
    try {
      // 检查URL是否已访问
      if (this.visitedUrls.has(url)) {
        return { url, success: false, reason: 'URL already visited' };
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
      const data = await this.extractData(content);
      
      return {
        url,
        success: true,
        data,
      };

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
      url,
      success: false,
      reason: error.message,
    };
  }

  // 合并爬取结果
  protected mergeCrawlResults(results: CrawlResult[]): CrawlResult {
    // 实现结果合并逻辑
    return {
      success: true,
      data: results,
    };
  }
}