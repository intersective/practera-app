export interface FeatureToggles {
  assessmentPagination?: boolean;
}

export interface Environment {
  stackName?: string;
  authCacheDuration: number;
  demo: boolean;
  production: boolean;
  skipGlobalLogin?: boolean;
  appkey: string;
  pusherKey: string;
  pusherCluster?: string;
  env: string;
  APIEndpoint: string;
  graphQL: string;
  chatGraphQL: string;
  globalLoginUrl: string;
  badgeProjectUrl?: string;
  loginAPIUrl?: string;
  stackUuid: string;
  intercomAppId: string;
  uppyConfig: {
    tusUrl: string;
    uploadPreset: string;
    restrictions: {
      minFileSize?: number;
      maxFileSize: number;
      minNumberOfFiles: number;
      maxNumberOfFiles: number;
      maxTotalFileSize?: number;
      requiredMetaFields: string[];
    };
  };
  filestack: {
    key: string;
    s3Config: {
      location: string;
      container: string;
      containerChina: string;
      region: string;
      regionChina: string;
      paths: {
        any: string;
        image: string;
        video: string;
      };
      workflows: string[];
    };
    policy: string;
    signature: string;
    workflows: {
      virusDetection: string;
    };
  };
  hubspot: {
    liveServerRegion: string;
    supportFormPortalId: string;
    supportFormId: string;
  };
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  defaultCountryModel?: string;
  intercom: boolean;
  newrelic: boolean | string;
  goMobile: boolean;
  helpline: string;
  featureToggles?: FeatureToggles;
}
