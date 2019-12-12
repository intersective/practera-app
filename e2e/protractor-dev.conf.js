const config = require('./protractor.conf').config;

exports.config = Object.assign(config, {
  specs: [
    './src/features/login.feature'
  ],
  multiCapabilities: [],
  capabilities: {
    browserName: 'chrome',
    // chromeOptions: {
    //   mobileEmulation : {
    //     deviceName: 'Galaxy S5'
    //     // deviceName: 'iPhone 6'
    //   }
    // }
  }
});
