import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  me: "api/users.json",
  teams: 'api/teams.json'
};

export interface ProgramObj {
  program: Program;
  project: Project;
  timeline: Timeline;
  enrolment: Enrolment;
}

export interface Program {
  id: number;
  name: string;
  experience_id: number;
  config?: ProgramConfig;
}

export interface ProgramConfig {
  theme_color?: string;
  card_style?: string;
  review_rating?: boolean;
}

export interface Project {
  id: number;
}

export interface Timeline {
  id: number;
}

export interface Enrolment {
  contact_number: string
}

@Injectable({
  providedIn: 'root'
})

export class SwitcherService {

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService
  ) {}

  getPrograms() {
    return of(this.storage.get('programs'));
  }

  switchProgram(programObj:ProgramObj) {
    this.storage.setUser({
      programId: programObj.program.id,
      programName: programObj.program.name,
      hasReviewRating: this.utils.has(programObj, 'program.config.review_rating') ? programObj.program.config.review_rating : false,
      experienceId: programObj.program.experience_id,
      projectId: programObj.project.id,
      timelineId: programObj.timeline.id,
      contactNumber: programObj.enrolment.contact_number,
      themeColor: this.utils.has(programObj, 'program.config.theme_color') ? programObj.program.config.theme_color : '',
      activityCard: this.utils.has(programObj, 'program.config.card_style') ? programObj.program.config.card_style : ''      
    });
    this._getTeamInfo().subscribe();
    return this._getMyInfo();
  }

  private _getTeamInfo(): Observable<any> {
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
      })
    );
  }
  
  /**
   * @name _getMyInfo
   * @description get user info
   */
  private _getMyInfo(): Observable<any> {
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

}
