import { test, expect } from '@playwright/test';
import { AliYunPanExtractor } from '../src/extractors/AliYunPanExtractor';
import { fail } from 'assert';
import { CrawlPanSite } from '../src/types/PanSiteType';

test.describe('AliYunPanExtractor Tests', () => {
    let extractor: AliYunPanExtractor;

    test.beforeEach(() => {
        extractor = new AliYunPanExtractor({
            siteUrl: CrawlPanSite.QILE_PAN
        });
    });

    test('should extract aliyun pan links and codes correctly', async () => {
        const mockHtml = `
            <html>
                <body>
                    <a rel="bookmark">测试资源标题</a>
                    <div>
                        <a href="https://www.alipan.com/s/123456">资源1 提取码：abc123</a>
                        <a href="https://www.alipan.com/s/789012">资源2 验证码：def456</a>
                    </div>
                </body>
            </html>
        `;

        const result = await extractor.extract(mockHtml);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);

        // 验证第一个链接
        expect(result.data[0]).toEqual({
            url: 'https://www.alipan.com/s/123456',
            title: '测试资源标题',
            extractCode: 'abc123',
            panType: '阿里云盘'
        });

        // 验证第二个链接
        expect(result.data[1]).toEqual({
            url: 'https://www.alipan.com/s/789012',
            title: '测试资源标题',
            extractCode: 'def456',
            panType: '阿里云盘'
        });
    });

    test('should handle empty content', async () => {
        const result = await extractor.extract('');
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(0);
    });

    test('should throw error for unsupported site', async () => {
        extractor = new AliYunPanExtractor({
            siteUrl: 'https://unsupported.com'
        });
        try {
            await extractor.extract('');
            fail('Should have thrown an error');
        } catch (error: unknown) {
            expect((error as Error).message).toBe('Unsupported site URL');
        }
    });
}); 