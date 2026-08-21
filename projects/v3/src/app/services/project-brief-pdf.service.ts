import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Marked, Token, Tokens } from 'marked';
import {
  buildProjectBriefPresentation,
  ProjectBrief,
  ProjectBriefPresentationSection,
} from '../models/project-brief.model';

export interface ProjectBriefPdfDocument {
  readonly internal: {
    pageSize: {
      getWidth(): number;
      getHeight(): number;
    };
  };
  addPage(): void;
  getNumberOfPages(): number;
  save(filename: string): ProjectBriefPdfDocument | Promise<void> | void;
  setFont(fontName: string, fontStyle?: string): void;
  setFontSize(size: number): void;
  setPage(pageNumber: number): void;
  splitTextToSize(text: string, maxLength: number): string[];
  text(text: string | string[], x: number, y: number): void;
  textWithLink(text: string, x: number, y: number, options: { url: string }): void;
}

export interface ProjectBriefPdfFactory {
  new(options: { format: 'a4'; orientation: 'portrait'; unit: 'mm' }): ProjectBriefPdfDocument;
}

export interface ProjectBriefPdfModule {
  jsPDF: ProjectBriefPdfFactory;
}

export type ProjectBriefPdfLoader = () => Promise<ProjectBriefPdfModule>;

export const PROJECT_BRIEF_PDF_LOADER = new InjectionToken<ProjectBriefPdfLoader>(
  'PROJECT_BRIEF_PDF_LOADER',
  {
    providedIn: 'root',
    factory: () => () => import('jspdf').then(({ jsPDF }) => ({ jsPDF })),
  }
);

export const PROJECT_BRIEF_PDF_PAGE = {
  margin: 20,
  lineHeight: 6,
  sectionGap: 3,
} as const;

interface PdfTextLine {
  text: string;
  indent: number;
  style: 'bold' | 'normal';
}

function inlineText(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.type === 'html' || token.type === 'image') {
      return '';
    }

    if ('tokens' in token && Array.isArray(token.tokens)) {
      return inlineText(token.tokens);
    }

    return 'text' in token && typeof token.text === 'string' ? token.text : '';
  }).join('');
}

function markdownLines(tokens: Token[], indent = 0): PdfTextLine[] {
  const lines: PdfTextLine[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'html':
      case 'image':
      case 'space':
      case 'hr':
        break;
      case 'heading': {
        const heading = inlineText(token.tokens).trim();
        if (heading) {
          lines.push({ text: heading, indent, style: 'bold' });
        }
        break;
      }
      case 'paragraph': {
        const paragraph = inlineText(token.tokens).trim();
        if (paragraph) {
          lines.push({ text: paragraph, indent, style: 'normal' });
        }
        break;
      }
      case 'list': {
        const start = typeof token.start === 'number' ? token.start : 1;
        token.items.forEach((item, index) => {
          const itemLines = markdownLines(item.tokens, indent + 4);
          const prefix = token.ordered ? `${start + index}. ` : '- ';
          if (itemLines.length === 0) {
            const itemText = inlineText(item.tokens).trim();
            if (itemText) {
              lines.push({ text: `${prefix}${itemText}`, indent, style: 'normal' });
            }
            return;
          }

          const [firstLine, ...remainingLines] = itemLines;
          lines.push({
            text: `${prefix}${firstLine.text}`,
            indent,
            style: firstLine.style,
          });
          lines.push(...remainingLines);
        });
        break;
      }
      case 'blockquote':
        lines.push(...markdownLines(token.tokens, indent + 4));
        break;
      case 'code':
        token.text.split('\n').filter(Boolean).forEach(text => {
          lines.push({ text, indent, style: 'normal' });
        });
        break;
      case 'table':
        token.header.forEach(cell => {
          const cellText = inlineText(cell.tokens).trim();
          if (cellText) {
            lines.push({ text: cellText, indent, style: 'bold' });
          }
        });
        token.rows.forEach(row => {
          const rowText = row.map(cell => inlineText(cell.tokens).trim()).filter(Boolean).join(' | ');
          if (rowText) {
            lines.push({ text: rowText, indent, style: 'normal' });
          }
        });
        break;
      default: {
        const text = 'tokens' in token && Array.isArray(token.tokens)
          ? inlineText(token.tokens).trim()
          : ('text' in token && typeof token.text === 'string' ? token.text.trim() : '');
        if (text) {
          lines.push({ text, indent, style: 'normal' });
        }
      }
    }
  }

  return lines;
}

