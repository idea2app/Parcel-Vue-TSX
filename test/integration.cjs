const { mkdtempSync, rmSync, writeFileSync } = require('node:fs');
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
          '*.tsx': ['parcel-transformer-vue-tsx-vapor', '...']
        }
      },
      null,
      2
    )
  );

  writeFileSync(join(fixtureDir, 'index.tsx'), 'const view = <div>Hello Vapor TSX</div>;\nconsole.log(view);\n');

  execSync('npm install --silent', { cwd: fixtureDir, stdio: 'inherit' });
  execSync('npx parcel build index.tsx --dist-dir dist --no-cache --log-level error', {
    cwd: fixtureDir,
    stdio: 'inherit'
  });
} finally {
  rmSync(fixtureDir, { recursive: true, force: true });
}
