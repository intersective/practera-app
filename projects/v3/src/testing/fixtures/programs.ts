import { ProgramObj } from '@app/switcher/switcher.service';
const programObj: ProgramObj[] = [1, 2].map(num => {
  return {
    program: {
      id: num,
      experience_id: num,
      name: `test program ${num}`,
      config: {
        theme_color: `sample ${num}`
      }
    },
    project: {
      id: num,
    },
    timeline: {
      id: num,
    },
    enrolment: {
      contact_number: `0${123456789 + num}`
    },
    experience: {
      id: num,
      config: {}
    }
  };
});
programObj.push(...[3].map(num => {
  return {
    program: {
      id: num,
      experience_id: num,
      name: `test program ${num}`,
      config: {
        theme_color: `sample ${num}`
      }
    },
    project: {
      id: num,
    },
    timeline: {
      id: num,
    },
    enrolment: {
      contact_number: `0${123456789 + num}`
    },
    experience: {
      id: num,
      config: null
    }
  };
}));
programObj.push(...[4].map(num => {
  return {
    program: {
      id: num,
      experience_id: num,
      name: `test program ${num}`,
      config: {
        theme_color: `sample ${num}`
      }
    },
    project: {
      id: num,
    },
    timeline: {
      id: num,
    },
    enrolment: {
      contact_number: `0${123456789 + num}`
    },
    experience: null
  };
}));

export const ProgramFixture: ProgramObj[] = programObj;
