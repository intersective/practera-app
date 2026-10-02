import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run } from './launcher.mjs';

test('sandbox preflight lists missing variables without revealing credentials', () => {
  assert.throws(() => run('sandbox-check', [], { APP_TEST_TOKEN: 'secret-value' }), error => {
    assert.match(error.message, /APP_TEST_PROGRAM_NAME/);
    assert.doesNotMatch(error.message, /secret-value/);
    return true;
  });
});
test('unknown commands are rejected', () => {
  assert.throws(() => run('unknown', [], {}), /Unknown testing command/);
});
test('live runs reject command-line overrides that could record credentials', () => {
  assert.throws(() => run('sandbox', ['--trace=on'], {}), /Sandbox smoke does not accept/);
});
