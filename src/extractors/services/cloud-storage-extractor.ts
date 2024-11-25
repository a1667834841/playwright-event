// 云盘提取器
import { Page } from 'playwright';
import { BaseExtractor, Config } from '../core/base-extractor';
import { ExtractorOptions, ExtractResult } from '../types/extractor';

// 阿里云盘链接格式
const ALIYUN_PAN_URL_PATTERN = 'https://www.alipan.com/s';

export class CloudStorageExtractor extends BaseExtractor {


    constructor(config: Config) {
        super(config);
    }


    extract(options: ExtractorOptions): Promise<ExtractResult> {
        throw new Error('Method not implemented.');
    }

    async validate(page: Page): Promise<boolean> {
        // 1.判断访问链接页面是否有云盘、pan字样
        const content = await page.evaluate(() => document.documentElement.outerHTML);
        const hasCloudStorage = await this.hasCloudStorage(content);
        if (hasCloudStorage) {
            return true;
        }
        // 2.判断链接网页内容是否包含阿里云盘链接
        const hasAliyunPanUrl = await this.hasAliyunPanUrl(content);
        if (hasAliyunPanUrl) {
            return true;
        }

        return false;
    }

    // 判断访问链接页面是否有云盘、pan字样
    protected async hasCloudStorage(content: string): Promise<boolean> {
        return content.includes('云盘') || content.includes('pan');
    }

    // 判断链接网页内容是否包含阿里云盘链接
    protected async hasAliyunPanUrl(content: string): Promise<boolean> {
        return content.includes(ALIYUN_PAN_URL_PATTERN);
    }

}