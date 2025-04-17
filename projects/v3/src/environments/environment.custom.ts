export const environment = {
  stackName: '<CUSTOM_STACK_NAME>',
  authCacheDuration: 5 * 60 * 1000, // 5 minutes
  production: '<CUSTOMPLAIN_PRDMODEFLAG>',
  demo: false,
  appkey: '<CUSTOM_APPKEY>',
  pusherKey: '<CUSTOM_PUSHERKEY>',
  pusherCluster: '<CUSTOM_PUSHER_CLUSTER>',
  env: '<CUSTOM_ENVIRONMENT>',
  APIEndpoint: '<CUSTOM_API_ENDPOINT>',
  graphQL: '<CUSTOM_GRAPH_QL>',
  chatGraphQL: '<CUSTOM_CHAT_GRAPH_QL>',
  globalLoginUrl: '<CUSTOM_GLOBAL_LOGIN_URL>',
  badgeProjectUrl: '<CUSTOM_BADGE_PROJECT_URL>',
  stackUuid: '<CUSTOM_STACK_UUID>',
  intercomAppId: '<CUSTOM_INTERCOM>',
  uppyConfig: {
    tusUrl: '<CUSTOM_UPLOAD_TUS_ENDPOINT>',
    uploadPreset: 'practera',
    restrictions: {
      minFileSize: 0, // No minimum size
      maxFileSize: <CUSTOM_UPLOAD_MAX_FILE_SIZE>, // 2GB max size
      minNumberOfFiles: 1, // At least one file
      maxNumberOfFiles: 1, // max one file for now
      maxTotalFileSize: undefined, // No limit on total size
      requiredMetaFields: [] // No required metadata fields
    }
  },
  filestack: {
    key: '<CUSTOM_FILESTACK_KEY>',
    s3Config: {
      location: 's3',
      container: '<CUSTOM_S3_BUCKET>',
      containerChina: '<CUSTOM_S3_BUCKET_CHINA>',
      region: '<CUSTOM_AWS_REGION>',
      regionChina: '<CUSTOM_AWS_REGION_CHINA>',
      paths: {
        any: '<CUSTOM_PATH_ANY>',
        image: '<CUSTOM_PATH_IMAGE>',
        video: '<CUSTOM_PATH_VIDEO>'
      },
      workflows: [
        '<CUSTOM_FILESTACK_VIRUS_DETECTION>',
      ],
    },
    policy: '<CUSTOM_FILESTACK_POLICY>',
    signature: '<CUSTOM_FILESTACK_SIGNATURE>',
    workflows: {
      virusDetection: '<CUSTOM_FILESTACK_VIRUS_DETECTION>',
    },
  },
  hubspot: {
    liveServerRegion: '<CUSTOM_LIVE_SERVER_REGION>',
    supportFormPortalId: '<CUSTOM_PORTAL_ID>',
    supportFormId: '<CUSTOM_FORM_ID>'
  },
  defaultCountryModel: '<CUSTOM_COUNTRY>',
  intercom: false,
  newrelic: '<CUSTOM_NEWRELIC>',
  goMobile: false,
  helpline: '<CUSTOM_HELPLINE>',
};
