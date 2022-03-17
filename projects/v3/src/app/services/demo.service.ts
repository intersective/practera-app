import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DemoService {
  image = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2252&q=80';

  description = `Practera is the leading platform to power high quality experiential learning programs.<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services<br/><br/>Deliver experiential learning programs at larger scale and lower cost<br/>Customisable platform to author, launch & manage programs<br/>Connect students to industry projects, internships & experiences<br/>Expert course design, configuration and deployment services`;

  constructor() { }

  get experience() {
    return {
      image: this.image,
      name: 'Welcome to the Global Trade Accelerator',
      description: this.description
    }
  }

  get milestones() {
    return [
      {
        id: 1,
        name: 'Get Started',
        isLocked: false,
        description: 'This contain some starting activities',
        activities: [
          {
            id: 11,
            name: 'Welcome to the Global Trade Accelerator',
            isLocked: false,
            leadImage: this.image
          },
          {
            id: 12,
            name: 'Introduction to Experiential Learning',
            isLocked: false,
            leadImage: this.image
          },
          {
            id: 13,
            name: 'The First Client Meeting',
            isLocked: false,
            leadImage: this.image
          }
        ]
      },
      {
        id: 2,
        name: 'Second Section',
        isLocked: false,
        description: 'This contain some other activities',
        activities: [
          {
            id: 21,
            name: 'The Second Client Meeting',
            isLocked: false,
            leadImage: this.image
          },
          {
            id: 22,
            name: 'This is a locked activity',
            isLocked: true,
            leadImage: this.image
          }
        ]
      },
      {
        id: 3,
        name: 'Third Section',
        isLocked: true,
        description: 'This contain some more activities'
      }
    ]
  }

  get projectProgress() {
    return {
      progress: 0.65,
      milestones: [
        {
          id: 1,
          activities: [
            {
              id: 11,
              progress: 1
            },
            {
              id: 12,
              progress: 0.8
            },
            {
              id: 13,
              progress: 0
            }
          ]
        },
        {
          id: 2,
          activities: [
            {
              id: 21,
              progress: 0.5
            },
            {
              id: 22,
              progress: 0
            }
          ]
        }
      ]
    }
  }

  get achievements() {
    return Array(5).fill(1).map((v, i) => ({
      id: i + 1,
      name: `Badge${ i + 1 }`,
      description: `Badge description${ i + 1 }`,
      image: 'https://www.filepicker.io/api/file/Pt5V84aSTvyYEil1bttc',
      points: Math.floor(Math.random() * 1000),
      isEarned: i < 3,
      earnedDate: '2021-10-04 05:44:49'
    }));
  }

  get notifications() {
    return [
      {
        id: 1,
        title: 'notification 1',
      },
    ];
  }
}
