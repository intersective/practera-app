import { TestBed } from '@angular/core/testing';
import { ProjectBrief } from '../models/project-brief.model';
import {
  PROJECT_BRIEF_PDF_LOADER,
  ProjectBriefPdfDocument,
  ProjectBriefPdfModule,
  ProjectBriefPdfService,
} from './project-brief-pdf.service';

class FakePdfDocument implements ProjectBriefPdfDocument {
  readonly textCalls: Array<{ text: string | string[]; x: number; y: number }> = [];
  readonly linkCalls: Array<{ text: string; x: number; y: number; url: string }> = [];
  readonly savedFilenames: string[] = [];
  readonly pageSelections: number[] = [];
  pageCount = 1;
  saveResult: ProjectBriefPdfDocument | Promise<void> | void;

  readonly internal = {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 80,
    },
  };

  addPage(): void {
    this.pageCount += 1;
  }

  getNumberOfPages(): number {
    return this.pageCount;
  }

  save(filename: string): ProjectBriefPdfDocument | Promise<void> | void {
    this.savedFilenames.push(filename);
    return this.saveResult;
  }

  setFont(): void {}

  setFontSize(): void {}

  setPage(pageNumber: number): void {
    this.pageSelections.push(pageNumber);
  }

  splitTextToSize(text: string): string[] {
    return text.length > 32 ? [text.slice(0, 32), text.slice(32)] : [text];
  }

  text(text: string | string[], x: number, y: number): void {
    this.textCalls.push({ text, x, y });
  }

  textWithLink(text: string, x: number, y: number, options: { url: string }): void {
    this.linkCalls.push({ text, x, y, url: options.url });
  }
}

