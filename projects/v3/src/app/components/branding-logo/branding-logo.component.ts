import { Component, Input } from '@angular/core';
import { BrowserStorageService } from '@v3/services/storage.service';

@Component({
  standalone: false,
  selector: 'app-branding-logo',
  templateUrl: './branding-logo.component.html',
})
export class BrandingLogoComponent {
  @Input() logo: string;
  @Input() name?: string;
  imgFailed = false;

  constructor(public storage: BrowserStorageService) {}

  get resolvedLogo(): string {
    return this.imgFailed ? null : (this.logo || this.storage.getConfig().logo);
  }

  onImgError(): void {
    this.imgFailed = true;
  }
}
