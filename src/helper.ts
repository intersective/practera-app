/**
 * Given a domain and endpoint string, return a correctly formatted url string
 * e.g.
 * test.practera.com - login => https://test.practera.com/login
 *
 */
export const urlFormatter = (domain: string, endpoint?: string) => {
  // always need http as prefix
  let theDomain = !domain.match(/^http/) ? `https://${domain}` : domain;
  // remove / in suffix
  theDomain = theDomain.replace(/\/$/, '');
  if (!endpoint) {
    return theDomain;
  }
  // always have / in prefix
  let theEndpoint = !endpoint.match(/^\//) ? `/${endpoint}` : endpoint;
  // remove / in suffix
  theEndpoint = theEndpoint.replace(/\/$/, '');
  return `${theDomain}${theEndpoint}`;
};
