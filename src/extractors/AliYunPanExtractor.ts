// 阿里云盘提取器
import { ExtractData, ExtractorOptions, ExtractResult } from "./core/extractor";
import { BaseExtractor } from "./core/baseExtractor";
import { JSDOM } from 'jsdom';
import { CrawlPanSite } from "../types/PanSiteType";


export class AliYunPanExtractor extends BaseExtractor {

    // 支持的网站
    // 奇乐搜

    constructor(options: ExtractorOptions) {
        super(options);
    }


    async extract(content: string): Promise<ExtractResult> {

        let extractDataList: ExtractData[] = [];
        switch (this.options.siteUrl) {
            case CrawlPanSite.QILE_PAN:
                extractDataList = this.qileiPanExtract(content);
                break;
            default:
                throw new Error('Unsupported site URL');
        }

        const extractResult = new ExtractResult();
        extractResult.data = extractDataList;
        extractResult.success = true;

        if (await this.validate(extractResult)) {
            return Promise.resolve(extractResult);
        } else {
            return Promise.reject(new Error('Invalid extract result'));
        }
    }


    async validate(result: ExtractResult): Promise<boolean> {
        // 验证提取结果是否有效
        const extractDataList = result.data;
        for (const extractData of extractDataList) {
            if (!extractData.url.startsWith('https://www.alipan.com/s')) {
                return Promise.resolve(false);
            }
            if (extractData.url == '') {
                return Promise.resolve(false);
            }
        }
        return Promise.resolve(true);
    }

    // 奇乐搜提取
    private qileiPanExtract(content: string): ExtractData[] {
        const dom = new JSDOM(content);
        const document = dom.window.document;

        // 找到页面 rel="bookmark"的text
        const bookmark = document.querySelector('a[rel="bookmark"]')?.textContent;

        // 查找所有阿里云盘链接
        const links = document.querySelectorAll('a');
        const panLinks = Array.from(links)
            .map(link => link)
            .filter(link => link.href.startsWith('https://www.alipan.com/s'))
            .map(link => {
                // 提取a标签中的内容的验证码后的文字
                const extractCode = link.textContent?.split(/验证码：|提取码：/g)[1];
                return { url: link.href, extractCode };
            });

        // 去重
        const uniquePanLinks = [...new Set(panLinks)];

        const extractDataList: ExtractData[] = [];
        for (const panLink of uniquePanLinks) {
            const extractData: ExtractData = {
                url: panLink.url,
                title: bookmark || '',
                extractCode: panLink.extractCode || '',
                panType: '阿里云盘'
            };
            extractDataList.push(extractData);
        }
        return extractDataList;
    }


}