import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';

export interface ProgramObj {
  program: Program,
  project: Project,
  timeline: Timeline
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

@Injectable({
  providedIn: 'root'
})

export class SwitcherService {

  constructor(
    private storage: BrowserStorageService
  ) {}

  getPrograms() {
    return of(this.storage.get('programs'));
  }

  switchProgram(programObj:ProgramObj) {
    return of(this.storage.setUser({
      programId: programObj.program.id,
      programName: programObj.program.name,
      experienceId: programObj.program.experience_id,
      projectId: programObj.project.id,
      timelineId: programObj.timeline.id
    }));
  }
  
}
