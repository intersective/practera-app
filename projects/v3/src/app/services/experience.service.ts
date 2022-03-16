import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { map, mergeMap } from 'rxjs/operators';
import { UtilsService } from '@v3/services/utils.service';
import { ApolloService } from '@v3/services/apollo.service';

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

  constructor(
    private demo: DemoService,
    private utils: UtilsService,
    private apolloService: ApolloService,
  ) { }

  async getPrograms() {
    let programs = null;
    const cdn = 'https://cdn.filestackcontent.com/resize=fit:crop,width:';
    let imagewidth = 600;
    let projectIds = [];
    if (environment.demo) {
      programs = this.demo.programs;
    } else {
      // programs = this.storage.get('programs');
    }
    programs.forEach(program => {
      if (program.project.lead_image) {
        const imageId = program.project.lead_image.split('/').pop();
        if (!this.utils.isMobile()) {
          imagewidth = 1024;
        }
        program.project.lead_image = `${cdn}${imagewidth}/${imageId}`;
      }
      projectIds.push(program.project.id);
    });
    const progress = await this.getProgresses(projectIds);
    this._programs$.next(this._normalisePrograms(programs, progress));
  }

  private _normalisePrograms(programs: ProgramObj[], progressList: ProjectProgress[]) {
    progressList.forEach(progress => {
      const i = programs.findIndex(program => program.project.id === progress.id);
      programs[i].progress = (progress.progress * 100);
      programs[i].todoItems = progress.todoItems;
    });
    return programs;
  }

  /**
   * Get the progress and number of notifications for each project
   * @param projectIds Project ids
   */
  getProgresses(projectIds: number[]) {
    if (environment.demo) {
      return this.demo.projectsProgress;
    }
  }
}
