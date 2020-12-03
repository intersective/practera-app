var path = require('path');

module.exports = function(config) {

  var configuration = {
    basePath: '',

    files: [
        'assets/newrelic.js'
    ],

    singleRun: true,

    colors:    false,

    autoWatch: false,

    ngHtml2JsPreprocessor: {
      moduleName: 'foo'
    },

    logLevel: 'WARN',

    frameworks: ['jasmine', 'angular-filesort', '@angular-devkit/build-angular'],

    angularFilesort: {
      whitelist: [path.join(__dirname, '/**/!(*.html|*.spec|*.mock).js')]
    },

    browsers: ['ChromeHeadless'],

    sonarQubeUnitReporter: {
      sonarQubeVersion: 'LATEST',
      outputFile: '../tests/ut_report.xml',
      overrideTestDescription: true,
      testPaths: ['./src'],
      testFilePattern: '.spec.ts',
      useBrowserName: false
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-angular-filesort',
      'karma-coverage',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-sonarqube-unit-reporter',
      '@angular-devkit/build-angular/plugins/karma',
      'karma-coverage-istanbul-reporter'
    ],

    coverageReporter: {
      type : 'lcov',
      dir : '../tests',
      subdir : 'coverage'
    },

    reporters: ['progress', 'sonarqubeUnit', 'coverage'],

    preprocessors: {
      'src/**/*.js':   ['coverage'],
      'src/**/*.ts':   ['coverage']
    }
  };

  config.set(configuration);
};
