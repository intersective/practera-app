const path = require('path');

exports.handler = async (evt) => {
  const { request } = evt.Records[0].cf;
  const locales = ["en-US", "ja", "ms", "es"];
  const defaultLocale = "en-US";

  console.log(`Original Uri: ${request.uri}`);

  // backward-compatible rewrite: accept legacy /browser/* requests
  // and normalize them to the locale-root key layout.
  if (request.uri.startsWith('/browser/')) {
    request.uri = request.uri.replace('/browser', '');
  }

  const uriParts = request.uri.split('/');
  const locale = uriParts.length > 1 ? uriParts[1] : '';
  const lastPartUrl = uriParts[uriParts.length - 1];

  // whitelisted version.json request — note: query strings are in request.querystring,
  // not in request.uri, so only the path filename is tested here
  console.log("trailingURL::", lastPartUrl);
  if (lastPartUrl.match(/^version\.json$/) !== null) {
    return request;
  }

  if (locale === '' || locale === 'index.html' || !locales.includes(locale)) {
    request.uri = `/${defaultLocale}/index.html`;
    console.log('go to default page and locale.');
    return request;
  }

  const fileExt = path.extname(lastPartUrl);
  if (!fileExt) {
    request.uri = `/${locale}/index.html`;
  }

  console.log(`New Uri: ${request.uri}`);
  return request;
};
