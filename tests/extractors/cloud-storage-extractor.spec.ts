import { test, expect } from '@playwright/test';
import { CloudStorageExtractor } from '../../src/extractors/services/cloud-storage-extractor';
import { Config } from '../../src/extractors/core/base-extractor';
import { chromium, Browser } from 'playwright';

test.describe('CloudStorageExtractor 测试', () => {
    // let browser: Browser;
    let extractor: CloudStorageExtractor;

    test.beforeAll(async () => {
        // browser = await chromium.launch();
    });

    test.afterAll(async () => {
        // await browser.close();
    });

    test.beforeEach(async () => {
        const config: Config = {
            siteUrl: 'about:blank',
            showBrowser: false
        };
        extractor = new CloudStorageExtractor(config);
    });

    test('应该能识别包含云盘关键词的页面', async ({ page }) => {
        // 准备测试服务器
        await page.route('**/*', route => {
            console.log('路由被触发', route);
            route.fulfill({
                status: 200,
                contentType: 'text/html; charset=UTF-8',
                body: '<html><body>这是一个云盘分享页面</body></html>',
            });
        });

        await page.goto('https://example.com');
        const result = await extractor.validate(page);
        expect(result).toBeTruthy();
    });

    test('应该能识别包含pan关键词的页面', async ({ page }) => {
        await page.route('**/*', route => {
            route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: '<html><body>this is a pan sharing page</body></html>'
            });
        });

        await page.goto('https://example.com');
        const result = await extractor.validate(page);
        expect(result).toBeTruthy();
    });

    test('应该能识别阿里云盘链接', async ({ page }) => {
        await page.route('**/*', route => {
            route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: '<html><body>分享链接：https://www.alipan.com/s/abc123</body></html>'
            });
        });

        await page.goto('https://example.com');
        const result = await extractor.validate(page);
        expect(result).toBeTruthy();
    });

    test('普通页面应该返回false', async ({ page }) => {
        await page.route('**/*', route => {
            route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: '<html><body>这是一个普通的网页</body></html>'
            });
        });

        await page.goto('https://example.com');
        const result = await extractor.validate(page);
        expect(result).toBeFalsy();
    });

    test('网络错误时应该正确处理', async ({ page }) => {
        await page.route('**/*', route => {
            route.abort('failed');
        });

        try {
            await page.goto('https://example.com');
            await extractor.validate(page);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    test('多个云盘特征同时存在时应该返回true', async ({ page }) => {
        await page.route('**/*', route => {
            route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: '<html><body>这是一个云盘页面，链接：https://www.alipan.com/s/abc123</body></html>'
            });
        });

        await page.goto('https://example.com');
        const result = await extractor.validate(page);
        expect(result).toBeTruthy();
    });
}); 