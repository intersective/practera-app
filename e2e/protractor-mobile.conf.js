const config = require('./protractor.conf').config;

exports.config = Object.assign(config, {
  specs: [
    './src/features/*.feature',
    './src/features/mobile/*.feature'
  ],
  cucumberOpts: {
    require: [
      './src/steps/config.ts',
      './src/steps/*.steps.ts',
      './src/steps/mobile/*.steps.ts'
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
