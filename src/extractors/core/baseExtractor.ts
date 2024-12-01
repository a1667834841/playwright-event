import { Page } from 'playwright';
import { IExtractor, ExtractorOptions, ExtractResult } from './extractor';

export abstract class BaseExtractor implements IExtractor {

  protected options: ExtractorOptions;

  constructor(options: ExtractorOptions) {
    if (options == null) {
      throw new Error('Extractor options is required');
    }
    if (options.siteUrl == null) {
      throw new Error('Site URL is required');
    }
    this.options = options;
  }


  abstract extract(content: string): Promise<ExtractResult>;

  abstract validate(result: ExtractResult): Promise<boolean>;


}