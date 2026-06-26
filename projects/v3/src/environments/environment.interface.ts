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
  /** Optional explicit Pusher host (used when talking to a self-hosted
   *  Pusher-compatible broker like Soketi instead of Pusher Cloud). */
  pusherHost?: string;
  /** Port the broker listens on. Kept as string to simplify build-time
   *  template substitution; coerced to number at runtime. */
  pusherPort?: string | number;
  /** Whether the Pusher client should use TLS (wss). Defaults to true.
   *  Accepted as either a boolean or its string form. */
  pusherUseTLS?: string | boolean;
  env: string;
  APIEndpoint: string;
  graphQL: string;
  chatGraphQL: string;
  globalLoginUrl: string;
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
  goMobile: boolean;
  helpline: string;
  featureToggles?: FeatureToggles;
}
