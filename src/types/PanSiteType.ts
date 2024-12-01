/**
 * 支持爬取的网盘网站类型
 */
export enum CrawlPanSite {

  // 奇乐搜
  QILE_PAN = 'https://www.qileso.com',
}

/**
 * 支持的网盘站点类型枚举
 */
export enum PanSiteType {
  /** 阿里云盘 */
  ALIYUN = '阿里云盘',
  
  /** 百度网盘 */
  BAIDU = '百度网盘',
  
  /** 蓝奏云 */
  LANZOU = '蓝奏云',
  
  /** 天翼云盘 */
  TIANYI = '天翼云盘',
  
  /** 123云盘 */
  YIERYISAN = '123云盘',
  
  /** 迅雷云盘 */
  XUNLEI = '迅雷云盘',
  
  /** 微云 */
  WEIYUN = '微云',
  
  /** 腾讯微云 */
  TENGXUN = '腾讯微云',
  
  /** 和彩云 */
  HECAIYUN = '和彩云',
  
  /** 奶牛快传 */
  COWTRANSFER = '奶牛快传',
  
  /** 未知类型 */
  UNKNOWN = '未知类型'
} 
