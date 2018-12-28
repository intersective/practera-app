import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ReviewRatingService, RatingData } from './review-rating.service';

@Component({
  selector: 'app-review-rating',
  templateUrl: './review-rating.component.html',
  styleUrls: ['./review-rating.component.scss']
})
export class ReviewRatingComponent {
  
  @Input() reviewId;
  rating = "0.5";
  tags = {};
  comment = "";

  constructor(
  	private reviewRatingService: ReviewRatingService,
  	private modalController : ModalController,
  	private router : Router) 
  {}


  submitReviewRating() {
  	console.log(this.reviewId);
  	console.log('submit');
  }

  closeReviewRating() {
  	console.log('closed');
  }

  addOrRemoveQuickMessage(tags) {

  }

  

}
