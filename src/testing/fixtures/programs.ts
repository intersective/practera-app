import { ProgramObj } from '@app/switcher/switcher.service';
export const ProgramFixture: ProgramObj[] = [
  {
    program: {
      id: 1,
      experience_id: 1,
      name: 'test program',
      config: {
        theme_color: 'sample'
      }
    },
    project: {
      id: 1,
    },
    timeline: {
      id: 1,
    },
    enrolment: {
      contact_number: '0123456789'
    },
  }
];
