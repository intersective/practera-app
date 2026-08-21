import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ProjectBriefMarkdownPipe } from './project-brief-markdown.pipe';

describe('ProjectBriefMarkdownPipe', () => {
  let pipe: ProjectBriefMarkdownPipe;

  beforeEach(() => {
    pipe = new ProjectBriefMarkdownPipe(TestBed.inject(DomSanitizer));
  });

  it('renders supported Markdown after Angular HTML sanitization', () => {
    const html = pipe.transform('A **strong** project brief.');

    expect(html).toContain('<strong>strong</strong>');
  });

  it('removes raw HTML and images', () => {
    const html = pipe.transform('<iframe src="https://unsafe.example"></iframe>![Diagram](https://images.example/diagram.png)');

    expect(html).not.toContain('iframe');
    expect(html).not.toContain('img');
    expect(html).not.toContain('images.example');
  });

  it('keeps HTTP(S) links clickable and unsafe links as readable text', () => {
    const html = pipe.transform('[Safe link](https://example.com) and [Unsafe link](javascript:alert(1))');

    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain('Safe link');
    expect(html).toContain('Unsafe link');
    expect(html).not.toContain('javascript:');
  });

  it('omits raw HTML tokens nested in safe and unsafe link labels while preserving readable Markdown', () => {
    const html = pipe.transform(
      '[Before <span>label</span> **strong** *emphasis* `code` After](https://example.com) ' +
      'and [Before <span>label</span> **strong** *emphasis* `code` After](javascript:alert(1))'
    );

    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain('Before label');
    expect(html).toContain('<strong>strong</strong>');
    expect(html).toContain('<em>emphasis</em>');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('After');
    expect(html).not.toContain('span');
    expect(html).not.toContain('&lt;');
    expect(html).not.toContain('javascript:');
  });

  it('preserves GFM strikethrough in safe and unsafe link labels', () => {
    const html = pipe.transform(
      '[Before ~~removed~~ After](https://example.com) ' +
      'and [Before ~~removed~~ After](javascript:alert(1))'
    );

    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain('Before');
    expect(html).toContain('After');
    expect(html.match(/<del>removed<\/del>/g)?.length).toBe(2);
    expect(html).not.toContain('javascript:');
  });
});