describe('ProjectBriefPdfService', () => {
  let service: ProjectBriefPdfService;
  let loader: jasmine.Spy<() => Promise<ProjectBriefPdfModule>>;
  let document: FakePdfDocument;

  beforeEach(() => {
    document = new FakePdfDocument();
    const fakePdfFactory = function(): FakePdfDocument {
      return document;
    } as unknown as ProjectBriefPdfModule['jsPDF'];
    loader = jasmine.createSpy('projectBriefPdfLoader').and.resolveTo({
      jsPDF: fakePdfFactory,
    });

    TestBed.configureTestingModule({
      providers: [
        ProjectBriefPdfService,
        { provide: PROJECT_BRIEF_PDF_LOADER, useValue: loader },
      ],
    });
    service = TestBed.inject(ProjectBriefPdfService);
  });

  it('loads jsPDF only when a download is selected and saves a safe title filename', async () => {
    expect(loader).not.toHaveBeenCalled();

    await service.download({ title: 'Circular Economy: Q3 2026' });

    expect(loader).toHaveBeenCalledTimes(1);
    expect(document.savedFilenames).toEqual(['circular-economy-q3-2026-project-brief.pdf']);
  });

  it('falls back to the generic filename when the title has no safe slug', async () => {
    await service.download({ title: '---' });

    expect(document.savedFilenames).toEqual(['project-brief.pdf']);
  });

  it('writes organisation metadata and the existing presentation sections in their defined order', async () => {
    const brief: ProjectBrief = {
      title: 'Ordered Brief',
      organisationName: 'Example Organisation',
      organisationType: 'Social enterprise',
      description: 'Overview',
      industry: [],
    };

    await service.download(brief);

    const output = document.textCalls.flatMap(call => Array.isArray(call.text) ? call.text : [call.text]);
    expect(output).toContain('Example Organisation');
    expect(output).toContain('Social enterprise');
    expect(output.filter(text => text === 'None specified').length).toBeGreaterThan(1);
    expect(output.filter(text => [
      'Project Overview',
      'Scope of Work',
      'Organisational Context',
      'Problem Statement',
      'Focus Area',
      'Project Outcomes',
      'Industry',
      'Project Type',
      'Duration',
      'Location',
      'Website',
      'Technical Skills',
      'Professional Skills',
    ].includes(text))).toEqual([
      'Project Overview',
      'Scope of Work',
      'Organisational Context',
      'Problem Statement',
      'Focus Area',
      'Project Outcomes',
      'Industry',
      'Project Type',
      'Duration',
      'Location',
      'Website',
      'Technical Skills',
      'Professional Skills',
    ]);
  });

  it('represents Markdown headings and list hierarchy as selectable text while omitting raw HTML and images', async () => {
    await service.download({
      title: 'Markdown Brief',
      description: '# Heading\n\n- First\n- Second\n\n1. One\n2. Two\n\n<div>unsafe</div>\n\n![Diagram](https://images.example/diagram.png)',
    });

    const output = document.textCalls.flatMap(call => Array.isArray(call.text) ? call.text : [call.text]);
    expect(output).toContain('Heading');
    expect(output).toContain('- First');
    expect(output).toContain('- Second');
    expect(output).toContain('1. One');
    expect(output).toContain('2. Two');
    expect(output.join(' ')).not.toContain('unsafe');
    expect(output.join(' ')).not.toContain('images.example');
  });

  it('wraps text, starts new pages before overflow, and numbers every generated page', async () => {
    await service.download({
      title: 'Long Brief',
      description: 'This paragraph is deliberately long enough to be split into multiple selectable PDF lines.',
      scope: 'Another deliberately long section creates enough content for a new PDF page.',
    });

    expect(document.pageCount).toBeGreaterThan(1);
    expect(document.pageSelections).toEqual(Array.from({ length: document.pageCount }, (_, index) => index + 1));
    expect(document.textCalls.some(call => Array.isArray(call.text))).toBe(false);
    const output = document.textCalls.flatMap(call => Array.isArray(call.text) ? call.text : [call.text]);
    expect(output).toContain(`Page 1 of ${document.pageCount}`);
    expect(output).toContain(`Page ${document.pageCount} of ${document.pageCount}`);
  });

  it('creates a link only for a safe absolute HTTP(S) website and retains unsafe website text', async () => {
    await service.download({ title: 'Safe', website: 'https://example.com/brief' });
    await service.download({ title: 'Unsafe', website: 'javascript:alert(1)' });

    expect(document.linkCalls.some(call => call.url === 'https://example.com/brief')).toBe(true);
    expect(document.linkCalls.some(call => call.url.includes('javascript:'))).toBe(false);
    expect(document.textCalls.flatMap(call => Array.isArray(call.text) ? call.text : [call.text]))
      .toContain('javascript:alert(1)');
  });

  it('clears a rejected generation without an unhandled rejection so a later download can retry', async () => {
    const unhandledRejections: PromiseRejectionEvent[] = [];
    const captureUnhandledRejection = (event: PromiseRejectionEvent): void => {
      unhandledRejections.push(event);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', captureUnhandledRejection);
    loader.and.rejectWith(new Error('PDF module unavailable'));

    try {
      await expectAsync(service.download({ title: 'Retry brief' })).toBeRejectedWithError('PDF module unavailable');
      await new Promise<void>(resolve => window.setTimeout(resolve));
      expect(unhandledRejections).toEqual([]);

      loader.and.resolveTo({ jsPDF: function(): FakePdfDocument { return document; } as unknown as ProjectBriefPdfModule['jsPDF'] });
      await service.download({ title: 'Retry brief' });

      expect(loader).toHaveBeenCalledTimes(2);
      expect(document.savedFilenames).toEqual(['retry-brief-project-brief.pdf']);
    } finally {
      window.removeEventListener('unhandledrejection', captureUnhandledRejection);
    }
  });

  it('waits for a promise-returning save wrapper before resolving download', async () => {
    let resolveSave: () => void = () => undefined;
    document.saveResult = new Promise<void>(resolve => {
      resolveSave = resolve;
    });
    let finished = false;
    const download = service.download({ title: 'Async save' }).then(() => {
      finished = true;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(document.savedFilenames).toEqual(['async-save-project-brief.pdf']);
    expect(finished).toBe(false);

    resolveSave();
    await download;
    expect(finished).toBe(true);
  });
});
