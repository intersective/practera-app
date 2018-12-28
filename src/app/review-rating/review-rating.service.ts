import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';

const api = {
  post: {
    reviewRating: 'api/v2/observations/review_rating/create.json',  
  }
};

export interface RatingData {
  reviewId : number;
	comment : string;
	tags : Array<string>
}

@Injectable({
  providedIn: 'root'
})
export class ReviewRatingService {

  constructor(
  	private request : RequestService,
  ) { }


  submitRating(data : RatingData) {
  	let postData;
  	postData = {
  		review_id: data.reviewId,
      comment: data.comment,
      tags: data.tags
  	};
  
  	return this.request.post(api.post.reviewRating, postData);
  }

}
