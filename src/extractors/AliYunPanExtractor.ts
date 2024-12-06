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
        let bookmark = document.querySelector('a[rel="bookmark"]')?.textContent;
        if (bookmark){
            // 移除 夸克网盘、阿里网盘、百度网盘、迅雷网盘
            bookmark = bookmark.replace(/夸克网盘|阿里网盘|百度网盘|迅雷网盘/g, '');
            // 移除空格
            bookmark = bookmark.replace(/\s+/g, '');
        }
        let title = bookmark || '';
        if (title.length > 0 && title.includes('《')){
            // 只提取《》之间的文字
            title = title.match(/《(.*?)》/)?.[1] || '';
        }

        // 提取出 #body > div > div.thread-body > div.thread-top.text-center.my-4 > div > span:nth-child(2)
        const updateTime = document.querySelector('#body > div > div.thread-body > div.thread-top.text-center.my-4 > div > span:nth-child(2)')?.textContent;
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
                title: title,
                allTitle: bookmark || '',
                extractCode: panLink.extractCode || '',
                panType: '阿里云盘',
                updateTime: updateTime || '',
            };
            extractDataList.push(extractData);
        }

        //TODO 如果title有相同的，只取extractDataList中updateTime最大的extractData
        
        return extractDataList;
    }


}