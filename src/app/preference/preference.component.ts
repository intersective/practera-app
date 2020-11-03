import { Component } from '@angular/core';
import { PreferenceService } from '@services/preference.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.scss']
})
export class PreferenceComponent {
  preferences: {
    categories: any;
  };
  preferenceSubject$: Subscription;
  query$: BehaviorSubject<any>;

  constructor(
    private preferenceService: PreferenceService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.preferences = {
      categories: []
    };

    activatedRoute.data.subscribe(() => {
      if (this.preferenceSubject$ instanceof Subscription) {
        this.preferenceSubject$.unsubscribe();
      }

      this.preferenceSubject$ = this.preferenceService.getPreference().subscribe(res => {
        this.preferences = res;
      });
    });
  }

  goTo(direction) {
    return this.router.navigate(direction);
  }
}
