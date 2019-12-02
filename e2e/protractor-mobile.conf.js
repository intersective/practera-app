const config = require('./protractor.conf').config;

config.specs = [
  './src/**/*.e2e-spec.ts',
];
config.capabilities = null;
config.multiCapabilities = [
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
exports.config = config;
