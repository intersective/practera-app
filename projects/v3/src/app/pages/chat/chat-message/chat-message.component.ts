import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-message',
  template: `<div class="message-bubble" [innerHTML]="formattedMessage"></div>`,
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  @Input() message: string;
  formattedMessage: any;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.formattedMessage = this.formatMessage(this.message);
  }

  formatMessage(msg: string) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const safeHtml = msg.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(safeHtml);
  }
}
