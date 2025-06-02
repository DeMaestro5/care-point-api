declare module 'docx' {
  export class Document {
    sections: Array<{
      children: Array<any>;
    }>;
    constructor(options?: {
      sections?: Array<{
        children?: Array<any>;
      }>;
    });
  }

  export class Paragraph {
    constructor(options: {
      text?: string;
      heading?: HeadingLevel;
      alignment?: AlignmentType;
      children?: Array<TextRun>;
    });
  }

  export class TextRun {
    constructor(options: { text: string });
  }

  export enum HeadingLevel {
    HEADING_1 = 'HEADING_1',
    HEADING_2 = 'HEADING_2',
    HEADING_3 = 'HEADING_3',
  }

  export enum AlignmentType {
    JUSTIFIED = 'JUSTIFIED',
  }

  export class Packer {
    static toBuffer(doc: Document): Promise<Buffer>;
  }
}
