import { Component } from '@angular/core';
import { BrowserStorageService } from '../../services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.page.html',
  styleUrls: ['./page-not-found.page.scss']
})
export class PageNotFoundPage {
  constructor(
    private storageService: BrowserStorageService,
    private route: Router,
    private utils: UtilsService
  ) {}

  ionViewDidEnter() {
    this.utils.setPageTitle('Page Not Found - Practera');
    this.storageService.lastVisited('url', null);
  }

  goHome() {
    this.route.navigate(['/v3/home'], {
      replaceUrl: true
    });
  }
}
