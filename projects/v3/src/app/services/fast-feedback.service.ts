import { Injectable } from '@angular/core';
import { FastFeedbackComponent } from '../components/fast-feedback/fast-feedback.component';
import { RequestService } from 'request';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { of, from, Observable } from 'rxjs';
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
  fastFeedbackModal(
    props: {
      questions?: Array<Question>;
      meta?: Meta | Object;
    },
    modalOnly: boolean = false
  ): Promise<HTMLIonModalElement | void> {
    if (modalOnly) {
      return this.notificationService.modalOnly(FastFeedbackComponent, props, {
        backdropDismiss: false,
        showBackdrop: false,
      });
    }

    return this.notificationService.modal(FastFeedbackComponent, props, {
      backdropDismiss: false,
      showBackdrop: false,
    });
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

          return from(this.fastFeedbackModal(
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
}
