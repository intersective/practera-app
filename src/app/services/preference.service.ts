import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';

const APIs = {
  preference: 'https://4d052q3ph6.execute-api.ap-southeast-2.amazonaws.com/notify',
};

const DUMMY_DATA = {
  "categories": [
    {
      "name": "Chat Notifications",
      "order": 1,
      "preferences": [
        {
          "key": "best key",
          "name": "Chat messages",
          "description": "When I receive chat messages",
          "remarks": "Chat messages can be muted from within individual chat channels",
          "options": [
            {
              "name": "Email",
              "medium": "email",
              "value": true,
              "locked": false,
              "locked_name": ""
            },
            {
              "name": "SMS",
              "medium": "sms",
              "value": false,
              "locked": false,
              "locked_name": ""
            }
          ]
        }
      ]
    },
    {
      "name": "Team Changes Notifications",
      "order": 1,
      "preferences": [
        {
          "key": "new_member_added",
          "name": "When a member has been added to the team",
          "description": "How do you want to be told when a member was added to the team",
          "remarks": "",
          "options": [
            {
              "name": "Email",
              "medium": "email",
              "value": true,
              "locked": false,
              "locked_name": ""
            },
            {
              "name": "SMS",
              "medium": "sms",
              "value": false,
              "locked": false,
              "locked_name": ""
            }
          ]
        },
        {
          "key": "member_removed",
          "name": "When a member has been removed",
          "description": "How do you want to be told when a member was removed from the team",
          "remarks": "",
          "options": [
            {
              "name": "Email",
              "medium": "email",
              "value": true,
              "locked": false,
              "locked_name": ""
            },
            {
              "name": "SMS",
              "medium": "sms",
              "value": false,
              "locked": false,
              "locked_name": ""
            }
          ]
        }
      ]
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor(private request: RequestService) { }

  getPreference(): Observable<any> {
    // return of(DUMMY_DATA);
    return this.request.post(APIs.preference, {});
  }
}
