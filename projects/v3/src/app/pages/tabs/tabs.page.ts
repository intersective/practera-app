import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Review, ReviewService } from '@v3/app/services/review.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
  reviews: Review[];
  constructor(
    private platform: Platform,
    private reviewService: ReviewService
  ) { }

  ngOnInit() {
    this.reviewService.reviews$.subscribe(res => this.reviews = res);
    this.reviewService.getReviews();
  }

  get isMobile() {
    return this.platform.is('mobile');
  }
}
