import { Browser,Response  } from "playwright";

export interface IFetcher {
    fetch(url: string, options?: FetchOptions): Promise<Response>;
    downloadFile(url: string, path: string): Promise<void>;
}

export interface FetchOptions {
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}

// 添加默认实现
export class BaseFetcher implements IFetcher {

    private browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async fetch(url: string, options?: FetchOptions): Promise<Response> {
        if (!this.browser) {
            throw new Error('Browser is required');
        }
        const page = await this.browser?.newPage();
        const response = await page?.goto(url, { timeout: options?.timeout });
        return response as Response;
    }
    downloadFile(url: string, path: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

