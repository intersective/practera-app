const config = require('./protractor-base.conf').config;

exports.config = Object.assign(config, {
  baseUrl: 'http://localhost:4300/',
  specs: [
    './src/features/registration.feature'
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
