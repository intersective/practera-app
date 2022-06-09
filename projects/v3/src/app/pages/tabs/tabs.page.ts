import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { ChatService } from '@v3/app/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  reviews: Review[];
  subscriptions: Subscription[];
  showMessages: boolean = false;
  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private storageService: BrowserStorageService,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.subscriptions = [];
    this.subscriptions.push(this.reviewService.reviews$.subscribe(res => this.reviews = res));
    if (!this.storageService.getUser().chatEnabled) { // keep configuration-based value
      this.showMessages = false;
    } else {
      // display chat tab if a user has chatroom available
      this.subscriptions.push(this.chatService.getChatList().subscribe(chats => {
        if (chats && chats.length > 0) {
          this.showMessages = true;
        } else {
          this.showMessages = false;
        }
      }));
    }
  }

  get isMobile() {
    return this.platform.is('mobile');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }
}
