import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: false,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    const html = this.markdownToHtml(value);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private markdownToHtml(md: string): string {
    let html = md;

    // Escape HTML entities first
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks (``` ... ```)
    html = html.replace(/```[\s\S]*?```/g, (match) => {
      const code = match.slice(3, -3).replace(/^\w*\n/, '');
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers (# to ######)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold and italic (***text*** or ___text___)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

    // Bold (**text** or __text__)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic (*text* or _text_)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Strikethrough (~~text~~)
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Horizontal rules
    html = html.replace(/^(?:---|\*\*\*|___)$/gm, '<hr>');

    // Unordered lists (- or * items)
    html = html.replace(/(?:^[\t ]*[-*]\s+.+$\n?)+/gm, (match) => {
      const items = match.trim().split('\n').map(line =>
        `<li>${line.replace(/^[\t ]*[-*]\s+/, '')}</li>`
      ).join('\n');
      return `<ul>\n${items}\n</ul>\n`;
    });

    // Ordered lists (1. items)
    html = html.replace(/(?:^\d+\.\s+.+$\n?)+/gm, (match) => {
      const items = match.trim().split('\n').map(line =>
        `<li>${line.replace(/^\d+\.\s+/, '')}</li>`
      ).join('\n');
      return `<ol>\n${items}\n</ol>\n`;
    });

    // Blockquotes
    html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // Paragraphs: split on blank lines (two+ newlines) to create <p> tags,
    // and convert single newlines within paragraphs to <br>.
    // First protect block-level elements from being wrapped in <p>.
    const blocks = html.split(/\n{2,}/);
    const blockTagRe = /^<(h[1-6]|ul|ol|pre|blockquote|hr)/;
    html = blocks
      .map(block => block.trim())
      .filter(block => block.length > 0)
      .map(block => {
        if (blockTagRe.test(block)) return block;
        const inner = block.replace(/\n/g, '<br>');
        return `<p>${inner}</p>`;
      })
      .join('\n');

    return html;
  }
}
