#!/usr/bin/env node
/**
 * Replaces the CloudFront ContentSecurityPolicy value in a Serverless template.
 * Used by the p2-sandbox app workflow so other environments keep the shared default.
 *
 * Usage: node scripts/apply-sandbox-csp.cjs <serverless.yml> <policy-file> <nonce>
 */
const fs = require('fs');

const templatePath = process.argv[2];
const policyPath = process.argv[3];
const nonce = process.argv[4];

if (!templatePath || !policyPath || !nonce || !/^[A-Za-z0-9_-]{16,}$/.test(nonce)) {
  console.error('Usage: node scripts/apply-sandbox-csp.cjs <serverless.yml> <policy-file> <nonce>');
  process.exit(1);
}

let policy = fs.readFileSync(policyPath, 'utf8').trim().replaceAll('__CSP_NONCE__', nonce);
if (!policy || policy.includes('"') || policy.includes('\n') || policy.includes('__CSP_NONCE__')) {
  console.error('CSP policy must be a single line, without double quotes, and with the nonce substituted');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
const pattern = /^([ \t]*ContentSecurityPolicy:[ \t]*)"(.*)"[ \t]*$/m;
if (!pattern.test(template)) {
  console.error(`No ContentSecurityPolicy string found in ${templatePath}`);
  process.exit(1);
}

const updated = template.replace(pattern, `$1"${policy}"`);
if (updated === template) {
  console.error('ContentSecurityPolicy was not updated');
  process.exit(1);
}

fs.writeFileSync(templatePath, updated);
console.log(`Applied sandbox CSP to ${templatePath}`);
