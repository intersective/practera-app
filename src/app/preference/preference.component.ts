import { Component } from '@angular/core';
import { PreferenceService } from '@services/preference.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

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

  constructor(
    private preferenceService: PreferenceService,
    private activatedRoute: ActivatedRoute
  ) {
    activatedRoute.data.subscribe(() => {
      if (this.preferenceSubject$ instanceof Subscription) {
        this.preferenceSubject$.unsubscribe();
      }

      this.preferenceSubject$ = this.preferenceService.getPreference().subscribe(res => {
        console.log(res);
        this.preferences = res;
      });
    });
  }
}
