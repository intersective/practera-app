import { supportQuestionList } from './../../app/components/support-popup/support-questions';
import { ProgramObj } from "@v3/app/services/experience.service";

const programObj = [1, 2].map(num => {
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
      config: {},
      name: '',
      lead_image: '',
    },
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
    experience: {
      id: num,
      config: null,
      name: '',
      lead_image: '',
      uuid: '',
      timelineId: 0,
      projectId: 0,
      description: '',
      type: '',
      leadImage: '',
      status: '',
      color: '',
      secondaryColor: '',
      todoItemCount: 0,
      role: '',
      isLast: false,
      locale: '',
      supportName: '',
      supportEmail: '',
      cardUrl: '',
      iconUrl: '',
      bannerUrl: '',
      logoUrl: '',
      reviewRating: true,
      truncateDescription: true,
      featureToggle: {
        pulseCheckIndicator: false,
      },
      progress: 0,
    },
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
    experience: {
      id: num,
      config: null,
      name: '',
      lead_image: '',
      uuid: '',
      timelineId: 0,
      projectId: 0,
      description: '',
      type: '',
      leadImage: '',
      status: '',
      color: '',
      secondaryColor: '',
      todoItemCount: 0,
      role: '',
      isLast: false,
      locale: '',
      supportName: '',
      supportEmail: '',
      cardUrl: '',
      iconUrl: '',
      bannerUrl: '',
      logoUrl: '',
      reviewRating: true,
      truncateDescription: true,
      featureToggle: {
        pulseCheckIndicator: false,
      },
      progress: 0,
    },
    institution: {
      name: '',
      logo_url: '',
      config: {},
      uuid: '',
    },
  };
}));

export const ProgramFixture = programObj;
