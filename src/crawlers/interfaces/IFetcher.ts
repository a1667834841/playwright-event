import { Browser,Response, Page } from "playwright";

export interface IFetcher {
    fetch(url: string, options?: FetchOptions): Promise<Response>;
    downloadFile(url: string, path: string): Promise<void>;
    removeFetchedPages(): Promise<void>;
    close(): Promise<void>;
}

export interface FetchOptions {
    timeout?: number | 30000;
    retries?: number;
    headers?: Record<string, string>;
}

// 添加默认实现
export class BaseFetcher implements IFetcher {

    private browser: Browser;
    private fetchedPages: Page[];

    constructor(browser: Browser) {
        this.browser = browser;
        this.fetchedPages = [];
    }

    async fetch(url: string, options?: FetchOptions): Promise<Response> {
        let page: Page | null = null;
        try {
            if (!this.browser) {
                throw new Error('Browser is required');
            }
            page = await this.browser?.newPage();
            const response = await page?.goto(url, { timeout: options?.timeout });
            return response as Response;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        } finally {
            if (page) {
                this.fetchedPages.push(page);
            }
        }
    }
    downloadFile(url: string, path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async removeFetchedPages(): Promise<void> {
        this.fetchedPages.forEach(page => {
            page.close();
        });
        this.fetchedPages = [];
    }

    async close(): Promise<void> {
        await this.removeFetchedPages();
        await this.browser.close();
    }
}