export function projectBriefPdfFilename(title: string | null | undefined): string {
  const slug = (title ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug ? `${slug}-project-brief.pdf` : 'project-brief.pdf';
}

@Injectable({ providedIn: 'root' })
export class ProjectBriefPdfService {
  private readonly marked = new Marked({ async: false });
  private pendingDownload: Promise<void> | null = null;

  constructor(@Inject(PROJECT_BRIEF_PDF_LOADER) private readonly loadPdf: ProjectBriefPdfLoader) {}

  download(projectBrief: ProjectBrief): Promise<void> {
    if (this.pendingDownload) {
      return this.pendingDownload;
    }

    const pendingDownload = this.generate(projectBrief);
    this.pendingDownload = pendingDownload;
    pendingDownload.then(
      () => this.clearPendingDownload(pendingDownload),
      () => this.clearPendingDownload(pendingDownload),
    );
    return pendingDownload;
  }

  private clearPendingDownload(pendingDownload: Promise<void>): void {
    if (this.pendingDownload === pendingDownload) {
      this.pendingDownload = null;
    }
  }

  private async generate(projectBrief: ProjectBrief): Promise<void> {
    const { jsPDF } = await this.loadPdf();
    const document = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' });
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (PROJECT_BRIEF_PDF_PAGE.margin * 2);
    let cursorY = PROJECT_BRIEF_PDF_PAGE.margin;

    const writeLine = (text: string, indent = 0, style: 'bold' | 'normal' = 'normal', link?: string): void => {
      const x = PROJECT_BRIEF_PDF_PAGE.margin + indent;
      const wrappedLines = document.splitTextToSize(text, contentWidth - indent);

      document.setFont('helvetica', style);
      wrappedLines.forEach(wrappedLine => {
        if (cursorY + PROJECT_BRIEF_PDF_PAGE.lineHeight > pageHeight - PROJECT_BRIEF_PDF_PAGE.margin) {
          document.addPage();
          cursorY = PROJECT_BRIEF_PDF_PAGE.margin;
        }

        if (link) {
          document.textWithLink(wrappedLine, x, cursorY, { url: link });
        } else {
          document.text(wrappedLine, x, cursorY);
        }
        cursorY += PROJECT_BRIEF_PDF_PAGE.lineHeight;
      });
    };

    const writeSection = (section: ProjectBriefPresentationSection): void => {
      if (cursorY + PROJECT_BRIEF_PDF_PAGE.lineHeight > pageHeight - PROJECT_BRIEF_PDF_PAGE.margin) {
        document.addPage();
        cursorY = PROJECT_BRIEF_PDF_PAGE.margin;
      }
      writeLine(section.title, 0, 'bold');

      if (section.kind === 'chips') {
        const values = Array.isArray(section.value) ? section.value : [];
        if (values.length === 0) {
          writeLine($localize`:@@projectBriefNoneSpecified:None specified`, 4);
        } else {
          values.forEach(value => writeLine(`- ${value}`, 4));
        }
      } else if (section.kind === 'link') {
        const value = typeof section.value === 'string' ? section.value : '';
        writeLine(value || $localize`:@@projectBriefNoneSpecified:None specified`, 4, 'normal', section.href ?? undefined);
      } else {
        const value = typeof section.value === 'string' ? section.value : '';
        const lines = markdownLines(this.marked.lexer(value));
        if (lines.length === 0) {
          writeLine($localize`:@@projectBriefNoneSpecified:None specified`, 4);
        } else {
          lines.forEach(line => writeLine(line.text, line.indent + 4, line.style));
        }
      }
      cursorY += PROJECT_BRIEF_PDF_PAGE.sectionGap;
    };

    const presentation = buildProjectBriefPresentation(projectBrief);
    document.setFontSize(18);
    writeLine(presentation.title || $localize`:@@projectBriefPdfTitle:Project Brief`, 0, 'bold');
    document.setFontSize(11);
    if (presentation.organisationName) {
      writeLine(presentation.organisationName, 0, 'bold');
    }
    if (presentation.organisationType) {
      writeLine(presentation.organisationType);
    }
    cursorY += PROJECT_BRIEF_PDF_PAGE.sectionGap;

    presentation.sections.forEach(writeSection);

    const pageCount = document.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      document.setPage(page);
      document.setFont('helvetica', 'normal');
      document.setFontSize(9);
      document.text(`Page ${page} of ${pageCount}`, PROJECT_BRIEF_PDF_PAGE.margin, pageHeight - 10);
    }

    const saveResult = document.save(projectBriefPdfFilename(presentation.title));
    if (saveResult instanceof Promise) {
      await saveResult;
    }
  }
}
