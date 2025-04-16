import { supportQuestionList } from './../../app/components/support-popup/support-questions';
import { ProgramObj } from "@v3/app/services/experience.service";

const createExperience = (num: number) => {
  return {
    id: num,
    uuid: `uuid-${num}`,
    timelineId: num,
    projectId: num,
    name: `test-experience-${num}`,
    description: 'test description',
    type: 'test',
    leadImage: '',
    status: 'active',
    color: '',
    secondaryColor: '',
    todoItemCount: 0,
    role: 'participant',
    isLast: false,
    locale: 'en',
    supportName: '',
    supportEmail: '',
    cardUrl: '',
    bannerUrl: '',
    logoUrl: '',
    iconUrl: '',
    reviewRating: false,
    truncateDescription: false,
    featureToggle: {
      pulseCheckIndicator: false
    },
    progress: 0,
    config: {},
  };
};

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
    experience: createExperience(num),
    institution: {
      name: '',
      logo_url: '',
      config: {},
      uuid: '',
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
    experience: createExperience(num),
    institution: {
      name: '',
      logo_url: '',
      config: {},
      uuid: '',
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
    experience: createExperience(num),
    institution: {
      name: '',
      logo_url: '',
      config: {},
      uuid: '',
    }
  };
}));

export const ProgramFixture = programObj;
