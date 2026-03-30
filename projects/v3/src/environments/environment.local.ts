// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=production` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in configurations section of `angular.json`.
export const environment = {
  stackName: 'p2-local',
  authCacheDuration: 5 * 60 * 1000, // 5 minutes
  demo: false,
  production: false,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  pusherCluster: '',
  env: 'sandbox',
  APIEndpoint: 'http://127.0.0.1:8080/',
  graphQL: 'http://127.0.0.1:8000/',
  chatGraphQL: 'http://localhost:3000/local/graphql/',
  globalLoginUrl: 'https://login.p2.practera.com',
  badgeProjectUrl: 'https://badge-issuer.p2.practera.com',
  stackUuid: '9c31655d-fb73-4ea7-8315-aa4c725b367e',
  intercomAppId: ' ',
  uppyConfig: {
    tusUrl: 'https://127.0.0.1:8000/uploads',
    uploadPreset: 'practera',
    restrictions: {
      minFileSize: undefined, // No minimum size
      maxFileSize: 2147483648, // 2GB max size
      minNumberOfFiles: 1, // At least one file
      maxNumberOfFiles: 5, // At most 5 files
      maxTotalFileSize: undefined, // No limit on total size
      requiredMetaFields: [], // No required metadata fields
    }
  },
  hubspot: {
    liveServerRegion: '',
    supportFormPortalId: '',
    supportFormId: ''
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  newrelic: false,
  goMobile: false,
  projecthub: 'http://localhost:3000/',
  helpline: 'help@practera.com',
  featureToggles: {
    assessmentPagination: true,
  },
  snowAnimation: {
    enabled: true,
    snowflakeCount: 30,
  },
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
