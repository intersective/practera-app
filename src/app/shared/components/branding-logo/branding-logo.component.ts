import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-branding-logo',
  templateUrl: './branding-logo.component.html',
})
export class BrandingLogoComponent {
  @Input() logo: string;
}
