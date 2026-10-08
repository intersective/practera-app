#!/usr/bin/env node
/**
 * Adds the deploy nonce to every script tag in the built app HTML.
 * CSP3 ignores 'unsafe-inline' once a nonce is present, so parser-inserted
 * scripts must carry the same nonce as script-src.
 *
 * Usage: node scripts/inject-csp-nonce.cjs <dist-dir> <nonce>
 */
const fs = require('fs');
const path = require('path');

const distDir = process.argv[2];
const nonce = process.argv[3];

if (!distDir || !nonce || !/^[A-Za-z0-9_-]{16,}$/.test(nonce)) {
  console.error('Usage: node scripts/inject-csp-nonce.cjs <dist-dir> <nonce>');
  process.exit(1);
}

function indexFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      indexFiles(fullPath, found);
    } else if (entry.name === 'index.html') {
      found.push(fullPath);
    }
  }
  return found;
}

if (!fs.existsSync(distDir)) {
  console.error(`Dist directory not found: ${distDir}`);
  process.exit(1);
}

const files = indexFiles(distDir);
if (files.length === 0) {
  console.error(`No index.html files found under ${distDir}`);
  process.exit(1);
}

for (const filePath of files) {
  const html = fs.readFileSync(filePath, 'utf8');
  let scriptCount = 0;
  const updated = html.replace(/<script\b([^>]*)>/gi, (match, attrs) => {
    scriptCount += 1;
    if (/\snonce\s*=/.test(attrs)) {
      return match;
    }
    return `<script nonce="${nonce}"${attrs}>`;
  });
  if (scriptCount === 0) {
    console.error(`No script tags found in ${filePath}`);
    process.exit(1);
  }
  fs.writeFileSync(filePath, updated);
  console.log(`Added CSP nonce to ${scriptCount} script tag(s) in ${filePath}`);
}
