import { Injectable } from '@angular/core';
import { RequestService } from 'request';
import { NotificationsService } from './notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { of, from, Observable } from 'rxjs';
import { switchMap, delay, take, retryWhen, map } from 'rxjs/operators';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';

const api = {
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
    private demo: DemoService,
    private apolloService: ApolloService,
  ) {}

  private _getFastFeedback(skipChecking = false): Observable<any> {
    if (environment.demo) {
      return this.demo.fastFeedback();
    }
    return this.apolloService.graphQLFetch(
      `query pulseCheck($skipChecking: Boolean) {
        pulseCheck(skipChecking: $skipChecking) {
          questions {
            id
            name
            description
            choices {
              id
              name
            }
          }
          meta {
            teamId
            teamName
            targetUserId
            contextId
            assessmentName
          }
        }
      }`,
      {
        variables: {
          skipChecking,
        },
      }
    );
  }

  pullFastFeedback(options: {
    modalOnly?: boolean;
    skipChecking?: boolean;
  } = {
    modalOnly: false,
    skipChecking: false,
  }): Observable<any> {
    return this._getFastFeedback(options.skipChecking).pipe(
      switchMap((res) => {
        try {
          // don't open it again if there's one opening
          const fastFeedbackIsOpened = this.storage.get("fastFeedbackOpening");

          // if any of either slider or meta is empty or not available,
          // should just skip the modal popup
          const { questions, meta } = res.data.pulseCheck;
          if (
            (this.utils.isEmpty(questions) || this.utils.isEmpty(meta)) &&
            options.skipChecking === false // if skipChecking is true, force open the modal
          ) {
            return of(res);
          }

          // popup instant feedback view if question quantity found > 0
          if (
            !this.utils.isEmpty(res.data) &&
            questions?.length > 0 &&
            !fastFeedbackIsOpened
          ) {
            // add a flag to indicate that a fast feedback pop up is opening
            this.storage.set("fastFeedbackOpening", true);

            return from(
              this.notificationsService.fastFeedbackModal(
                {
                  questions,
                  meta,
                },
                options.modalOnly
              )
            );
          }
          return of(res);
        } catch (error) {
          console.error("Error in switchMap:", error);
          throw error;
        }
      }),
      retryWhen((errors) => {
        // retry for 3 times if API go wrong
        return errors.pipe(delay(1000), take(3));
      })
    );
  }

  submit(answers, params): Observable<any> {
    if (environment.demo) {
      /* eslint-disable no-console */
      console.log('data', answers, 'params', params);
      return this.demo.normalResponse() as Observable<any>;
    }
    return this.apolloService.graphQLMutate(
      `mutation submitPulseCheck($teamId: Int, $targetUserId: Int, $contextId: Int, $answers: [PulseCheckAnswerInput]) {
        submitPulseCheck(teamId: $teamId, targetUserId: $targetUserId, contextId: $contextId, answers: $answers)
      }`,
      {
        variables: {
          ...params,
          answers,
        },
      }
    );
  }
}
