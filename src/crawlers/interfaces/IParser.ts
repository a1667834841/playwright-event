export interface IParser {
    parse<T>(content: string): Promise<string>;
    parseHTML(html: string): Promise<Element>;
    parseJSON(json: string): Promise<unknown>;
}

export interface ParseResult {
    url: string;
    title: string;
    content: string;
}

export class BaseParser implements IParser {
    async parse(content: string): Promise<string> {
        return content;
    }

    async parseHTML(html: string): Promise<Element> {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.documentElement;
    }

    async parseJSON(json: string): Promise<unknown> {
        try {
            return JSON.parse(json);
        } catch {
            return null;
        }
    }
}




