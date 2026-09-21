import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import test from 'node:test';

const repositoryRoot = resolve(__dirname, '..');

const readFixture = (name: string) => readFileSync(join(__dirname, name), 'utf8');

test('build output differs from default TSX pipeline and emits source map', () => {
  const fixtureDir = mkdtempSync(join(tmpdir(), 'parcel-vue-tsx-vapor-'));

  try {
    writeFileSync(
      join(fixtureDir, 'package.json'),
      readFixture('vapor.package.json').replace('__LOCAL_PACKAGE_PATH__', `file:${repositoryRoot}`)
    );
    writeFileSync(join(fixtureDir, '.parcelrc'), readFixture('vapor.parcelrc.json'));
    writeFileSync(join(fixtureDir, 'index.vapor.tsx'), readFixture('vapor.index.vapor.tsx'));

    execSync('npm install', { cwd: fixtureDir, stdio: 'inherit' });
    execSync('npx parcel build index.vapor.tsx --dist-dir dist --no-cache --no-optimize --log-level error', {
      cwd: fixtureDir,
      stdio: 'inherit'
    });

    const jsAsset = readdirSync(join(fixtureDir, 'dist')).find(name => name.endsWith('.js'));
    const sourceMapAsset = readdirSync(join(fixtureDir, 'dist')).find(name => name.endsWith('.map'));

    assert.ok(jsAsset, 'Parcel should output a JavaScript bundle');
    assert.ok(sourceMapAsset, 'Parcel should output a source map');

    const outputCode = readFileSync(join(fixtureDir, 'dist', jsAsset), 'utf8');

    assert.doesNotMatch(
      outputCode,
      /react-jsx-runtime/,
      'Vapor transformer output should not include React JSX runtime modules'
    );
    assert.match(
      readFileSync(join(fixtureDir, 'dist', sourceMapAsset), 'utf8'),
      /index\.vapor\.tsx/,
      'Source map should reference the transformed source file'
    );

    const baselineDir = join(fixtureDir, 'baseline');

    mkdirSync(baselineDir);
    writeFileSync(join(baselineDir, 'package.json'), readFixture('baseline.package.json'));
    writeFileSync(join(baselineDir, 'index.tsx'), readFixture('baseline.index.tsx'));

    execSync('npm install', { cwd: baselineDir, stdio: 'inherit' });
    execSync('npx parcel build index.tsx --dist-dir dist --no-cache --no-optimize --log-level error', {
      cwd: baselineDir,
      stdio: 'inherit'
    });

    const baselineJsAsset = readdirSync(join(baselineDir, 'dist')).find(name => name.endsWith('.js'));

    assert.ok(baselineJsAsset, 'Baseline Parcel build should output a JavaScript bundle');

    const baselineCode = readFileSync(join(baselineDir, 'dist', baselineJsAsset), 'utf8');

    assert.match(baselineCode, /react-jsx-runtime/, 'Default TSX pipeline should include React JSX runtime modules');
    assert.notStrictEqual(outputCode, baselineCode, 'Vapor transformer output should differ from default TSX output');
  } finally {
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});
