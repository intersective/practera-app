import { Injectable } from '@angular/core';
import { FastFeedbackComponent } from './fast-feedback.component';
import { RequestService } from '@shared/request/request.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { pipe, of, from, Observable } from 'rxjs';
import { switchMap, delay, take, retryWhen } from 'rxjs/operators';

export interface Choice {
  id: number;
  title: string;
}
export interface Question {
  id: number;
  title: string;
  description: string;
  choices: Array<Choice>;
}
export interface Meta {
  context_id: number;
  team_id: number;
  target_user_id: number;
  team_name: string;
  assessment_name: string;
}

const api = {
  fastFeedback: 'api/v2/observation/slider/list.json',
};

@Injectable({
  providedIn: 'root'
})
export class FastFeedbackService {
  constructor(
    private request: RequestService,
    private notificationService: NotificationService,
    private storage: BrowserStorageService,
    private utils: UtilsService,
  ) {}

  getFastFeedback() {
    return this.request.get(api.fastFeedback);
  }

  /**
   * Pop up the fast feedback modal window
   */
  async popUpFastFeedback(props: { questions?: Array<Question>, meta?: Meta } = {}) {
    const modal = await this.notificationService.modal(FastFeedbackComponent, props, {
      backdropDismiss: false,
      showBackdrop: false,
    });
    return modal;
  }

  pullFastFeedback(): Observable<any> {
    return this.getFastFeedback().pipe(
      switchMap(res => {
        // don't open it again if there's one opening
        const fastFeedbackIsOpened = this.storage.get('fastFeedbackOpening');

        // popup instant feedback view if question quantity found > 0
        if (!this.utils.isEmpty(res.data) && res.data.slider.length > 0 && !fastFeedbackIsOpened) {
          // add a flag to indicate that a fast feedback pop up is opening
          this.storage.set('fastFeedbackOpening', true);
          return from(this.popUpFastFeedback({
            questions: res.data.slider,
            meta: res.data.meta
          }));
        }
        return of(res);
      }),
      retryWhen(errors => {
        // retry for 3 times if API go wrong
        return errors.pipe(delay(1000), take(3));
      })
    );
  }
}
