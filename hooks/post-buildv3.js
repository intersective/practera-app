const path = require('path');
const fs = require('fs');
const util = require('util');

// get application version from package.json
const appVersion = require('../package.json').version;

// promisify core API's
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const readStats = util.promisify(fs.stat);

console.log('\nRunning post-build tasks');

// our version.json will be generate inside the dist folder
const versionFilePath = path.join(__dirname + '/../dist/v3/version.json');

let mainHash = '';
let mainBundleFile = '';

// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main.?([a-z0-9]*)?(\.bundle)?.js$/;

// read the dist folder files and find the one we're looking for
const dir = {
  project: '../dist/v3/',
  locales: {
    en: '../dist/v3/en-US/',
    ja: '../dist/v3/ja/',
    es: '../dist/v3/es/',
  },
};

readDir(path.join(__dirname, dir.locales.en))
  .then(files => {
    console.log('all-files::', files);
    mainBundleFile = files.find(f => mainBundleRegexp.test(f));

    if (mainBundleFile) {
      let matchHash = mainBundleFile.match(mainBundleRegexp);

      // if it has a hash in it's name, mark it down
      if (matchHash.length > 1 && !!matchHash[1]) {
        mainHash = matchHash[1];
      }
    }

    console.log(`Writing version and hash to ${versionFilePath}`);

    // write current version and hash into the version.json file
    const src = `{"version": "${appVersion}", "hash": "${mainHash}"}`;
    return writeFile(versionFilePath, src);
  }).then(() => {
    if (!mainBundleFile) {
      console.log('post-build terminated - main bundle file not found');
      return;
    }

    console.log(`Replacing hash in the ${mainBundleFile}`);

    return writeMultipleFiles();
  }).catch(err => {
    console.log('Error with post build:', err);
  });

// replace hash placeholder in our main.js file so the code knows it's current hash
function writeMultipleFiles() {
  const writes = [];
  for(let [locale, localeDir] of Object.entries(dir.locales)) {
    console.log(locale);
    const mainFilepath = path.join(__dirname, localeDir, mainBundleFile);
    fs.stat(path.join(__dirname, localeDir), (err, stats) => {
      if (err) {
        console.log('skip non-directory file');
        return;
      }

      readFile(mainFilepath, 'utf8')
        .then(mainFileData => {
          const replacedFile = mainFileData.replace(/{{POST_BUILD_ENTERS_HASH_HERE}}/g, mainHash);
          writes.push(writeFile(mainFilepath, replacedFile));
        });
    });
  }
  return writes;
}
