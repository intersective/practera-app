import { FILESTACK } from './filestack';

export const environment = {
  production: false,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  env: 'develop',
  APIEndpoint: 'http://127.0.0.1:8080/',
  graphQL: 'http://127.0.0.1:8000/',
  intercomAppId: '',
  filestack: {
    key: FILESTACK.KEY,
    s3Config: {
      location: 's3',
      container: 'practera-aus',
      region: 'ap-southeast-2',
      paths: {
        any: '/appv2/local/uploads/',
        image: '/appv2/local/uploads/',
        video: '/appv2/local/uploads/'
      },
      workflows: [
        FILESTACK.VIRUS_DETECTION,
      ],
    },
    policy: FILESTACK.POLICY,
    signature: FILESTACK.SIGNATURE,
    workflows: {
      virusDetection: FILESTACK.VIRUS_DETECTION,
    },
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  goMobile: false,
};
