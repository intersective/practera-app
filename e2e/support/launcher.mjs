import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const required = ['APP_TEST_TOKEN', 'APP_TEST_PROGRAM_NAME', 'APP_TEST_ACTIVITY_NAME', 'APP_TEST_TOPIC_NAME', 'APP_TEST_ASSESSMENT_NAME'];
export function run(command, args = [], source = process.env) {
  if (command === 'sandbox' && args.length) throw new Error('Sandbox smoke does not accept command-line overrides; capture and reporters must stay disabled.');
  if (command === 'sandbox-check' || command === 'sandbox') {
    const missing = required.filter(key => !source[key]?.trim());
    if (missing.length) throw new Error(`Sandbox smoke needs ${missing.join(', ')}. Supply a fresh dedicated learner token and names; never put secrets in source files.`);
    if (command === 'sandbox-check') return;
  }
  const commands = new Set(['doctor', 'install', 'browsers', 'unit', 'lint', 'build', 'serve', 'mocked', 'repeat', 'headed', 'report', 'typecheck', 'sandbox', 'sandbox-check', 'privacy']);
  if (!commands.has(command)) throw new Error(`Unknown testing command: ${command}`);
  if (process.version !== 'v22.23.2') throw new Error(`Use Node 22.23.2 (found ${process.version}). See .node-version.`);
  for (const name of ['tmp', 'npm-cache', 'browsers', 'evidence', 'cache', 'toolchain']) mkdirSync(resolve(root, 'output', name), { recursive: true });
  const env = { ...source, npm_config_cache: resolve(root, 'output/npm-cache'), TMPDIR: resolve(root, 'output/tmp'), TMP: resolve(root, 'output/tmp'), TEMP: resolve(root, 'output/tmp'), XDG_CACHE_HOME: resolve(root, 'output/cache'), PLAYWRIGHT_BROWSERS_PATH: resolve(root, 'output/browsers'), NG_CLI_ANALYTICS: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
  if (command === 'sandbox' || command === 'privacy') {
    delete env.PWDEBUG; delete env.DEBUG;
    env.PLAYWRIGHT_NO_COPY_PROMPT = '1';
  }
  if (['mocked', 'headed', 'repeat'].includes(command)) { env.E2E_SANDBOX = '0'; env.E2E_PRIVACY_PROBE = '0'; }
  function execute(bin, argv, label, sensitive = false) {
    const result = spawnSync(bin, argv, { cwd: root, env, encoding: 'utf8', stdio: sensitive ? 'pipe' : 'inherit' });
    if (sensitive) {
      const output = `${result.stdout || ''}${result.stderr || ''}`.split(env.APP_TEST_TOKEN).join('[redacted]');
      // Live assertion failures may include session credentials other than the supplied token.
      const safe = output.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted-jwt]');
      process.stdout.write(safe);
      writeFileSync(resolve(root, `output/evidence/${command === 'privacy' ? 'privacy' : 'sandbox'}.log`), safe);
    }
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${label} failed (exit ${result.status}).`);
  }
  const npmCLI = resolve(root, 'output/toolchain/node_modules/npm/bin/npm-cli.js');
  if (!existsSync(npmCLI)) throw new Error('Provision npm 11.6.2 in output/toolchain first; see docs/testing/README.md.');
  if (JSON.parse(readFileSync(resolve(dirname(npmCLI), '../package.json'), 'utf8')).version !== '11.6.2') throw new Error('Project-local npm must be 11.6.2.');
  const baselineEnvironment = resolve(root, 'projects/v3/src/environments/environment.ts');
  if (!existsSync(baselineEnvironment)) writeFileSync(baselineEnvironment, readFileSync(resolve(root, 'projects/v3/src/environments/environment.local.ts')));
  const ng = (...argv) => execute(process.execPath, ['node_modules/@angular/cli/bin/ng.js', ...argv], 'Angular');
  const pw = (...argv) => execute(process.execPath, ['node_modules/@playwright/test/cli.js', ...argv], 'Playwright', command === 'sandbox' || command === 'privacy');
  if (command === 'doctor') {
    const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    for (const name of Object.keys({ ...manifest.dependencies, ...manifest.devDependencies })) {
      const installed = JSON.parse(readFileSync(resolve(root, 'node_modules', name, 'package.json'), 'utf8')).version;
      if (lock.packages[`node_modules/${name}`]?.version !== installed) throw new Error(`Lockfile/install mismatch: ${name}`);
    }
    console.log('Node 22.23.2, npm 11.6.2 and direct locked dependencies verified.');
  } else if (command === 'install') {
    execute(process.execPath, [npmCLI, 'ci', '--include=dev', '--no-audit', '--no-fund'], 'npm ci');
  } else if (command === 'browsers') pw('install', 'chromium', 'webkit');
  else if (command === 'unit') {
    process.env.PLAYWRIGHT_BROWSERS_PATH = env.PLAYWRIGHT_BROWSERS_PATH;
    env.CHROME_BIN = createRequire(import.meta.url)('@playwright/test').chromium.executablePath();
    if (!existsSync(env.CHROME_BIN)) throw new Error('Run npm run test:browsers before test:unit; Karma uses the pinned Chromium binary.');
    ng('build', 'request'); ng('test', 'v3', '--no-watch', ...args);
  }
  else if (command === 'lint') ng('lint', 'v3', ...args);
  else if (command === 'build') { ng('build', 'request'); ng('build', 'v3', '-c', 'development', ...args); }
  else if (command === 'serve') { ng('build', 'request'); ng('serve', 'v3', '-c', source.E2E_SANDBOX === '1' ? 'e2e-sandbox' : 'e2e', '--host', '127.0.0.1', '--port', '4300'); }
  else if (command === 'typecheck') execute(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'e2e/tsconfig.json', '--noEmit'], 'E2E typecheck');
  else if (command === 'report') pw('show-report', 'output/playwright-report');
  else if (command === 'sandbox') { env.E2E_SANDBOX = '1'; env.E2E_PRIVACY_PROBE = '0'; pw('test', '--config=e2e/playwright.config.ts', ...args); }
  else if (command === 'privacy') {
    env.E2E_SANDBOX = '1'; env.E2E_PRIVACY_PROBE = '1';
    env.APP_TEST_TOKEN = 'synthetic-live-token-must-not-persist';
    pw('test', '--config=e2e/playwright.config.ts');
    const files = readdirSync(resolve(root, 'output/test-results/privacy'), { recursive: true, withFileTypes: true })
      .filter(file => file.isFile()).map(file => resolve(file.parentPath, file.name));
    files.push(resolve(root, 'output/evidence/privacy.log'));
    for (const file of files) {
      const data = readFileSync(file);
      if (['synthetic-live-token-must-not-persist', 'synthetic-private-learner'].some(value => data.includes(value))) {
        throw new Error(`Privacy probe retained synthetic sensitive data in ${file}`);
      }
    }
    console.log('Synthetic live failure kept page content and credentials out of persisted diagnostics.');
  }
  else if (command === 'repeat') { for (let i = 1; i <= 5; i++) { console.log(`Reliability run ${i}/5`); env.E2E_RUN = String(i); pw('test', '--config=e2e/playwright.config.ts', ...args); } }
  else pw('test', '--config=e2e/playwright.config.ts', ...(command === 'headed' ? ['--headed'] : []), ...args);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(process.argv[2], process.argv.slice(3)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
