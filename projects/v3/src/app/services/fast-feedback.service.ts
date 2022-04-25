import { Injectable } from '@angular/core';
import { RequestService } from '@v3/shared/request/request.service';
import { NotificationsService } from './notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { of, from, Observable } from 'rxjs';
import { switchMap, delay, take, retryWhen } from 'rxjs/operators';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';

const api = {
  fastFeedback: 'api/v2/observation/slider/list.json',
  submit: 'api/v2/observation/slider/create.json',
};

@Injectable({
  providedIn: 'root'
})
export class FastFeedbackService {
  constructor(
    private request: RequestService,
    private notificationsService: NotificationsService,
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private demo: DemoService
  ) {}

  getFastFeedback() {
    if (environment.demo) {
      return this.demo.fastFeedback();
    }
    return this.request.get(api.fastFeedback);
  }

  pullFastFeedback(options= {
    modalOnly: false
  }): Observable<any> {
    return this.getFastFeedback().pipe(
      switchMap(res => {
        // don't open it again if there's one opening
        const fastFeedbackIsOpened = this.storage.get('fastFeedbackOpening');

        // if any of either slider or meta is empty or not available,
        // should just skip the modal popup
        const { slider, meta } = res.data;
        if (this.utils.isEmpty(slider) || this.utils.isEmpty(meta)) {
          return of(res);
        }

        // popup instant feedback view if question quantity found > 0
        if (!this.utils.isEmpty(res.data) && res.data.slider.length > 0 && !fastFeedbackIsOpened) {
          // add a flag to indicate that a fast feedback pop up is opening
          this.storage.set('fastFeedbackOpening', true);

          return from(this.notificationsService.fastFeedbackModal(
            {
              questions: res.data.slider,
              meta: res.data.meta
            },
            options.modalOnly,
          ));
        }
        return of(res);
      }),
      retryWhen(errors => {
        // retry for 3 times if API go wrong
        return errors.pipe(delay(1000), take(3));
      })
    );
  }

  submit(data, params) {
    return this.request.post(
      {
        endPoint: api.submit,
        data,
        httpOptions: { params }
      });
  }
}
