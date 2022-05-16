import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  reviews: Review[];
  subscriptions: Subscription[];
  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private reviewService: ReviewService
  ) { }

  ngOnInit() {
    this.subscriptions = [];
    this.subscriptions.push(this.reviewService.reviews$.subscribe(res => this.reviews = res));

  }

  get isMobile() {
    return this.platform.is('mobile');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }
}
