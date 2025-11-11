import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UtilsService } from '@v3/services/utils.service';

/**
 * Pipe to add lang attributes to HTML content for WCAG 3.1.2 Language of Parts compliance.
 * Processes HTML content and wraps foreign language passages with lang attributes.
 * Handles SafeHtml and includes caching for performance.
 */
@Pipe({
  name: 'detectLanguage',
  standalone: false
})
export class LanguageDetectionPipe implements PipeTransform {
  private lastContent: string | SafeHtml | null | undefined;
  private lastResult: SafeHtml;

  constructor(
    private utils: UtilsService,
    private sanitizer: DomSanitizer
  ) {}

  transform(htmlContent: string | SafeHtml | null | undefined, defaultLang?: string): SafeHtml {
    if (htmlContent === this.lastContent) {
      return this.lastResult;
    }

    let contentString: string;
    if (typeof htmlContent === 'string') {
      contentString = htmlContent;
    } else if (htmlContent instanceof Object && 'changingThisBreaksApplicationSecurity' in htmlContent) {
      // This is a way to check if it's a SafeHtml object without private APIs.
      // The ideal way is to get the raw string, but SafeHtml is opaque.
      // This workaround extracts the value, but it's fragile.
      // A better long-term solution is to apply language detection *before* sanitization.
      contentString = (htmlContent as any).changingThisBreaksApplicationSecurity;
    } else {
      contentString = '';
    }

    if (!contentString) {
      this.lastResult = this.sanitizer.bypassSecurityTrustHtml('');
      this.lastContent = htmlContent;
      return this.lastResult;
    }

    const processedContent = this.utils.addLanguageAttributes(contentString, defaultLang);
    this.lastResult = this.sanitizer.bypassSecurityTrustHtml(processedContent);
    this.lastContent = htmlContent;

    return this.lastResult;
  }
}

