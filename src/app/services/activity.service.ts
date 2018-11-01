import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  public activity = {
    name :'Activity Name 1'
  }
  constructor() {};
}
