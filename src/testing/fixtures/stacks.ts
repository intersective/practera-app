export const MockStacks = [
  {
    uuid: 'b0f6328e-379c-4cd2-9e96-1363a49ab001',
    name: 'Practera Classic App - Stage',
    description: 'Participate in an experience as a learner or reviewer - Testing',
    image: 'https://media.intersective.com/img/learners_reviewers.png',
    url: 'https://app.p1-stage.practera.com',
    type: 'app',
    coreApi: 'https://admin.p1-stage.practera.com',
    coreGraphQLApi: 'https://core-graphql-api.p1-stage.practera.com',
    chatApi: 'https://chat-api.p1-stage.practera.com',
    filestack: {
      s3Config: {
        container: 'files.p1-stage.practera.com',
        region: 'ap-southeast-2'
      },
    },
    defaultCountryModel: 'AUS',
    lastLogin: 1619660600368
  },
  {
    uuid: '9c31655d-fb73-4ea7-8315-aa4c725b367e',
    name: 'Practera Classic App - Sandbox',
    description: 'Participate in an experience as a learner or reviewer - Testing',
    image: 'https://media.intersective.com/img/learners_reviewers.png',
    url: 'https://app.p1-sandbox.practera.com',
    type: 'app',
    coreApi: 'https://admin.p1-sandbox.practera.com',
    coreGraphQLApi: 'https://core-graphql-api.p1-sandbox.practera.com',
    chatApi: 'https://chat-api.p1-sandbox.practera.com',
    filestack: {
      s3Config: {
        container: 'files.p1-sandbox.practera.com',
        region: 'ap-southeast-2'
      },
    },
    defaultCountryModel: 'AUS',
    lastLogin: 1619660600368
  },
  {
    uuid: 'f4f85069-ca3b-4044-905a-e366b724af6b',
    name: 'Practera App - Local Development',
    description: 'Participate in an experience as a learner or reviewer - Local',
    image: 'https://media.intersective.com/img/learners_reviewers.png',
    url: 'http://127.0.0.1:4200/',
    type: 'app',
    coreApi: 'http://127.0.0.1:8080',
    coreGraphQLApi: 'http://127.0.0.1:8000',
    chatApi: 'http://localhost:3000/local/graphql',
    filestack: {
      s3Config: {
        container: 'practera-aus',
        region: 'ap-southeast-2'
      },
    },
    defaultCountryModel: 'AUS',
    lastLogin: 1619660600368
  }
];
