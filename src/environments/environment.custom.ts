export const environment = {
  production: true,
  appkey: 'b11e7c189b',
  pusherKey: '255f010d210933ca7675',
  env: '<CUSTOM_ENVIRONMENT>',
  APIEndpoint: '<CUSTOM_API_ENDPOINT>',
  intercomAppId: 'pef1lmo8',
  filestack: {
    key: 'AO6F4C72uTPGRywaEijdLz',
    s3Config: {
      location: 's3',
      container: '<CUSTOM_S3_BUCKET>',
      region: '<CUSTOM_AWS_REGION>',
      paths: {
        any: '/appv2/<CUSTOM_APP>/uploads/',
        image: '/appv2/<CUSTOM_APP>/uploads/',
        video: '/appv2/<CUSTOM_APP>/video/upload/'
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
  defaultCountryModel: '<CUSTOM_COUNTRY>',
  intercom: false,
  goMobile: false,
};
