#!/usr/bin/env node
/**
 * Locks the p2-sandbox script-src change to the CSP Evaluator finding:
 * https://csp-evaluator.withgoogle.com/
 *
 * The reported error is script-src 'unsafe-inline', plus the host-allowlist
 * warning that asks for 'strict-dynamic' with a nonce or hash.
 * CSP3 ignores 'unsafe-inline' when a nonce is present. 'strict-dynamic'
 * clears the host-allowlist bypass check. 'unsafe-inline', 'self', and
 * https://acsbapp.com stay as fallbacks for older browsers.
 *
 * script-src stays on that Phase 1 value.
 * connect-src is an explicit sandbox list. Wildcards and the Pusher Cloud /
 * amazonaws schemes are not required: realtime is Soketi on
 * socket.p2-sandbox.practera.com, and uploads go to the tus host.
 * cdn.acsbapp.com, ipapi.co, api.hsforms.com, and vimeo.com are calls the
 * app makes. img-src https:, style-src unsafe-inline, and frame-ancestors
 * https://*.practera.com stay because authored images, Ionic style attributes,
 * and unknown embedders are not safe to narrow yet.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const policyPath = path.join(root, 'infrastructure/csp/p2-sandbox-app.csp');
const templatePath = path.join(root, 'serverless-appv3.yml');
const policy = fs.readFileSync(policyPath, 'utf8').trim();
const nonce = 'aabbccddeeff00112233445566778899';

const rendered = policy.replaceAll('__CSP_NONCE__', nonce);
const keptDirectives = [
  "default-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self' https://*.practera.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
];
const connectHosts = [
  'https://core-graphql-api.p2-sandbox.practera.com',
  'https://admin.p2-sandbox.practera.com',
  'https://upload.p2-sandbox.practera.com',
  'https://files.p2-sandbox.practera.com',
  'wss://socket.p2-sandbox.practera.com',
  'https://cdn.acsbapp.com',
  'https://api.hsforms.com',
  'https://ipapi.co',
  'https://vimeo.com',
];

assert.equal(policy.includes('\n'), false);
assert.ok(policy.includes("'nonce-__CSP_NONCE__'"));
assert.ok(rendered.includes(`'nonce-${nonce}'`));
assert.ok(rendered.includes("'strict-dynamic'"));
assert.ok(rendered.includes("'unsafe-inline'"));
assert.ok(rendered.includes("'self'"));
assert.ok(rendered.includes('https://acsbapp.com'));
assert.equal(rendered.includes('unsafe-eval'), false);
for (const directive of keptDirectives) {
  assert.ok(rendered.includes(directive), `sandbox policy dropped a required directive: ${directive}`);
}
const connectSrc = rendered.match(/connect-src ([^;]+)/)[1];
for (const host of connectHosts) {
  assert.ok(connectSrc.includes(host), `connect-src missing ${host}`);
}
assert.equal(connectSrc.includes('*'), false);
assert.equal(rendered.includes('*.pusher.com'), false);
assert.equal(rendered.includes('*.amazonaws.com'), false);
assert.equal(rendered.includes('media-src'), false);
assert.equal(rendered.includes('frame-src'), false);
assert.equal(rendered.includes('form-action'), false);

const scriptSrc = rendered.match(/script-src ([^;]+)/)[1];
assert.ok(scriptSrc.includes(`'nonce-${nonce}'`));
assert.ok(scriptSrc.includes("'strict-dynamic'"));
const hostWithoutStrictDynamic = scriptSrc.includes('https://acsbapp.com') && scriptSrc.includes("'strict-dynamic'");
assert.equal(hostWithoutStrictDynamic, true);

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'app-csp-'));
const tempTemplate = path.join(tempDir, 'serverless.yml');
fs.copyFileSync(templatePath, tempTemplate);
execFileSync(process.execPath, [
  path.join(root, 'scripts/apply-sandbox-csp.cjs'),
  tempTemplate,
  policyPath,
  nonce,
], { stdio: 'inherit' });
const applied = fs.readFileSync(tempTemplate, 'utf8');
assert.ok(applied.includes(`script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'self' https://acsbapp.com`));
assert.equal(applied.includes('__CSP_NONCE__'), false);

const dist = path.join(tempDir, 'dist');
fs.mkdirSync(path.join(dist, 'en-US'), { recursive: true });
fs.writeFileSync(path.join(dist, 'en-US', 'index.html'), [
  '<script>',
  '  window.acsb = true;',
  '</script>',
  '<script src="polyfills.js" type="module"></script>',
  '<script src="main.js" type="module"></script>',
].join('\n'));
execFileSync(process.execPath, [
  path.join(root, 'scripts/inject-csp-nonce.cjs'),
  dist,
  nonce,
], { stdio: 'inherit' });
const html = fs.readFileSync(path.join(dist, 'en-US', 'index.html'), 'utf8');
assert.equal((html.match(new RegExp(`nonce="${nonce}"`, 'g')) || []).length, 3);

const sharedDefault = fs.readFileSync(templatePath, 'utf8');
assert.ok(sharedDefault.includes("script-src 'self' 'unsafe-inline' https://acsbapp.com"));
assert.equal(sharedDefault.includes('strict-dynamic'), false);

console.log('p2-sandbox script-src CSP assertions passed');
