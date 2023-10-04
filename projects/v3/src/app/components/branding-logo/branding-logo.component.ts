import { Component, Input } from '@angular/core';
import { BrowserStorageService } from '@v3/services/storage.service';

@Component({
  selector: 'app-branding-logo',
  templateUrl: './branding-logo.component.html',
})
export class BrandingLogoComponent {
  @Input() logo: string;
  @Input() name?: string;

  constructor(public storage: BrowserStorageService) {
    this.logo = this.logo || this.storage.getConfig().logo;
  }
}
