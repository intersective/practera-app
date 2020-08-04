import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { SharedService } from '@services/shared.service';
import { ReviewListService } from '@app/review-list/review-list.service';
import { EventListService } from '@app/event-list/event-list.service';
import { environment } from '@environments/environment';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  me: 'api/users.json',
  teams: 'api/teams.json',
  jwt: 'api/v2/users/jwt/refresh.json'
};

export interface ProgramObj {
  program: Program;
  project: Project;
  timeline: Timeline;
  enrolment: Enrolment;
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

export interface Enrolment {
  contact_number: string;
}

@Injectable({
  providedIn: 'root'
})

export class SwitcherService {

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private sharedService: SharedService,
    private pusherService: PusherService,
    private reviewsService: ReviewListService,
    private eventsService: EventListService,
  ) {}

  getPrograms() {
    const programs = this.storage.get('programs');
    const cdn = 'https://cdn.filestackcontent.com/resize=fit:crop,width:';
    let imagewidth = 600;
    programs.forEach(program => {
      if (program.project.lead_image) {
        const imageId = program.project.lead_image.split('/').pop();
        if (!this.utils.isMobile()) {
          imagewidth = 1024;
        }
        program.project.lead_image = `${cdn}${imagewidth}/${imageId}`;
      }
    });
    return of(programs);
  }

  /**
   * Get the progress and number of notifications for each project
   * @param projectIds Project ids
   */
  getProgresses(projectIds: number[]) {
    return this.request.graphQLQuery(
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
      }
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

  switchProgram(programObj: ProgramObj): Observable<any> {
    const themeColor = this.utils.has(programObj, 'program.config.theme_color') ? programObj.program.config.theme_color : '#2bbfd4';
    let cardBackgroundImage = '';
    if (this.utils.has(programObj, 'program.config.card_style')) {
      cardBackgroundImage = '/assets/' + programObj.program.config.card_style;
    }

    this.storage.setUser({
      programId: programObj.program.id,
      programName: programObj.program.name,
      programImage: programObj.project.lead_image,
      hasReviewRating: this.utils.has(programObj, 'program.config.review_rating') ? programObj.program.config.review_rating : false,
      truncateDescription: this.utils.has(programObj, 'program.config.truncate_description') ? programObj.program.config.truncate_description : true,
      experienceId: programObj.program.experience_id,
      projectId: programObj.project.id,
      timelineId: programObj.timeline.id,
      contactNumber: programObj.enrolment.contact_number,
      themeColor: themeColor,
      activityCardImage: cardBackgroundImage,
      enrolment: programObj.enrolment,
      teamId: null,
      hasEvents: false,
      hasReviews: false
    });

    this.sharedService.onPageLoad();
    return forkJoin([
      this.getNewJwt(),
      this.getTeamInfo(),
      this.getMyInfo(),
      this.getReviews(),
      this.getEvents()
    ]);
  }

  getTeamInfo(): Observable<any> {
    return this.request.get(api.teams)
      .pipe(map(response => {
        if (response.success && response.data) {
          if (!this.utils.has(response.data, 'Teams') ||
              !Array.isArray(response.data.Teams) ||
              !this.utils.has(response.data.Teams[0], 'id')
             ) {
            return this.storage.setUser({
              teamId: null
            });
          }
          return this.storage.setUser({
            teamId: response.data.Teams[0].id
          });
        }
      }));
  }

  /**
   * @name getMyInfo
   * @description get user info
   */
  getMyInfo():  Observable<any> {
    return this.request.get(api.me).pipe(map(response => {
      if (response.data) {
        if (!this.utils.has(response, 'data.User')) {
          return this.request.apiResponseFormatError('User format error');
        }
        const apiData = response.data.User;
        this.storage.setUser({
          name: apiData.name,
          contactNumber: apiData.contact_number,
          email: apiData.email,
          role: apiData.role,
          image: apiData.image,
          linkedinConnected: apiData.linkedinConnected,
          linkedinUrl: apiData.linkedin_url,
          userHash: apiData.userhash,
          maxAchievablePoints: this.utils.has(apiData, 'max_achievable_points') ? apiData.max_achievable_points : null
        });
      }
      return response;
    }));
  }

  getReviews() {
    return this.reviewsService.getReviews().pipe(map(data => {
      this.storage.setUser({
        hasReviews: (data && data.length > 0)
      });
      return data;
    }));
  }

  getEvents() {
    return this.eventsService.getEvents().pipe(map(events => {
      this.storage.setUser({
        hasEvents: !this.utils.isEmpty(events)
      });
      return events;
    }));
  }

  checkIsOneProgram(programs?) {
    let programList = programs;
    if (this.utils.isEmpty(programs)) {
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
        return ['switcher', 'switcher-program'];
      // Array with one program object -> [{}]
      } else if (Array.isArray(programs) && this.checkIsOneProgram(programs)) {
        await this.switchProgram(programs[0]).toPromise();
      } else {
      // one program object -> {}
        await this.switchProgram(programs).toPromise();
      }

      await this.pusherService.initialise({ unsubscribe: true });
      // clear the cached data
      this.utils.clearCache();
      if ((typeof environment.goMobile !== 'undefined' && environment.goMobile === false)
        || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          if (this.storage.get('directLinkRoute')) {
            const route = this.storage.get('directLinkRoute');
            this.storage.remove('directLinkRoute');
            return route;
          }
          return ['app', 'home'];
      } else {
        return ['go-mobile'];
      }
    }
    return;
  }

  getNewJwt() {
    return this.request.get(api.jwt);
  }
}
