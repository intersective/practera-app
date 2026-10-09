/**
 * Public OAuth 2.0 client (Authorization Code + PKCE, RFC 7636) for login-api.
 * The only value that appears in this app's URL is a single-use authorization code.
 */
import { environment } from '@v3/environments/environment';

const CLIENT_ID = 'practera-app';
const STORE_KEY = 'oauth_pkce';

export function loginApiBase(): string {
  const configured = (environment as { loginApiUrl?: string }).loginApiUrl;
  if (configured) return configured.replace(/\/$/, '');
  try {
    const u = new URL(environment.globalLoginUrl);
    if (u.hostname.startsWith('login-app.')) {
      u.hostname = u.hostname.replace(/^login-app\./, 'login-api.');
      return u.origin;
    }
    if (u.hostname.startsWith('login.')) {
      u.hostname = 'api.' + u.hostname.slice('login.'.length);
      return u.origin;
    }
  } catch {
    /* fall through */
  }
  return 'https://api.practera.local';
}

function base64url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

async function s256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

export interface PkceStart {
  stackUuid: string;
  email?: string;
  redirect?: string;
  experienceUuid?: string;
  brandColor?: string;
  brandLogo?: string;
}

/** Leave this origin for login-api /oauth2/authorize. Verifier stays in sessionStorage. */
export async function beginAuthorizationCode(start: PkceStart): Promise<void> {
  const verifier = randomVerifier();
  const state = randomVerifier();
  const challenge = await s256(verifier);
  const redirectUri = `${window.location.origin}/`;
  sessionStorage.setItem(STORE_KEY, JSON.stringify({ verifier, state, redirectUri, ...start }));

  const url = new URL(`${loginApiBase()}/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  url.searchParams.set('stack_uuid', start.stackUuid);
  if (start.email) url.searchParams.set('email', start.email);
  if (start.redirect) url.searchParams.set('redirect', start.redirect);
  if (start.experienceUuid) url.searchParams.set('experienceUuid', start.experienceUuid);
  if (start.brandColor) url.searchParams.set('brandColor', start.brandColor);
  if (start.brandLogo) url.searchParams.set('brandLogo', start.brandLogo);
  window.location.assign(url.toString());
}

/**
 * Trade ?code= for an access token. Returns the token, or null when this page
 * load is not an authorization-code callback.
 */
export async function exchangeAuthorizationCode(code: string, state: string | null): Promise<string | null> {
  const raw = sessionStorage.getItem(STORE_KEY);
  if (!raw || !code) return null;
  sessionStorage.removeItem(STORE_KEY);
  const stored = JSON.parse(raw) as { verifier: string; state: string; redirectUri: string };
  if (!state || stored.state !== state || !stored.verifier) {
    throw new Error('OAuth state mismatch');
  }
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    code_verifier: stored.verifier,
    client_id: CLIENT_ID,
    redirect_uri: stored.redirectUri,
  });
  const res = await fetch(`${loginApiBase()}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || 'Token request failed');
  }
  return json.access_token as string;
}
