const { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { execSync } = require('node:child_process');

const fixtureDir = mkdtempSync(join(tmpdir(), 'parcel-vue-tsx-vapor-'));
const repositoryRoot = resolve(__dirname, '..');

try {
  writeFileSync(
    join(fixtureDir, 'package.json'),
    JSON.stringify(
      {
        name: 'parcel-vue-tsx-vapor-fixture',
        private: true,
        devDependencies: {
          '@parcel/config-default': '^2.16.4',
          '@vue-jsx-vapor/runtime': '^3.2.25',
          parcel: '^2.16.4',
          'parcel-transformer-vue-tsx-vapor': `file:${repositoryRoot}`
        }
      },
      null,
      2
    )
  );

  writeFileSync(
    join(fixtureDir, '.parcelrc'),
    JSON.stringify(
      {
        extends: '@parcel/config-default',
        transformers: {
          '*.vapor.tsx': ['parcel-transformer-vue-tsx-vapor', '...']
        }
      },
      null,
      2
    )
  );

  writeFileSync(join(fixtureDir, 'index.vapor.tsx'), 'const view = <div>Hello Vapor TSX</div>;\nconsole.log(view);\n');

  execSync('npm install', { cwd: fixtureDir, stdio: 'inherit' });
  execSync('npx parcel build index.vapor.tsx --dist-dir dist --no-cache --no-optimize --log-level error', {
    cwd: fixtureDir,
    stdio: 'inherit'
  });

  const jsAsset = readdirSync(join(fixtureDir, 'dist')).find(name => name.endsWith('.js'));

  assert.ok(jsAsset, 'Parcel should output a JavaScript bundle');

  const outputCode = readFileSync(join(fixtureDir, 'dist', jsAsset), 'utf8');
  const sourceMapAsset = readdirSync(join(fixtureDir, 'dist')).find(name => name.endsWith('.map'));

  assert.doesNotMatch(outputCode, /React\.createElement/, 'Output should not use default React TSX transform');
  assert.ok(sourceMapAsset, 'Parcel should output a source map');
  assert.match(
    readFileSync(join(fixtureDir, 'dist', sourceMapAsset), 'utf8'),
    /index\.vapor\.tsx/,
    'Source map should reference the transformed source file'
  );

  const baselineDir = join(fixtureDir, 'baseline');

  mkdirSync(baselineDir);
  writeFileSync(
    join(baselineDir, 'package.json'),
    JSON.stringify(
      {
        name: 'parcel-default-tsx-fixture',
        private: true,
        devDependencies: {
          parcel: '^2.16.4'
        }
      },
      null,
      2
    )
  );
  writeFileSync(join(baselineDir, 'index.tsx'), 'const view = <div>Hello Vapor TSX</div>;\nconsole.log(view);\n');

  execSync('npm install', { cwd: baselineDir, stdio: 'inherit' });
  execSync('npx parcel build index.tsx --dist-dir dist --no-cache --no-optimize --log-level error', {
    cwd: baselineDir,
    stdio: 'inherit'
  });

  const baselineJsAsset = readdirSync(join(baselineDir, 'dist')).find(name => name.endsWith('.js'));
  const baselineCode = readFileSync(join(baselineDir, 'dist', baselineJsAsset), 'utf8');

  assert.match(baselineCode, /React\.createElement/, 'Default TSX pipeline should emit React.createElement');
} finally {
  rmSync(fixtureDir, { recursive: true, force: true });
}
