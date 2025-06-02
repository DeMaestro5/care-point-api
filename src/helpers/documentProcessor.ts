import { PDFDocument, rgb } from 'pdf-lib';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { BadRequestError } from '../core/ApiError';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ProcessedDocument {
  buffer: Buffer;
  contentType: string;
}

export async function processPDFTemplate(
  templateBuffer: Buffer,
  data: Record<string, any>,
): Promise<ProcessedDocument> {
  try {
    // First, extract text from the PDF
    const pdfData = await pdfParse(templateBuffer);
    const extractedText = pdfData.text;

    // Replace placeholders in the extracted text
    let modifiedContent = extractedText;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      modifiedContent = modifiedContent.replace(placeholder, String(value));
    });

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBuffer);
    const pages = pdfDoc.getPages();

    // Process each page
    for (const page of pages) {
      const { height } = page.getSize();

      // Clear existing content (optional, comment out if you want to keep original content)
      // page.drawRectangle({
      //   x: 0,
      //   y: 0,
      //   width: page.getWidth(),
      //   height: page.getHeight(),
      //   color: rgb(1, 1, 1),
      // });

      // Draw the modified content
      page.drawText(modifiedContent, {
        x: 50,
        y: height - 50,
        size: 12,
        color: rgb(0, 0, 0),
      });
    }

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return {
      buffer: Buffer.from(modifiedPdfBytes),
      contentType: 'application/pdf',
    };
  } catch (error) {
    console.error('Error processing PDF template:', error);
    throw new BadRequestError('Failed to process PDF template');
  }
}

export async function processDOCXTemplate(
  templateBuffer: Buffer,
  data: Record<string, any>,
): Promise<ProcessedDocument> {
  try {
    // Convert DOCX to HTML to preserve formatting
    const result = await mammoth.convertToHtml({ buffer: templateBuffer });
    let htmlContent = result.value;

    // Replace placeholders in the HTML content
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(placeholder, String(value));
    });

    // Create a new document with initial section
    const doc = new Document({
      sections: [
        {
          children: [],
        },
      ],
    });

    // Convert HTML to DOCX structure
    const paragraphs = htmlContent.split('\n').map((line) => {
      // Check if line is a heading
      if (line.startsWith('<h1>')) {
        return new Paragraph({
          text: line.replace(/<h1>(.*?)<\/h1>/, '$1'),
          heading: HeadingLevel.HEADING_1,
        });
      } else if (line.startsWith('<h2>')) {
        return new Paragraph({
          text: line.replace(/<h2>(.*?)<\/h2>/, '$1'),
          heading: HeadingLevel.HEADING_2,
        });
      } else if (line.startsWith('<h3>')) {
        return new Paragraph({
          text: line.replace(/<h3>(.*?)<\/h3>/, '$1'),
          heading: HeadingLevel.HEADING_3,
        });
      } else if (line.startsWith('<p>')) {
        return new Paragraph({
          text: line.replace(/<p>(.*?)<\/p>/, '$1'),
          alignment: AlignmentType.JUSTIFIED,
        });
      } else {
        return new Paragraph({
          children: [new TextRun({ text: line })],
        });
      }
    });

    // Add the paragraphs to the first section
    doc.sections[0].children.push(...paragraphs);

    // Generate the document
    const buffer = await Packer.toBuffer(doc);
    return {
      buffer,
      contentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  } catch (error) {
    console.error('Error processing DOCX template:', error);
    throw new BadRequestError('Failed to process DOCX template');
  }
}

export async function processTextTemplate(
  templateBuffer: Buffer,
  data: Record<string, any>,
): Promise<ProcessedDocument> {
  try {
    const templateContent = templateBuffer.toString('utf-8');
    let processedContent = templateContent;

    // Replace placeholders with provided data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(placeholder, String(value));
    });

    return {
      buffer: Buffer.from(processedContent, 'utf-8'),
      contentType: 'text/plain',
    };
  } catch (error) {
    console.error('Error processing text template:', error);
    throw new BadRequestError('Failed to process text template');
  }
}
