export const environment = {
  production: false,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  env: 'develop',
  APIEndpoint: 'http://127.0.0.1:8080/',
  graphQL: 'http://127.0.0.1:8000/',
  intercomAppId: '',
  filestack: {
    key: 'AO6F4C72uTPGRywaEijdLz',
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
  goMobile: false,
};
