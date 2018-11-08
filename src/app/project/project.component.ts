import { Component } from '@angular/core';

@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent {
  public levels = [
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
          progress: 0.34
        },
        {
          name: 'Activity two',
          is_locked: false,
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
          progress: 1
        },
        {
          name: 'Activity seven',
          is_locked: false,
          progress:0.48
          
        }
    ],
      is_locked: true

    }
  ];
  
}
