export const environment = {
  production: false,
  APIEndpoint: 'http://127.0.0.1:8080/',
  filestack: {
    key: 'AO6F4C72uTPGRywaEijdLz',
    s3Config: {
      location: 's3',
      container: 'practera-aus',
      region: 'ap-southeast-2',
      path: '/appv2/local/uploads/',
      paths: {
        any: '/appv2/local/uploads/',
        image: '/appv2/local/uploads/',
        video: '/appv2/local/uploads/'
      }
    }
  }
};
