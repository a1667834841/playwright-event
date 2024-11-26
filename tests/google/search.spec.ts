import { test, expect } from '@playwright/test';
import { aliyunpanSearch, searchGoogle } from '../../src/utils/google/search';


test.skip('Google Search Tests', () => {
  test('should return search results for given keyword', async () => {
    const results = await searchGoogle('playwright testing');
    
    // 验证返回结果不为空
    expect(results.length).toBeGreaterThan(0);
    
    // 验证结果格式
    results.forEach(result => {
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('link');
      expect(result.link).toMatch(/^https?:\/\//); // 验证链接格式
    });
  });

  test('should handle special characters in search', async () => {
    const results = await searchGoogle('playwright @#$%^');
    expect(results.length).toBeGreaterThan(0);
  });

  test('should search for aliyunpan', async () => {
    const results = await aliyunpanSearch();
    expect(results.length).toBeGreaterThan(0);
  });
}); 