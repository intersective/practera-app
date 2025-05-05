import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { of, from, Observable } from 'rxjs';
import { switchMap, delay, take, retryWhen } from 'rxjs/operators';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';

@Injectable({
  providedIn: 'root'
})
export class FastFeedbackService {
  constructor(
    private modalController: ModalController,
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private demo: DemoService,
    private apolloService: ApolloService,
    private alertController: AlertController,
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
    closable?: boolean; // allow skipping modal popup (with a close button)
  } = {
    modalOnly: false,
    skipChecking: false,
    closable: false,
  }): Observable<any> {
    return this._getFastFeedback(options.skipChecking).pipe(
      switchMap((res) => {
        try {
          // don't open it again if there's one opening
          const fastFeedbackIsOpened = this.storage.get("fastFeedbackOpening");

          // no need to alert user, just display as error on console
          if (this.utils.isEmpty(res.data?.pulseCheck)) {
            console.error('No pulse check data found');
            return of(res);
          }

          // if any of either slider or meta is empty or not available,
          // should just skip the modal popup
          const { questions, meta } = res.data.pulseCheck ?? {};
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

            // Import dynamically to avoid circular dependency
            return from(
              import('../components/fast-feedback/fast-feedback.component').then(async module => {
                const FastFeedbackComponent = module.FastFeedbackComponent;
                const modal = await this.modalController.create({
                  component: FastFeedbackComponent,
                  componentProps: {
                    questions,
                    meta,
                    closable: options.closable
                  },
                  backdropDismiss: options?.closable === true,
                  showBackdrop: false
                });
                await modal.present();
                return modal;
              })
            );
          }
          return of(res);
        } catch (error) {
          console.error("Error in switchMap:", error);
          // Return a fallback observable to allow the consumer to continue working
          return of({
            error: true,
            message: "An error occurred while processing fast feedback.",
            details: error.message
          });
        }
      }),
      retryWhen((errors) => {
        // retry for 3 times if API go wrong
        return errors.pipe(delay(1000), take(3));
      })
    );
  }

  submit(answers, params: {
    teamId?: number;
    targetUserId?: number;
    contextId?: number;
  }): Observable<any> {
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
        ...params,
        answers,
      },
    );
  }

  /**
   * Show team check-in alert when there's misalignment in team status
   */
  async showTeamCheckInAlert() {
    const alert = await this.alertController.create({
      header: 'Team Check-In Time! 👥',
      message: `Your status update shows some misalignment. Great opportunity to:\n\n` +
        `✓ Schedule a quick team huddle\n` +
        `✓ Review your Project plan and milestones together\n` +
        `✓ Redistribute tasks if needed\n` +
        `✓ Document 3 next steps forward\n\n` +
        `Need strategies? Visit Teamwork Toolkit →\n` +
        `We're here to help: programs@practera.com`,
      buttons: ['OK'],
      cssClass: 'team-check-in-alert'
    });

    await alert.present();
  }
}
