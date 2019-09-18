import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
const api = {
  submit: 'api/v2/observation/slider/create.json',
};

@Injectable({
  providedIn: 'root'
})
export class FastFeedbackSubmitterService {
  constructor(
    private request: RequestService
  ) {}

  submit(data, params) {
    return this.request.post(api.submit, data, {params: params});
  }

}
