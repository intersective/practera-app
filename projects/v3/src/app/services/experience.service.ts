import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { map, mergeMap, shareReplay } from 'rxjs/operators';
import { UtilsService } from '@v3/services/utils.service';
import { ApolloService } from '@v3/services/apollo.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { EventService } from '@v3/services/event.service';
import { ReviewService } from '@v3/services/review.service';
import { RequestService } from 'request';
import { HomeService } from './home.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
 const api = {
  get: {
    jwt: 'api/v2/users/jwt/refresh.json'
  }
};

export interface ProgramObj {
  program: Program;
  project: Project;
  timeline: Timeline;
  enrolment: Enrolment;
  experience: Experience;
  institution: {
    name: string;
    logo_url: string;
    config: {
      appv3?: boolean; // appv3 activation
      banner_url?: string;
      billing_plan?: string;
      card_url?: string;
      email_template?: string;
      icon_url?: string; // square logo string institution logo
      lead_url?: string;
      primary_color?: string;
      secondary_color?: string;
      support_name?: string;
      application_language?: string;
    };
    uuid: string;
  };
  progress?: number;
  todoItems?: number;
}

export interface Program {
  id: number;
  name: string;
  experience_id: number;
  config: ProgramConfig;
}

export interface ProgramConfig {
  theme_color: string;
  card_style?: string;
  review_rating?: boolean;
  truncate_description?: boolean;
}

export interface Project {
  id: number;
  lead_image?: string;
}

export interface Timeline {
  id: number;
}

export interface Experience {
  id: number;
  name: string;
  lead_image: string;
  config: any;
}

export interface Enrolment {
  contact_number: string;
}

export interface ProjectProgress {
  id: number;
  progress: number;
  todoItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  review$ = this.reviewService.reviews$;

  private _programs$ = new BehaviorSubject<ProgramObj[]>(null);
  programs$ = this._programs$.asObservable();

  private _allProjectsNotifications$ = new BehaviorSubject<any>(null);
  allProjectsNotifications$ = this._allProjectsNotifications$.asObservable();

  programsWithProgress$ = this._programs$.asObservable().pipe(
    mergeMap(
      async programs => {
        const projectIds = programs.map(program => program.project.id);
        this.getProgresses(projectIds).subscribe(
          res => {
            res.forEach(progress => {
              const i = programs.findIndex(program => program.project.id === progress.id);
              programs[i].progress = Math.round(progress.progress * 100);
              programs[i].todoItems = progress.todoItems;
            });
          }
        );
        this.getProjectsMsgCount(projectIds).subscribe(res => {
          console.log('getProjectsMsgCount::', res);
        });
        return programs;
      }
    ),
    shareReplay(1)
  );

  constructor(
    private demo: DemoService,
    private utils: UtilsService,
    private apolloService: ApolloService,
    private sharedService: SharedService,
    private storage: BrowserStorageService,
    private requestService: RequestService,
    private eventService: EventService,
    private reviewService: ReviewService,
    private homeService: HomeService,
  ) { }

  async getPrograms() {
    let programs = null;
    const cdn = 'https://cdn.filestackcontent.com/resize=fit:crop,width:';
    let imagewidth = 600;
    if (environment.demo) {
      programs = this.demo.programs;
    } else {
      programs = this.storage.get('programs');
    }
    if (programs.length > 0) {
      programs.forEach(program => {
        if (program.project.lead_image) {
          const imageId = program.project.lead_image.split('/').pop();
          if (!this.utils.isMobile()) {
            imagewidth = 1024;
          }
          program.project.lead_image = `${cdn}${imagewidth}/${imageId}`;
        }
        program.progress = 0;
      });
    }
    this._programs$.next(programs);
  }

  /**
   * Get the progress and number of notifications for each project
   * @param projectIds Project ids
   */
  getProgresses(projectIds: number[]) {
    if (environment.demo) {
      return of(this.demo.projectsProgress);
    }
    return this.apolloService.graphQLFetch(
      `query getProjectList($ids: [Int]!) {
        projects(ids: $ids) {
          id
          progress
          todoItems{
            isDone
          }
        }
      }`,
      {
        ids: projectIds
      },
    )
    .pipe(map(res => {
      return res.data.projects.map(v => {
        return {
          id: +v.id,
          progress: v.progress,
          todoItems: v.todoItems.filter(ti => !ti.isDone).length
        };
      });
    }));
  }

  extractColors(programObj: ProgramObj) {
    const experienceConfig = (programObj.experience || {}).config;
    const programConfig = (programObj.program || {}).config;

    const primary = (experienceConfig || {}).primary_color;
    const secondary = (experienceConfig || {}).secondary_color;
    const themeColor = (programConfig || {}).theme_color;

    return {
      primary,
      secondary,
      themeColor,
    };
  }

