import { Page } from "playwright";

export interface ExtractorOptions {
    siteUrl: string;
    timeout?: number;
    // 其他通用选项...
  }
  
  export class ExtractResult {
    success!: boolean;
    data!: ExtractData[];
    error?: string;
  }

  export class ExtractData {
    url!: string; // 链接
    allTitle?: string; // 完整标题
    title?: string; // 标题
    extractCode?: string; // 提取码
    panType?: string; // 盘类型
    success?: boolean; // 是否成功
    reason?: string; // 失败原因
    updateTime?: string; // 更新时间
  }
  
  export interface IExtractor {
    extract(content: string): Promise<ExtractResult>;
    validate(result: ExtractResult): Promise<boolean>;
  }