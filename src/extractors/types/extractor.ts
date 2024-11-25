import { Page } from "playwright";

export interface ExtractorOptions {
    url: string;
    timeout?: number;
    // 其他通用选项...
  }
  
  export interface ExtractResult {
    success: boolean;
    data: any;
    error?: string;
    metadata?: Record<string, any>;
  }
  
  export interface IExtractor {
    extract(options: ExtractorOptions): Promise<ExtractResult>;
    validate(page: Page): Promise<boolean>;
  }