  async switchProgram(programObj: ProgramObj): Promise<Observable<any>> {
    const colors = this.extractColors(programObj);

    let cardBackgroundImage = '';
    if (this.utils.has(programObj, 'program.config.card_style')) {
      cardBackgroundImage = '/assets/' + programObj.program.config.card_style;
    }

    const institution = programObj?.institution;
    const program = programObj.program;
    this.storage.setUser({
      colors: {
        theme: colors.themeColor,
        primary: colors.primary,
        secondary: colors.secondary,
      },

      programId: program.id,
      programName: program.name,
      programImage: programObj.project.lead_image,
      hasReviewRating: program.config?.review_rating || false,
      truncateDescription: program.config?.truncate_description || true,
      experienceId: program.experience_id,
      institutionLogo: institution?.logo_url || null,
      squareLogo: institution.config?.icon_url || null,
      app_locale: institution?.config?.application_language,
      institutionName: institution?.name || null,
      projectId: programObj.project.id,
      timelineId: programObj.timeline.id,
      contactNumber: programObj.enrolment.contact_number,
      activityCardImage: cardBackgroundImage,
      enrolment: programObj.enrolment,
      activityCompleteMessage: programObj?.experience?.config?.activity_complete_message || null,
      chatEnabled: programObj?.experience?.config?.chat_enable || true,
      teamId: null,
      hasEvents: false,
      hasReviews: false,
    });

    this.sharedService.onPageLoad();
    this.homeService.clearExperience();

    // initialise Pusher
    this.sharedService.initWebServices();
    try {
      const jwt = await this.getNewJwt().toPromise();
      const teamInfo = await this.sharedService.getTeamInfo().toPromise();
      const me = await this.getMyInfo().toPromise();

      return of([jwt, teamInfo, me]);
    } catch (err) {
      throw Error(err);
    }
  }

  extractProjects() {
    let result = {};
    const programs = this.storage.get('programs');
    if (programs.length > 0) {
      programs.forEach(program => {
        result[programs.project.id] = program.project;
      });
    }
    return result;
  }

  // chat notification count for each project
  getProjectsMsgCount(projectIds: number[]): Observable<any> {
    if (environment.demo) {
      return of(this.demo.projectsMsgCount);
    }

    return this.apolloService.graphQLFetch(`
      query getProjectsMsgCount($ids: [Int]!) {
        projects(ids: $ids) {
          id
          unreadChatMessageCount
        }
      }
    `,
    {
      ids: projectIds
    }).pipe(map(res => {
      console.log(res);
      this._allProjectsNotifications$.next(res);
    }));
  }

  /**
   * @name getMyInfo
   * @description get user info
   */
  getMyInfo(): Observable<any> {
    if (environment.demo) {
      this.storage.setUser({
        uuid: this.demo.myInfo.uuid,
        name: this.demo.myInfo.name,
        firstName: this.demo.myInfo.firstName,
        lastName:this.demo.myInfo.lastName,
        email: this.demo.myInfo.email,
        image: this.demo.myInfo.image,
        role: this.demo.myInfo.role,
        contactNumber: this.demo.myInfo.contactNumber,
        userHash: this.demo.myInfo.userHash
      });
      return of(this.demo.myInfo);
    }
    return this.apolloService.graphQLFetch(
      `query user {
        user {
          uuid
          name
          firstName
          lastName
          email
          image
          role
          contactNumber
          userHash
        }
      }`,
      {
        noCache: true
      }
    ).pipe(map(response => {
      if (response.data && response.data.user) {
        const thisUser = response.data.user;

        this.storage.setUser({
          uuid: thisUser.uuid,
          name: thisUser.name,
          firstName: thisUser.firstName,
          lastName: thisUser.lastName,
          email: thisUser.email,
          image: thisUser.image,
          role: thisUser.role,
          contactNumber: thisUser.contactNumber,
          userHash: thisUser.userHash
        });
      }
      return response;
    }));
  }

  getEvents() {
    if (environment.demo) {
      this.storage.setUser({
        hasEvents: true
      });
      return of([]);
    }

    return this.eventService.getEvents().pipe(map(events => {
      this.storage.setUser({
        hasEvents: !this.utils.isEmpty(events)
      });
      return events;
    }));
  }

  checkIsOneProgram(programs?) {
    let programList = programs;
    if (environment.demo) {
      programList = this.demo.programs;
    } else if (this.utils.isEmpty(programs)) {
      programList = this.storage.get('programs');
    }
    if (programList.length === 1) {
      return true;
    }
    return false;
  }

  /**
   * this method will check program data and navigate to switcher or dashboard/go-mobile
   * @param programs
   * there are 4 types of values can come to programs variable.
   * - Array with multiple program objects -> [{},{},{},{}]
   * - Array with one program object -> [{}]
   * - one program object -> {}
   * - empty value
   * if method got 'Array with multiple program objects', redirect to switcher page.
   * if method got 'Array with one program object', switch to that program object and navigate to dashboard.
   * if method got 'one program object', switch to that program object and navigate to dashboard.
   * if method got 'empty value', do nothing.
   */
  async switchProgramAndNavigate(programs): Promise<string[]> {
    if (environment.demo) {
      return ['experiences'];
    }

    if (!this.utils.isEmpty(programs)) {
      // Array with multiple program objects or one program object -> [{},{},{},{}] pr [{}]
      if (Array.isArray(programs)) {
        return ['experiences'];
      } else {
        // one program object -> {}
        await this.switchProgram(programs);
      }

      // await this.pusherService.initialise({ unsubscribe: true });
      // clear the cached data
      await this.utils.clearCache();
      if ((typeof environment.goMobile !== 'undefined' && environment.goMobile === false)
        || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        if (this.storage.get('directLinkRoute')) {
          const route = this.storage.get('directLinkRoute');
          this.storage.remove('directLinkRoute');
          return route;
        }
        return ['v3', 'home'];
      } else {
        return ['go-mobile'];
      }
    }
    return;
  }

  getNewJwt() {
    return this.requestService.get(api.get.jwt);
  }
}
