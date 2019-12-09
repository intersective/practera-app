const config = require('./protractor.conf').config;

exports.config = Object.assign(config, {
  specs: [
    './src/features/*.feature',
    './src/features/mobile/*.feature'
  ],
  cucumberOpts: {
    require: [
      './src/steps/*.steps.js',
      './src/steps/mobile/*.steps.js'
    ]
  },
  capabilities: null,
  multiCapabilities: [
    {
      browserName: 'chrome',
      chromeOptions: {
        mobileEmulation : {
          deviceName: 'Galaxy S5'
        }
      }
    },
    {
      browserName: 'chrome',
      chromeOptions: {
        mobileEmulation : {
          deviceName: 'iPhone 6'
        }
      }
    }
  ]
});
