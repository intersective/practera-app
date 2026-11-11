import { Component, OnInit } from '@angular/core';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  standalone: false,
  template: '<ion-router-outlet></ion-router-outlet>',
})
export class ChatPage implements OnInit {
  constructor(private utils: UtilsService) {}

  ngOnInit() {
    this.setMessagesTitle();
  }

  ionViewDidEnter() {
    this.setMessagesTitle();
  }

  private setMessagesTitle() {
    this.utils.setPageTitle('Messages - Practera');
  }
}
