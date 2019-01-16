import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-description',
  templateUrl: 'description.component.html',
  styles: ['']
})
export class DescriptionComponent {
  limit: number = 300;
  isTruncating = true;
  @Input() content: string = '';

  truncated(): string {
    return this.content.length > this.limit ? this.content.substring(0, this.limit) + '...' : this.content;
  }
}


