import { readdirSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import test from 'node:test';

const baselineDir = join(__dirname, 'react');
const vaporDir = join(__dirname, 'vue');

test('build output differs from default TSX pipeline and emits source map', () => {
  execSync(
    'pnpm exec parcel build index.vapor.tsx --dist-dir dist --no-cache --no-optimize --log-level error',
    { cwd: vaporDir, stdio: 'inherit' }
  );

  const jsAsset = readdirSync(join(vaporDir, 'dist')).find(name =>
    name.endsWith('.js')
  );
  const sourceMapAsset = readdirSync(join(vaporDir, 'dist')).find(name =>
    name.endsWith('.map')
  );

  assert.ok(jsAsset, 'Parcel should output a JavaScript bundle');
  assert.ok(sourceMapAsset, 'Parcel should output a source map');

  const outputCode = readFileSync(join(vaporDir, 'dist', jsAsset), 'utf8');

  assert.doesNotMatch(
    outputCode,
    /react-jsx-runtime/,
    'Vapor transformer output should not include React JSX runtime modules'
  );
  assert.match(
    readFileSync(join(vaporDir, 'dist', sourceMapAsset), 'utf8'),
    /index\.vapor\.tsx/,
    'Source map should reference the transformed source file'
  );

  execSync(
    'pnpm exec parcel build index.tsx --dist-dir dist --no-cache --no-optimize --log-level error',
    { cwd: baselineDir, stdio: 'inherit' }
  );

  const baselineJsAsset = readdirSync(join(baselineDir, 'dist')).find(name =>
    name.endsWith('.js')
  );

  assert.ok(
    baselineJsAsset,
    'Baseline Parcel build should output a JavaScript bundle'
  );

  const baselineCode = readFileSync(
    join(baselineDir, 'dist', baselineJsAsset),
    'utf8'
  );

  assert.match(
    baselineCode,
    /react-jsx-runtime/,
    'Default TSX pipeline should include React JSX runtime modules'
  );
  assert.notStrictEqual(
    outputCode,
    baselineCode,
    'Vapor transformer output should differ from default TSX output'
  );
});
