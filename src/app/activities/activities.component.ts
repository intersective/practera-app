import { Component } from '@angular/core';

@Component({
  selector: 'app-activities',
  templateUrl: 'activities.component.html',
  styleUrls: ['activities.component.scss']
})
export class ActivitiesComponent {
  public levels = [
    {
      id: 1,
      name: 'fundamental',
      project_id: 55,
      progress :0.021,
      Activity :{

      },
      is_locked: false
    },
    

    {
      id: 2,
      name: 'delivery',
      project_id: 55,
      progress: 0.62,
      Activity :{
        
      },
      is_locked: false

    },
    {
      id: 3,
      name: 'communication',
      progress: 0.3334,
      project_id: 55,
      Activity :{
        
      },
      is_locked: true

    }
  ];
}
