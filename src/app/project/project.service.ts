import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  levels = [
    {
    id: 1,
    name: 'fundamental',
    project_id: 55,
    progress :1,
    description: ' You are now part of the learning community. Whether you are a Project Stakeholder, Consulting Mentor or a University Student about to embark on your first consulting project, welcome. This Fundamentals milestone will provide you with an overview, explain your role and provide you with tips and tricks for a successful learning experience ',
    Activity :[
      {
        name: 'Test Activity one',
        is_locked: false,
        progress: 0.34,
        hasFeedback: true
      },
      {
        name: 'Activity two',
        is_locked: true,
        progress: 0.74
        
      }
  ],
    is_locked: false
  },
  

  {
    id: 2,
    name: 'delivery',
    description:'', 
    project_id: 55,
    progress: 0.62,
    Activity :[
      {
        name: 'Test Activity three',
        is_locked: false,
        progress: 0.47
      },
      {
        name: 'Activity four',
        is_locked: false,
        progress:0.98
      },
      {
        name: 'Test Activity five',
        is_locked: false,
        progress: 0.47
      },
  ],
    
    is_locked: false

  },
  {
    id: 3,
    name: 'communication',
    description: 'there is some dummy text',
    progress: 1,
    project_id: 55,
    Activity :[
      {
        name: 'Test Activity six',
        is_locked: false,
        progress: 1,
        hasFeedback: false
      },
      {
        name: 'Activity seven',
        is_locked: false,
        progress:0.48,
        hasFeedback: true
        
      }
  ],
    is_locked: true

  },
  {
    id: 4,
    name: 'last',
    description: 'The deliver phase of a project is all about getting the work done. During this phase your team will likely work both independently and collectively to research and ultimately present your findings. Throughout this phase you will also complete a second employability skill assessment to see how you feel your skills are development and reflect on the journey so far in a reflection journal entry.',
    progress: 0.45,
    project_id: 65,
    Activity :[
      {
        name: 'Test Activity six',
        is_locked: false,
        progress: 1
      },
  ],
    is_locked: false

  }
];

  constructor() { }
  getMilestons(): Observable<any> {
    return of(this.levels);
  }

}