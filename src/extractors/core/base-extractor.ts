import { IExtractor, ExtractorOptions, ExtractResult } from '../types/extractor';
import { Browser, chromium, Page } from 'playwright';

export class Config {
  showBrowser: boolean = false;
  // 站点网址
  siteUrl: string = '';
}

export abstract class BaseExtractor implements IExtractor {

  protected browser!: Browser;
  protected config!: Config;

  protected constructor(config: Config) {
    this.config = config;
    this.init(config);
  }


  abstract extract(options: ExtractorOptions): Promise<ExtractResult>;
  
  abstract validate(page: Page): Promise<boolean>;


  // 初始化
  protected async init(config: Config) {
    await this.initBrowser(config);
  }

  // 初始化浏览器
  protected async initBrowser(config: Config) {
    this.browser = await chromium.launch({
      headless: !config.showBrowser
    });
  }
}