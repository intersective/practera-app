import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(private platform: Platform) { }

  ngOnInit() {
  }

  get isMobile() {
    return this.platform.is('mobile');
  }
}
