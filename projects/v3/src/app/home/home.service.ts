import { Injectable } from '@angular/core';
import { tap, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from '@environments/environment';
import { DemoService } from '../services/demo.service';

export interface Experience {
  image: string;
  name: string;
  description: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private _experience$ = new BehaviorSubject<Experience>(null);

  experience$ = this._experience$.asObservable();

  constructor(
    private demo: DemoService
  ) { }

  getExperience() {
    if (environment.demo) {
      this._experience$.next(this.demo.experience);
    }
  }
}
