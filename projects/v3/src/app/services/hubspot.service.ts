import { Injectable } from '@angular/core';
import { RequestService } from 'request';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { HttpClient } from '@angular/common/http';
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
    private http: HttpClient,
  ) { }

  submitDataToHubspot(params: HubspotFormParams): Observable<any> {
    if (environment.demo) {
      return this.demo.normalResponse();
    }
    const body = this.generateParams(params);
    return this.request.post({
      endPoint: `${API.hubspotSubmit}3404872/114bee73-67ac-4f23-8285-2b67e0e28df4`,
      data: body,
      httpOptions: {

      },
      customErrorHandler: (err: any) => {
        return of(err);
      }
    }).pipe(
      map(res => console.log(res)),
    );
  }

  generateParams(params: HubspotFormParams) {
    if (!this.utils.isEmpty(this.storage.getUser())) {
      let submitParam = {
        fields: [
          {
            name: "email",
            value: this.storage.getUser().email
          },
          {
            name: "firstname",
            value: this.storage.getUser().name
          },
          {
            name: "TICKET.subject",
            value: params.subject
          },
          {
            name: "TICKET.content",
            value: params.content
          },
          {
            name: "TICKET.institution_name",
            value: this.storage.getUser().institutionName
          },
          {
            name: "TICKET.server_location",
            value: environment.liveServerRegion
          },
          {
            name: "TICKET.phone_number",
            value: this.storage.getUser().contactNumber
          },
          {
            name: "TICKET.source_type",
            value: 'FORM'
          },
          {
            name: "TICKET.user_role",
            value: this.storage.getUser().role
          },
          {
            name: "TICKET.team",
            value: this.storage.getUser().teamName
          },
          {
            name: "TICKET.hs_file_upload",
            value: params.file ? params.file : {}
          }
        ]
      };
      let expName = '';
      // submitParam.fields.push();
      // submitParam.fields.push();
      // submitParam.fields.push();
      // submitParam.fields.push();

      const experienceId = this.storage.getUser().experienceId;
      const programList = this.storage.get('programs');
      if (!experienceId || !programList || programList.length < 1) {
        return;
      }
      const currentExperience = programList.find((program) => {
        return program.experience.id === experienceId;
      });
      if (currentExperience) {
        expName = currentExperience.experience.name;
        // if (expName) {
        //   submitParam.fields.push({
        //     name: "TICKET.experience_or_program",
        //     value: expName
        //   });
        // }
      }

      // submitParam.fields.push();
      // submitParam.fields.push();
      // submitParam.fields.push();
      // submitParam.fields.push();
      // submitParam.fields.push();
      // submitParam.fields.push();
      // submitParam.fields.push();

      return {
        fields: [
          {
            name: "email",
            value: this.storage.getUser().email
          },
          {
            name: "firstname",
            value: this.storage.getUser().name
          },
          {
            name: "lastname",
            value: ""
          },
          {
            name: "TICKET.subject",
            value: params.subject
          },
          {
            name: "TICKET.content",
            value: params.content
          },
          {
            name: "TICKET.experience_or_program",
            value: expName
          },
          {
            name: "TICKET.institution_name",
            value: this.storage.getUser().institutionName
          },
          {
            name: "TICKET.server_location",
            value: environment.liveServerRegion
          },
          {
            name: "TICKET.phone_number",
            value: this.storage.getUser().contactNumber
          },
          {
            name: "TICKET.source_type",
            value: 'FORM'
          },
          {
            name: "TICKET.user_role",
            value: this.storage.getUser().role
          },
          {
            name: "TICKET.team",
            value: this.storage.getUser().teamName
          },
          {
            name: 'TICKET.hs_file_upload',
            value: params.file ? params.file : {}
          }
        ]
      };

    }
    return null;
  }

}
