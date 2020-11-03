import { Component, OnInit } from '@angular/core';
import { PreferenceService, Category } from '@services/preference.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-preference-update',
  templateUrl: './preference-update.component.html',
  styleUrls: ['./preference-update.component.scss']
})
export class PreferenceUpdateComponent implements OnInit {
  noHistoryStack = true;
  preferences: {
    categories: any;
  };
  preferenceSubject$: Subscription;
  currentPreference: object;

  constructor(
    private preferenceService: PreferenceService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: { key: string }) => {
      const { key } = params;

      this.preferenceSubject$ = this.preferenceService.preference$.subscribe(res => {
        if (this.utilsService.isEmpty(res) && this.noHistoryStack === true) {
          this.noHistoryStack = false;
          this.preferenceService.getPreference();
        } else {
          this.preferences = res;
          this.currentPreference = this.filterPreferences(this.preferences, key);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.preferenceSubject$ && this.preferenceSubject$ instanceof Subscription) {
      this.preferenceSubject$.unsubscribe();
    }
  }

  /**
   * @name filterPreferences
   * @param {Category[] }} preferences   entire preferences object
   * @param {string}        key  url parameter
   */
  filterPreferences(preferences: { categories?: Category[] }, key: string) {
    let result;
    if (preferences && preferences.categories) {
      preferences.categories.find(cat => {
        result = cat.preferences.find(pref => {
          return pref.key === key;
        });
      });
    }

    return result;
  }
}
