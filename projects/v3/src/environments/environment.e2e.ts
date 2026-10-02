// Public synthetic values only. Playwright intercepts these endpoints before navigation.
export const environment = {
  stackName: 'e2e', authCacheDuration: 0, demo: false, production: false,
  appkey: 'e2e-public-app', pusherKey: 'e2e-public-key', pusherCluster: 'local',
  pusherHost: 'socket.e2e.invalid', pusherPort: 443, pusherUseTLS: true,
  env: 'e2e', APIEndpoint: 'https://api.e2e.invalid/',
  graphQL: 'https://graphql.e2e.invalid/', chatGraphQL: 'https://graphql.e2e.invalid/',
  globalLoginUrl: 'https://login.e2e.invalid', stackUuid: 'e2e-stack',
  intercomAppId: '', intercom: false, goMobile: false,
  uppyConfig: { tusUrl: 'https://upload.e2e.invalid/uploads/', uploadPreset: 'practera',
    restrictions: { minFileSize: undefined, maxFileSize: 2147483648, minNumberOfFiles: 1,
      maxNumberOfFiles: 5, maxTotalFileSize: undefined, requiredMetaFields: [] } },
  hubspot: { liveServerRegion: '', supportFormPortalId: '', supportFormId: '' },
  defaultCountryModel: 'AUS', projecthub: 'https://project.e2e.invalid/',
  helpline: 'help@example.invalid', featureToggles: { assessmentPagination: true },
};
