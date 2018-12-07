import { Component, OnInit } from '@angular/core';
import { ReviewsService, Review } from './reviews.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  public reviews:Array <Review>;
  public activeToggle: boolean = true;
  public activeToggleDo: boolean = true;
  
  
  constructor( public reviewsService: ReviewsService) { }

  ngOnInit() {
    this.reviewsService.getReviews()
      .subscribe(reviews => this.reviews = reviews);

  }
  toggleActiveDo (){
    this.activeToggle = !this.activeToggle;
    this.activeToggleDo = false;
   
  };

  toggleActiveDone (){
    this.activeToggle = !this.activeToggle;
    this.activeToggleDo = true;
   
  };

  
}
