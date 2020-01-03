import { FILESTACK } from './filestack';

export const environment = {
  production: true,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  env: 'live',
  APIEndpoint: 'https://api.practera.com/',
  graphQL: '',
  intercomAppId: 'pef1lmo8',
  filestack: {
    key: FILESTACK.KEY,
    s3Config: {
      location: 's3',
      container: 'practera-aus',
      region: 'ap-southeast-2',
      paths: {
        any: '/appv2/live/uploads/',
        image: '/appv2/live/uploads/',
        video: '/media/fpvideo/upload/'
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
