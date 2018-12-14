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
  teams: 'api/teams.json'
};

export interface ProgramObj {
  program: Program,
  project: Project,
  timeline: Timeline,
  enrolment: Enrolment
}

export interface Program {
  id: number,
  name: string,
  experience_id: number,
  color?: string
}

export interface Project {
  id: number
}

export interface Timeline {
  id: number
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
      experienceId: programObj.program.experience_id,
      projectId: programObj.project.id,
      timelineId: programObj.timeline.id,
      contactNumber: programObj.enrolment.contact_number
    });
    return this.request.get(api.teams)
      .pipe(map(response => {
        if (response.success && response.data) {
          if (!this.utils.has(response.data, 'Teams') || 
              !Array.isArray(response.data.Teams) || 
              !this.utils.has(response.data.Teams[0], 'id')
             ) {
            return this.request.apiResponseFormatError('Team format error');
          }
          this.storage.setUser({
            teamId: response.data.Teams[0].id
          });
          return true;
        }
      })
    );
  }
  
}
