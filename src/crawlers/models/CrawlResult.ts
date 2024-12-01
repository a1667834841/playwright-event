import { ExtractData } from "../../extractors/core/extractor";

export class CrawlResult {
    metadata?: any;
    success!: boolean;
    reason?: string;
    data?: ExtractData[];
}


