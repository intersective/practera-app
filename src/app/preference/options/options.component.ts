import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-options',
  template: `<p class="gray-2">{{ result }}</p>`,
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  @Input() options: any[];
  result: string;

  constructor() { }

  ngOnInit() {
    this.result = this.extractName(this.options).join(', ');
  }

  extractName(options = []): string[] {
    return options.map(option => option.name);
  }
}
