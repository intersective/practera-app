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
  hubspot: {
    liveServerRegion: '<CUSTOM_LIVE_SERVER_REGION>',
    supportFormPortalId: '<CUSTOM_PORTAL_ID>',
    supportFormId: '<CUSTOM_FORM_ID>'
  },
  defaultCountryModel: '<CUSTOM_COUNTRY>',
  intercom: false,
  newrelic: '<CUSTOM_NEWRELIC>',
  goMobile: false,
  projecthub: '<CUSTOM_PROJECTHUB_URL>',
  helpline: '<CUSTOM_HELPLINE>',
  featureToggles: {
    assessmentPagination: <CUSTOM_ENABLE_ASSESSMENT_PAGINATION>,
  },
  snowAnimation: {
    enabled: false,
    snowflakeCount: 30,
  },
};
