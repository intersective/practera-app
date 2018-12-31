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
  
  // Default redirect i.e home page.
  redirect = ['/'];

  ratingData: RatingData = {
  	assessment_review_id: null,
  	rating : 0.5,
  	comment: '',
  	tags: []
  };
  // variable to control the button text to indicate rating 
  submitting = false;

  constructor(
  	private reviewRatingService: ReviewRatingService,
  	private modalController : ModalController,
  	private router : Router) 
  {}

  // Review ID is required if this component is to be used.upon detecting incoming/changes of value, set passed reviewId into local var
  @Input()
  set reviewId(reviewId: number) {
  	this.ratingData.assessment_review_id = reviewId;    
  }

  submitReviewRating() {  	
    this.submitting = true;
  	// round to 2 decimal place
  	this.ratingData.rating = +(this.ratingData.rating.toFixed(2));
  	
  	this.reviewRatingService.submitRating(this.ratingData).subscribe(result => {
      this.submitting = false;
  		this.closeReviewRating();
  	});
  }

  closeReviewRating() {
  	this.modalController.dismiss();
    // if this.redirect == false, don't redirect to another page
    if (this.redirect) {
      this.router.navigate(this.redirect);
    }
  }

  addOrRemoveTags(tag) {
  	// if there are no tags yet
  	if (!this.ratingData.tags || this.ratingData.tags.length <= 0) {
  		this.ratingData.tags.push(tag);

  	} else if (this.ratingData.tags.includes(tag)) { // if tag already exist, then tag is being removed
  		var index = this.ratingData.tags.indexOf(tag);
  		if (index > -1) {
		  this.ratingData.tags.splice(index, 1);
		}
  	} else {
  		// otherwise, there are existing tags and new tag being push dosen't exist yet.
  		this.ratingData.tags.push(tag);
  	}
  }



}
