import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  get: {
  },
  post: {
  }
};

export interface Achievement {
  id: number;
  name: string;
  description: string;
  points?: number;
  image?: string;
  isEarned: boolean;
  earnedDate?: string;
}

@Injectable({
  providedIn: 'root'
})

export class AchievementsService {

  constructor(
  ) {}

}


