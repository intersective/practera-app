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
      },
      workflows: [
        '3c38ef53-a9d0-4aa4-9234-617d9f03c0de',
      ],
    },
    policy: 'eyJleHBpcnkiOjE3MzU2NTAwMDB9',
    signature: '30323e4c80bb68e30afef26b32aa4dae401b0581b8e8ba9da93f3a01701be267',
    workflows: {
      virusDetection: '3c38ef53-a9d0-4aa4-9234-617d9f03c0de',
    },
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  goMobile: false,
};
