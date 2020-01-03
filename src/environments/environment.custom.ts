import { FILESTACK } from './filestack';

export const environment = {
  production: true,
  appkey: '<CUSTOM_APPKEY>',
  pusherKey: '<CUSTOM_PUSHERKEY>',
  env: '<CUSTOM_ENVIRONMENT>',
  APIEndpoint: '<CUSTOM_API_ENDPOINT>',
  graphQL: '<CUSTOM_GRAPH_QL>',  
  intercomAppId: '<CUSTOM_INTERCOM>',
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
