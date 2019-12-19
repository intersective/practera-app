// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=production` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in configurations section of `angular.json`.
const FILESTACK = {
  VIRUS_DETECTION: '3c38ef53-a9d0-4aa4-9234-617d9f03c0de',
};

export const environment = {
  production: false,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  env: 'sandbox',
  APIEndpoint: 'https://sandbox.practera.com/',
  intercomAppId: '',
  filestack: {
    key: 'AO6F4C72uTPGRywaEijdLz',
    s3Config: {
      location: 's3',
      container: 'practera-aus',
      region: 'ap-southeast-2',
      paths: {
        any: '/appv2/stage/uploads/',
        image: '/appv2/stage/uploads/',
        video: '/appv2/stage/video/upload/'
      },
      workflows: [
        FILESTACK.VIRUS_DETECTION,
      ],
    },
    policy: 'eyJleHBpcnkiOjE5MjQ5NjMxNDB9',
    signature: 'a33b354ff60fb7709b0b87975974eb3bf96081aed45237a6436cdce565ad9be5',
    workflows: {
      virusDetection: FILESTACK.VIRUS_DETECTION,
    },
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  goMobile: false,
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
