import { environment as base } from './environment.e2e';
// Public sandbox endpoints; the learner token is supplied to Playwright at runtime.
export const environment = {
  ...base, stackName: 'p2-sandbox', env: 'sandbox', appkey: '',
  APIEndpoint: 'https://admin.p2-sandbox.practera.com/',
  graphQL: 'https://core-graphql-api.p2-sandbox.practera.com',
  chatGraphQL: 'https://core-graphql-api.p2-sandbox.practera.com',
  globalLoginUrl: 'https://login-app.p2-sandbox.practera.com',
  stackUuid: '',
};
