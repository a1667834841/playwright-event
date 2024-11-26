import { CrawlResult } from "../models/CrawlResult";

export interface ICrawler {
    // 爬虫基础配置
    config: ICrawlerConfig;
    
    // 开始爬取
    crawl(url: string): Promise<CrawlResult>;
    
    // 停止爬取
    stop(): void;
    
    // 设置爬取间隔
    setInterval(ms: number): void;
    
    // 设置并发数
    setConcurrency(limit: number): void;
  }
  
  export interface ICrawlerConfig {
    timeout?: number;
    retries?: number;
    interval?: number;
    concurrency?: number;
    headers?: Record<string, string>;
  }