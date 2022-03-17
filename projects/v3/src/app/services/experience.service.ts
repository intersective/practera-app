import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { map, mergeMap } from 'rxjs/operators';
import { UtilsService } from '@v3/services/utils.service';
import { ApolloService } from '@v3/services/apollo.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { PusherService } from '@v3/services/pusher.service';

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

  private _programs$ = new BehaviorSubject<ProgramObj[]>(null);
  programs$ = this._programs$.asObservable();

  programsWithProgress$ = this._programs$.asObservable().pipe(map(
    programs => {
      const projectIds = programs.map(program => program.project.id);
      const progressList = this.getProgresses(projectIds);
      progressList.forEach(progress => {
        const i = programs.findIndex(program => program.project.id === progress.id);
        programs[i].progress = (progress.progress * 100);
        programs[i].todoItems = progress.todoItems;
      });
      return programs;
    }
  ));

  constructor(
    private demo: DemoService,
    private utils: UtilsService,
    private apolloService: ApolloService,
    private sharedService: SharedService,
    private storage: BrowserStorageService,
    private pusherService: PusherService
  ) { }

  async getPrograms() {
    let programs = null;
    const cdn = 'https://cdn.filestackcontent.com/resize=fit:crop,width:';
    let imagewidth = 600;
    if (environment.demo) {
      programs = this.demo.programs;
    } else {
      // programs = this.storage.get('programs');
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
      return this.demo.projectsProgress;
    }
    // GraphQL API call
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

  switchProgram(programObj: ProgramObj): Observable<any> {
    // initialise Pusher
    // this.sharedService.initWebServices();

    const colors = this.extractColors(programObj);

    let cardBackgroundImage = '';
    if (this.utils.has(programObj, 'program.config.card_style')) {
      cardBackgroundImage = '/assets/' + programObj.program.config.card_style;
    }

    this.storage.setUser({
      colors: {
        theme: colors.themeColor,
        primary: colors.primary,
        secondary: colors.secondary,
      },

      programId: programObj.program.id,
      programName: programObj.program.name,
      programImage: programObj.project.lead_image,
      hasReviewRating: this.utils.has(programObj, 'program.config.review_rating') ? programObj.program.config.review_rating : false,
      truncateDescription: this.utils.has(programObj, 'program.config.truncate_description') ? programObj.program.config.truncate_description : true,
      experienceId: programObj.program.experience_id,
      projectId: programObj.project.id,
      timelineId: programObj.timeline.id,
      contactNumber: programObj.enrolment.contact_number,
      activityCardImage: cardBackgroundImage,
      enrolment: programObj.enrolment,
      activityCompleteMessage: this.utils.has(programObj, 'experience.config.activity_complete_message') ? programObj.experience.config.activity_complete_message : null,
      chatEnabled: this.utils.has(programObj, 'experience.config.chat_enable') ? programObj.experience.config.chat_enable : true,
      teamId: null,
      hasEvents: false,
      hasReviews: false
    });

    // this.sharedService.onPageLoad();
    return forkJoin([
      this.getNewJwt(),
      // this.sharedService.getTeamInfo(),
      this.getMyInfo(),
      this.getReviews(),
      this.getEvents()
    ]);
  }

  /**
   * @name getMyInfo
   * @description get user info
   */
  getMyInfo(): Observable<any> {
    if (environment.demo) {
      this.storage.setUser({
        name: this.demo.myInfo.name,
        email: this.demo.myInfo.email,
        image: this.demo.myInfo.image,
        role: this.demo.myInfo.role,
        contactNumber: this.demo.myInfo.contactNumber,
        userHash: this.demo.myInfo.userHash
      });
      return of(this.demo.myInfo);
    }
  }

  getReviews() {
    if (environment.demo) {
      this.storage.setUser({
        hasReviews: false
      });
      return of([]);
    }
  }

  getEvents() {
    if (environment.demo) {
      this.storage.setUser({
        hasEvents: true
      });
      return of([]);
    }
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
  async switchProgramAndNavigate(programs): Promise<any> {
    if (!this.utils.isEmpty(programs)) {
      // Array with multiple program objects -> [{},{},{},{}]
      if (Array.isArray(programs) && !this.checkIsOneProgram(programs)) {
        return ['experiences'];
        // Array with one program object -> [{}]
      } else if (Array.isArray(programs) && this.checkIsOneProgram(programs)) {
        await this.switchProgram(programs[0]).toPromise();
      } else {
        // one program object -> {}
        await this.switchProgram(programs).toPromise();
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
    return of('asas');
  }

}
