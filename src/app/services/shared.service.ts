import { Injectable } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { PusherService } from '@shared/pusher/pusher.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private utils: UtilsService,
    private storage: BrowserStorageService,
    public pusherService: PusherService
  ) {}

  // call this function on every page refresh
  onPageLoad() {
    // only do these if a timeline is choosen
    if (!this.storage.getUser().timelineId) {
      return;
    }
    // check and change theme color on every page refresh
    let color = this.storage.getUser().themeColor;
    if (color) {
      this.utils.changeThemeColor(color);
    }
    let image = this.storage.getUser().activityCardImage;
    if (image) {
      this.utils.changeCardBackgroundImage(image);
    }
    // initialise Pusher
    this.pusherService.initialisePusher();
    // subscribe to Pusher channels
    this.pusherService.getChannels().subscribe();
  }
}
