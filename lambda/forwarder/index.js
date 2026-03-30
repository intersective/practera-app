const path = require('path');

exports.handler = async (evt) => {
  const { request } = evt.Records[0].cf;

  console.log(`Original Uri: ${request.uri}`);

  const uriParts = request.uri.split("/");

  const locale = uriParts.length > 1 ? uriParts[1] : "";
  const locales = ["en-US", "ja", "ms", "es"];
  const lastPartUrl = uriParts[uriParts.length - 1];

  // whitelisted version.json request — note: query strings are in request.querystring,
  // not in request.uri, so only the path filename is tested here
  console.log("trailingURL::", lastPartUrl);
  if (lastPartUrl.match(/^version\.json$/) !== null) {
    return request;
  }

  if (locale === "" || locale === "index.html" || !locales.includes(locale)) {
    request.uri = "/en-US/index.html";
    console.log("Go to default page and locale.");
    return request;
  }

  const fileExt = path.extname(lastPartUrl);
  if (!fileExt) {
    request.uri = `/browser/${locale}/index.html`;
  } else if (!request.uri.startsWith('/browser/')) {
    // rewrite static asset paths to match Angular 19+ application builder output
    request.uri = `/browser${request.uri}`;
  }

  console.log(`New Uri: ${request.uri}`);
  return request;
};
