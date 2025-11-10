import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from '@v3/services/utils.service';

/**
 * Pipe to add lang attributes to HTML content for WCAG 3.1.2 Language of Parts compliance
 * Processes HTML content and wraps foreign language passages with lang attributes
 */
@Pipe({
  name: 'detectLanguage',
  standalone: false
})
export class LanguageDetectionPipe implements PipeTransform {
  constructor(private utils: UtilsService) {}

  transform(htmlContent: string | null | undefined, defaultLang?: string): string {
    if (!htmlContent) {
      return '';
    }

    return this.utils.addLanguageAttributes(htmlContent, defaultLang);
  }
}




