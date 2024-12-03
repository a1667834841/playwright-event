import { test, expect } from '@playwright/test';
import { qilePanTask } from '../../src/tasks/panTask';
import fs from 'fs/promises';
import path from 'path';

test.describe('panTask tests', () => {
    const outputPath = '/docs/pan/';
    const rootPath = path.resolve(process.cwd());
    test.beforeEach(async () => {
        // 确保输出目录存在
        try {
            await fs.mkdir(path.dirname(path.join(rootPath, outputPath)), { recursive: true });
        } catch (error) {
            // 目录已存在，忽略错误
        }
    });

    test('should crawl and generate markdown file', async () => {
        test.setTimeout(60000);
        const options = {
            extractTimes: 1,
            startUrl: 'https://www.qileso.com/62136.html'  // 替换为实际的起始URL
        };

        await qilePanTask(options);

        // 验证输出文件是否存在
        const files = await fs.readdir(path.join(rootPath, outputPath));
        expect(files.length).toBeGreaterThan(0);

        // 验证文件内容
        const mdContent = await fs.readFile(path.join(rootPath,outputPath, files[0]), 'utf-8');
        expect(mdContent).toContain('阿里云盘'); // 验证文件内容包含关键字
    });

   

    test.afterEach(async () => {
        // 清理测试生成的文件
        try {
            await fs.rm(path.join(rootPath, outputPath), { recursive: true, force: true });
        } catch (error) {
            // 忽略清理错误
        }
    });
}); 