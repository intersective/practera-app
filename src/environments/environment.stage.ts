export const environment = {
  production: true,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  env: 'stage',
  APIEndpoint: 'https://stage.practera.com/',
  graphQL: 'https://96uoyi6x8h.execute-api.ap-southeast-2.amazonaws.com/stage/',
  intercomAppId: 'pef1lmo8',
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
      }
    }
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  goMobile: false,
};
