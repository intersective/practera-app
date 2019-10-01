import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-custom',
  templateUrl: './icon.component.html'
})

export class IconComponent {
  @Input() name: string;
  iconDir: string;

  constructor() {
    this.iconDir = this.getIcon(this.name);
  }

  private getIcon(icon) {
    switch (icon) {
      case 'checkmark':
        return '/assets/checkmark.svg';
    }
  }
}
