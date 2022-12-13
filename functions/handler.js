exports.i18nForwarder = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  console.log(request.uri);
  if (request.uri.indexOf("/", 1) < 0) {
    request.uri = "/ms"
  } else {
    request.uri = "/"
  }
  return callback(null, request);
};
