// Preview build values. graphQL is the deployed Preview HTTP API.
// Other hosts stay placeholders until those services exist.
export const environment = {
  stackName: 'preview',
  authCacheDuration: 5 * 60 * 1000,
  demo: false,
  production: true,
  appkey: 'preview-unset',
  pusherKey: '',
  pusherCluster: '',
  pusherHost: '',
  pusherPort: 443,
  pusherUseTLS: true,
  env: 'preview',
  APIEndpoint: 'https://preview-admin.invalid/',
  graphQL: 'https://2u2nk6a6bl.execute-api.us-east-1.amazonaws.com/',
  chatGraphQL: 'https://2u2nk6a6bl.execute-api.us-east-1.amazonaws.com/',
  globalLoginUrl: 'https://d3nccvmqtggdef.cloudfront.net',
  loginAPIUrl: 'https://d3nccvmqtggdef.cloudfront.net/api',
  stackUuid: '7c4e9a10-2f6b-4d11-9a3e-111111111111',
  intercomAppId: ' ',
  uppyConfig: {
    tusUrl: 'https://preview-upload.invalid/uploads/',
    uploadPreset: 'practera',
    restrictions: {
      minFileSize: undefined,
      maxFileSize: 2147483648,
      minNumberOfFiles: 1,
      maxNumberOfFiles: 5,
      maxTotalFileSize: undefined,
      requiredMetaFields: [],
    }
  },
  hubspot: {
    liveServerRegion: '',
    supportFormPortalId: '',
    supportFormId: ''
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  goMobile: false,
  projecthub: 'https://preview-hub.invalid/',
  helpline: 'help@practera.com',
  featureToggles: {
    assessmentPagination: true,
  },
};
