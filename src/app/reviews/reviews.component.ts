import { Component, OnInit } from '@angular/core';
import { ReviewsService } from './reviews.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  public reviews = [];
  
  constructor( public reviewsService: ReviewsService) { }

  ngOnInit() {
    this.reviewsService.getReviews()
        .subscribe(reviews => this.reviews = reviews);

  }

}
