// 用于爬取阿里云盘的链接
import { QilePanCrawler } from "../crawlers/base/pan/QilePanCrawler";
import { CrawlOptions } from "../crawlers/base/BaseCrawler";


export async function qilePanTask(options: CrawlOptions): Promise<string> {
    const crawler = await QilePanCrawler.create();
    await crawler.start(options);

    return crawler.toMd();

}
