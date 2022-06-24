// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=production` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in configurations section of `angular.json`.
export const environment = {
  production: false,
  skipGlobalLogin: false,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  env: 'sandbox',
  APIEndpoint: 'http://127.0.0.1:8080/',
  graphQL: 'http://127.0.0.1:8000/',
  chatGraphQL: 'http://localhost:3000/local/graphql/',
  globalLoginUrl: 'https://login.p2.practera.com',
  stackUuid: '9c31655d-fb73-4ea7-8315-aa4c725b367e',
  intercomAppId: '',
  filestack: {
    key: 'AO6F4C72uTPGRywaEijdLz',
    s3Config: {
      location: 's3',
      container: 'practera-aus',
      containerChina: 'practera-kr',
      region: 'ap-southeast-2',
      regionChina: 'ap-northeast-2',
      paths: {
        any: '/appv2/local/uploads/',
        image: '/appv2/local/uploads/',
        video: '/appv2/local/video/upload/'
      },
      workflows: [
        '3c38ef53-a9d0-4aa4-9234-617d9f03c0de',
      ],
    },
    policy: '<CUSTOM_FILESTACK_POLICY>',
    signature: '<CUSTOM_FILESTACK_SIGNATURE>',
    workflows: {
      virusDetection: '3c38ef53-a9d0-4aa4-9234-617d9f03c0de',
    },
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  newrelic: true,
  goMobile: false,
  appV3URL: 'http://localhost:4200'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
