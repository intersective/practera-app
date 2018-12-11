import { Component, OnInit } from '@angular/core';
import { ReviewsService, Review } from './reviews.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  public reviews:Array <Review>;
  public showDo: boolean = false;
  public showDone: boolean = true;
  
  
  constructor( 
    public reviewsService: ReviewsService,
    public router: Router 
  ) { }

  ngOnInit() {
    this.reviewsService.getReviews()
      .subscribe(reviews => this.reviews = reviews);

  }
  activeDo (){
    this.showDo = true;
    this.showDone = false;
    
  };

  activeDone (){
    this.showDone = true;
    this.showDo = false;
    
  };
  gotoReview(id) {
    this.router.navigateByUrl('app/(project:activity/' + id +')');
  }
  
}
