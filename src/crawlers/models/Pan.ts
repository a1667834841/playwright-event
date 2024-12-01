// 盘资源
export class PanLink {
    urls!: PanLinkUrl[];
    shareId!: string;
    title!: string;
    tags!: string[];

    // 类型
    type?: string;
}

export class PanLinkUrl {
    url!: string;
    // 提取码
    extractCode?: string;
}
