import { ProgramObj } from '@app/switcher/switcher.service';
import { Stack } from '@services/storage.service';
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
    },
    apikey: `1234 ${num}`,
    stack: {
      uuid: `0001 ${num}`,
      name: 'Practera App - Stage',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.stage.practera.com',
      type: 'app',
      coreApi: 'https://admin.stage.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.stage.practera.com',
      chatApi: 'https://chat-api.tage.practera.com',
      filestack: {
        s3Config: {
          container: 'files.stage.practera.com',
          region: 'ap-southeast'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
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
    },
    apikey: `2345 ${num}`,
    stack: {
      uuid: `0002 ${num}`,
      name: 'Practera App - Stage',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.stage.practera.com',
      type: 'app',
      coreApi: 'https://admin.stage.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.stage.practera.com',
      chatApi: 'https://chat-api.tage.practera.com',
      filestack: {
        s3Config: {
          container: 'files.stage.practera.com',
          region: 'ap-southeast'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
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
    experience: null,
    apikey: `2345 ${num}`,
    stack: {
      uuid: `0002 ${num}`,
      name: 'Practera App - Stage',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.stage.practera.com',
      type: 'app',
      coreApi: 'https://admin.stage.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.stage.practera.com',
      chatApi: 'https://chat-api.tage.practera.com',
      filestack: {
        s3Config: {
          container: 'files.stage.practera.com',
          region: 'ap-southeast'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
    }
  };
}));

export const ProgramFixture: ProgramObj[] = programObj;
