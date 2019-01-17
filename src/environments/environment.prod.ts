export const environment = {
  production: true,
  env: 'live',
  APIEndpoint: 'https://api.practera.com/',
  filestack: {
    key: 'AO6F4C72uTPGRywaEijdLz',
    s3Config: {
      location: 's3',
      container: 'practera-aus',
      region: 'ap-southeast-2',
      paths: {
        any: '/appv2/live/uploads/',
        image: '/appv2/live/uploads/',
        video: '/media/fpvideo/upload/'
      }
    }
  }
};
