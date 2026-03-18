import { Injectable, Injector } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { BrowserStorageService } from '@v3/services/storage.service';
import { of, Observable } from 'rxjs';
import { switchMap, retry, tap } from 'rxjs/operators';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';
import isEmpty from 'lodash-es/isEmpty';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class FastFeedbackService {
  private readonly SUBMISSION_COOLDOWN = 10 * 1000; // 10 seconds cooldown

  private currentPulseCheckId: string = null; // temporary store active pulse check ID

  // lazy-loaded to avoid circular dependency
  private _notificationsService: any = null;

  constructor(
    private injector: Injector,
    private storage: BrowserStorageService,
    private demo: DemoService,
    private apolloService: ApolloService,
    private alertController: AlertController,
  ) {}

  // lazy getter for NotificationsService to break circular dependency
  private get notificationsService() {
    if (!this._notificationsService) {
      // dynamically import to avoid circular dependency at module load time
      const { NotificationsService } = require('./notifications.service');
      this._notificationsService = this.injector.get(NotificationsService);
    }
    return this._notificationsService;
  }

  private _getFastFeedback(skipChecking = false, type?: string): Observable<ApiResponse<{
    pulseCheck: {
      questions: Array<{
        id: number;
        name: string;
        description?: string;
        choices: Array<{
          id: number;
          name: string;
          description?: string;
        }>;
      }>;
      meta: {
        teamId: number;
        teamName: string;
        targetUserId?: number;
        contextId?: number;
        assessmentName?: string;
      };
    }
  }>> {
    if (environment.demo) {
      return this.demo.fastFeedback() as Observable<any>;
    }

    return this.apolloService.graphQLFetch(
      `query pulseCheck($skipChecking: Boolean, $type: PulseCheckType) {
        pulseCheck(skipChecking: $skipChecking, type: $type) {
          questions {
            id
            name
            description
            choices {
              id
              name
              description
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
          type,
        },
      }
    );
  }

  /**
   * Pulls fast feedback data and displays it in a modal.
   * @param options Configuration options for the modal.
   * @returns observable of the fast feedback data.
   */
  pullFastFeedback(options: {
    modalOnly?: boolean;
    skipChecking?: boolean;
    closable?: boolean; // allow skipping modal popup (with a close button)
    type?: string; // some pulsecheck require type: 'skills'
  } = {
    modalOnly: false,
    skipChecking: false,
    closable: false,
  }): Observable<any> {
    return this._getFastFeedback(options.skipChecking, options.type).pipe(
      retry({
        count: 3,
        delay: 1000
      }),
      switchMap((res) => {
        try {
          // don't open it again if there's one opening
          const fastFeedbackIsOpened = this.storage.get("fastFeedbackOpening");

          // no need to alert user, just display as error on console
          if (isEmpty(res.data?.pulseCheck)) {
            console.error('No pulse check data found');
            return of(res);
          }

          // if any of either slider or meta is empty or not available,
          // should just skip the modal popup
          const { questions, meta } = res.data.pulseCheck ?? {};
          if (
            (isEmpty(questions) || isEmpty(meta)) &&
            options.skipChecking === false // if skipChecking is true, force open the modal
          ) {
            return of(res);
          }

          // generate ID for this pulse check modal
          const pulseCheckId = this.generatePulseCheckId(questions, meta);

          // skip showing the modal if this pulse check was recently viewed + submitted
          if (this.isPulseCheckSubmitted(pulseCheckId) && !options.skipChecking) {
            return of(res);
          }

          // temporarily store the current pulse check ID after make sure it hasn't been submitted yet
          this.currentPulseCheckId = pulseCheckId;

          // popup instant feedback view if question quantity found > 0
          if (
            !isEmpty(res.data) &&
            questions?.length > 0 &&
            !fastFeedbackIsOpened
          ) {
            // set a flag to indicate a fast feedback modal is currently opening to prevent duplicates.
            // the lock stays true until FastFeedbackComponent.dismiss() releases it.
            this.storage.set("fastFeedbackOpening", true);

            // fire-and-forget: addModal() resolves immediately (before modal is dismissed),
            // so we must NOT use from(promise).pipe(finalize(...)) — that would release the
            // lock within 1 ms, defeating the duplicate-open guard.
            this.notificationsService.fastFeedbackModal(
              {
                questions,
                meta,
                pulseCheckId,
              },
              {
                closable: options.closable,
                modalOnly: options.modalOnly,
              }
            ).catch(() => {
              // release the lock only if the modal fails to open
              this.storage.set("fastFeedbackOpening", false);
            });
          }
          return of(res);
        } catch (error) {
          /* eslint-disable no-console */
          console.error("Error in switchMap:", error);
          // fail gracefully to avoid blocking user's flow
          return of({
            error: true,
            message: "An error occurred while processing fast feedback.",
            details: error.message
          });
        }
      }),
    );
  }

  submit(answers, params: {
    teamId?: number;
    targetUserId?: number;
    contextId?: number;
    },
    pulseCheckId?: string
  ): Observable<any> {
    if (environment.demo) {
      /* eslint-disable no-console */
      console.log('data', answers, 'params', params);
      return this.demo.normalResponse() as Observable<any>;
    }

    const submittedId = pulseCheckId || this.currentPulseCheckId; // fallback to temporary ID if not provided

    return this.apolloService.graphQLMutate(
      `mutation submitPulseCheck($teamId: Int, $targetUserId: Int, $contextId: Int, $answers: [PulseCheckAnswerInput]) {
        submitPulseCheck(teamId: $teamId, targetUserId: $targetUserId, contextId: $contextId, answers: $answers)
      }`,
      {
        ...params,
        answers,
      },
    ).pipe(
      tap(result => {
        if (result.data?.submitPulseCheck && submittedId) {
          this.recordPulseCheckSubmission(submittedId);
        }
      })
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

  /**
   * generates a unique id for a pulse check based on its content
   */
  private generatePulseCheckId(questions: any[], meta: any): string {
    if (!questions?.length || !meta) {
      return null;
    }

    const questionIds = questions.map(q => q.id).sort().join(',');
    return `${questionIds}_${meta.teamId}_${meta.contextId || 0}`; // eg. "1,2,3_45_0"
  }

  /**
   * checks if this specific pulse check was recently submitted
   */
  private isPulseCheckSubmitted(pulseCheckId: string): boolean {
    if (!pulseCheckId) {
      return false;
    }

    const submittedChecks = this.storage.get('submittedPulseChecks') || {};
    const submission = submittedChecks[pulseCheckId];

    if (!submission) {
      return false;
    }

    const now = Date.now();
    return (now - submission) < this.SUBMISSION_COOLDOWN;
  }

  /**
   * records a specific pulse check as submitted
   */
  private recordPulseCheckSubmission(pulseCheckId: string): void {
    if (!pulseCheckId) {
      return;
    }

    // Record specific pulse check submission
    const submittedChecks = this.storage.get('submittedPulseChecks') || {};
    submittedChecks[pulseCheckId] = Date.now();

    // Clean up old submissions (older than cooldown period)
    const now = Date.now();
    Object.keys(submittedChecks).forEach(id => {
      if (now - submittedChecks[id] > this.SUBMISSION_COOLDOWN) {
        delete submittedChecks[id];
      }
    });

    this.storage.set('submittedPulseChecks', submittedChecks);
  }
}

