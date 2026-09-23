import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Marked, Token, Tokens } from 'marked';
import { safeHttpUrl } from '../models/project-brief.model';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function hasNestedTokens(token: Token): token is Token & { tokens: Token[] } {
  return 'tokens' in token && Array.isArray(token.tokens);
}

function renderTokenText(token: Token): string {
  return 'text' in token && typeof token.text === 'string' ? escapeHtml(token.text) : '';
}

function renderLinkLabel(tokens: Token[]): string {
  return tokens.map(token => {
    switch (token.type) {
      case 'text':
      case 'escape':
        return escapeHtml(token.text);
      case 'strong':
        return `<strong>${renderLinkLabel(token.tokens)}</strong>`;
      case 'em':
        return `<em>${renderLinkLabel(token.tokens)}</em>`;
      case 'del':
        return `<del>${renderLinkLabel(token.tokens)}</del>`;
      case 'codespan':
        return `<code>${escapeHtml(token.text)}</code>`;
      case 'html':
      case 'image':
        return '';
      default:
        return hasNestedTokens(token) ? renderLinkLabel(token.tokens) : renderTokenText(token);
    }
  }).join('');
}

@Pipe({
  name: 'projectBriefMarkdown',
  standalone: false,
})
export class ProjectBriefMarkdownPipe implements PipeTransform {
  private readonly marked: Marked;

  constructor(private sanitizer: DomSanitizer) {
    this.marked = new Marked({
      async: false,
      renderer: {
        html: () => '',
        image: ({ text }: Tokens.Image) => escapeHtml(text),
        link: ({ href, tokens }: Tokens.Link) => {
          const label = renderLinkLabel(tokens);
          const safeUrl = safeHttpUrl(href);
          return safeUrl
            ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`
            : label;
        },
      },
    });
  }

  transform(markdown: string | null | undefined): string {
    if (!markdown) {
      return '';
    }

    const renderedHtml = this.marked.parse(markdown, { async: false }) as string;
    return this.sanitizer.sanitize(SecurityContext.HTML, renderedHtml) ?? '';
  }
}
