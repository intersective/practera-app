const config = require('./protractor-base.conf').config;

exports.config = Object.assign(config, {
  multiCapabilities: [
    {
      browserName: 'chrome',
      shardTestFiles: true,
      maxInstances: 5,
      specs: [
        './src/features/desktop/*.feature'
      ],
      chromeOptions: {
        args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      }
    },
    {
      browserName: 'chrome',
      shardTestFiles: true,
      maxInstances: 5,
      specs: [
        './src/features/mobile/*.feature'
      ],
      chromeOptions: {
        args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        mobileEmulation : {
          deviceName: 'Galaxy S5'
        }
      }
    }
  ]
});
