// 用于爬取阿里云盘的链接
import { QilePanCrawler } from "../crawlers/base/pan/QilePanCrawler";
import { CrawlOptions } from "../crawlers/base/BaseCrawler";
import path from "path";

const OUTPUT_PATH = '/docs/pan/';

// 获取项目根目录
const rootPath = path.resolve(process.cwd());

export async function qilePanTask(options: CrawlOptions): Promise<void> {
    const crawler = await QilePanCrawler.create();
    await crawler.start(options);

    await crawler.createMdFile(path.join(rootPath, OUTPUT_PATH));

}
