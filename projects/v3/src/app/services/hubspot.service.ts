import { Injectable } from '@angular/core';
import { RequestService } from 'request';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { Experience } from './experience.service';
/*
* @name api
* @description list of api endpoint involved in this service
* @type {Object}
*/
const API = {
  hubspotSubmit: 'https://api.hsforms.com/submissions/v3/integration/submit/',
};

export interface HubspotFormParams {
  subject: string;
  content: string;
  file: any;
  consentToProcess: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HubspotService {

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private demo: DemoService,
    private storage: BrowserStorageService,
  ) { }

  submitDataToHubspot(params: HubspotFormParams): Observable<any> {
    if (environment.demo) {
      return this.demo.normalResponse('observable') as Observable<any>;
    }
    const body = this.generateParams(params);
    if (!body) {
      return;
    }
    return this.request.post({
      endPoint: `${API.hubspotSubmit}${environment.hubspot.supportFormPortalId}/${environment.hubspot.supportFormId}`,
      data: body,
    }).pipe(
      // eslint-disable-next-line no-console
      map(res => console.log(res)),
    );
  }

  generateParams(params: HubspotFormParams) {
    if (!this.utils.isEmpty(this.storage.getUser())) {
      // legalConsentOptions is a required param for the hubspot API
      const submitParam = {
        fields: [],
        legalConsentOptions: {
          consent: {
            consentToProcess: params.consentToProcess,
            text: "I agree to the collection and storage of my data from this form. I understand that this information will be used to process my request and I agree to be contacted for this purpose.",
            communications: [
              {
                value: true,
                subscriptionTypeId: 999,
                text: "I agree to receive marketing communications from Practera."
              }
            ]
          }
        }
      };
      submitParam.fields.push(
        {
          name: "email",
          value: this.storage.getUser().email
        }
      );
      submitParam.fields.push(
        {
          name: "firstname",
          value: this.storage.getUser().firstName ? this.storage.getUser().firstName : ''
        }
      );
      submitParam.fields.push(
        {
          name: "lastname",
          value: this.storage.getUser().lastName ? this.storage.getUser().lastName : ''
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.subject",
          value: params.subject
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.content",
          value: params.content
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.institution_name",
          value: this.storage.getUser().institutionName
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.server_location",
          value: environment.hubspot.liveServerRegion
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.phone_number",
          value: this.storage.getUser().contactNumber ? this.storage.getUser().contactNumber : ""
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.source_type",
          value: 'FORM'
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.user_role",
          value: this.getCorrectUserRole(this.storage.getUser().role)
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.team",
          value: this.storage.getUser().teamName ? this.storage.getUser().teamName : ''
        }
      );
      submitParam.fields.push(
        {
          name: "TICKET.hs_file_upload",
          value: params.file ? JSON.stringify(params.file) : ""
        }
      );

      const currentExperience: Experience = this.storage.get('experience');
      if (!currentExperience) {
        return;
      }

      const expName = currentExperience.name;
      if (expName) {
        submitParam.fields.push(
          {
            name: "TICKET.experience_or_program",
            value: expName
          }
        );
      }

      return submitParam;

    }
    return null;
  }

  private getCorrectUserRole(role) {
    switch (role) {
      case "participant":
        return 'Learner';
      case "mentor":
        return 'Expert';
      default:
        return role;
    }
  }

}
