import { Component, OnDestroy, OnInit } from '@angular/core';
import { PreferenceService } from '@services/preference.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.scss']
})
export class PreferenceComponent implements OnDestroy, OnInit {
  // preferences$ = this.preferenceService.preference$;
  preferences$ = {
    categories: [
      {
        name: 'Chat Notifications',
        order: 1,
        preferences: [
          {
            key: 'best key',
            name: 'Chat messages',
            description: 'When I receive chat messages',
            remarks: 'Chat messages can be muted from within individual chat channels',
            options: [
              {
                name: 'Email',
                medium: 'email',
                value: true,
                locked: false,
                locked_name: '',
              },
              {
                name: 'SMS',
                medium: 'sms',
                value: false,
                locked: false,
                locked_name: '',
              },
            ],
          },
        ],
      },
      {
        name: 'Team Changes Notifications',
        order: 1,
        preferences: [
          {
            key: 'new_member_added',
            name: 'When a member has been added to the team',
            description: 'How do you want to be told when a member was added to the team',
            remarks: '',
            options: [
              {
                name: 'Email',
                medium: 'email',
                value: true,
                locked: false,
                locked_name: '',
              },
              {
                name: 'SMS',
                medium: 'sms',
                value: false,
                locked: false,
                locked_name: '',
              },
            ],
          },
          {
            key: 'member_removed',
            name: 'When a member has been removed',
            description: 'How do you want to be told when a member was removed from the team',
            remarks: '',
            options: [
              {
                name: 'Email',
                medium: 'email',
                value: true,
                locked: false,
                locked_name: '',
              },
              {
                name: 'SMS',
                medium: 'sms',
                value: false,
                locked: false,
                locked_name: '',
              },
            ],
          },
        ],
      },   ],
  };
  preferenceSubject$: Subscription;

  constructor(
    private preferenceService: PreferenceService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // this.preferenceSubject$ = this.activatedRoute.data.subscribe(() => {
    //   this.preferenceService.getPreference();
      console.log('preferences', this.preferences$);
    // });
  }

  ngOnDestroy() {
    if (this.preferenceSubject$ instanceof Subscription) {
      this.preferenceSubject$.unsubscribe();
    }
  }

  goTo(direction) {
    console.log(direction);
    return this.router.navigate(direction);
  }
}
