export const environment = {
  stackName: 'p2-stage',
  authCacheDuration: 5 * 60 * 1000, // 5 minutes
  production: true,
  demo: false,
  appkey: 'b11e7c189b',
  pusherKey: 'c8f1e1cba0f717e24046',
  pusherCluster: 'ap1',
  env: 'test',
  APIEndpoint: 'https://admin.p2-stage.practera.com/',
  graphQL: 'https://core-graphql-api.p2-stage.practera.com',
  chatGraphQL: 'https://chat-api.p2-stage.practera.com',
  globalLoginUrl: 'https://app.login-stage.practera.com',
  badgeProjectUrl: 'https://badge.p2-stage.practera.com',
  stackUuid: '571c91b4-f0e1-498d-a5db-04f8d92d3693',
  intercomAppId: 'pef1lmo8',
  uppyConfig: {
    tusUrl: 'https://tusd.practera.com/uploads/',
    uploadPreset: 'practera',
    restrictions: {
      minFileSize: 0, // No minimum size
      maxFileSize: 2147483648, // 2GB max size
      minNumberOfFiles: 1, // At least one file
      maxNumberOfFiles: 1, // max one file for now
      maxTotalFileSize: undefined, // No limit on total size
      requiredMetaFields: [] // No required metadata fields
    }
  },
  filestack: {
    key: 'AO6F4C72uTPGRywaEijdLz',
    s3Config: {
      location: 's3',
      container: 'files.p2-stage.practera.com',
      containerChina: '<CUSTOM_S3_BUCKET_CHINA>',
      region: 'ap-southeast-2',
      regionChina: '<CUSTOM_AWS_REGION_CHINA>',
      paths: {
        any: '/appv3/test/any/',
        image: '/appv3/test/images/',
        video: '/appv3/test/videos/'
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
  hubspot: {
    liveServerRegion: 'AU',
    supportFormPortalId: '3404872',
    supportFormId: '114bee73-67ac-4f23-8285-2b67e0e28df4'
  },
  defaultCountryModel: 'AUS',
  intercom: false,
  newrelic: 'true',
  goMobile: false,
  featureToggles: {
    assessmentPagination: true,
  },
  helpline: '<CUSTOM_HELPLINE>',
};
