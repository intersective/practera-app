import path from "path";

export const handler = async (evt, context, cb) => {
  const { request } = evt.Records[0].cf;

  console.log(`Original Uri: ${request.uri}`);

  const uriParts = request.uri.split("/");

  const locale = uriParts.length > 1 ? uriParts[1] : "";
  const locales = ["en-US", "ja", "ms", "es"];
  const lastPartUrl = uriParts[uriParts.length - 1];

  // whitelisted version.json request
  console.log("trailingURL::", lastPartUrl);
  if (lastPartUrl.match(/^version\.json(?:\?t=\d+)?$/) !== null) {
    return cb(null, request);
  }

  if (locale === "" || locale === "index.html" || !locales.includes(locale)) {
    request.uri = "/en-US/index.html";
    console.log("Go to default page and locale.");
    return cb(null, request);
  }

  const fileExt = path.extname(lastPartUrl);
  if (!fileExt) request.uri = `/${locale}/index.html`;

  console.log(`New Uri: ${request.uri}`);
  return cb(null, request);
};
