const { Transformer } = require('@parcel/plugin');
const { transform } = require('@vue-jsx-vapor/compiler-rs');

function loadSourceMap() {
  try {
    return require('@parcel/source-map').default;
  } catch {
    const parcelPackagePath = require.resolve('parcel/package.json');
    const sourceMapPath = require.resolve('@parcel/source-map', {
      paths: [parcelPackagePath]
    });

    return require(sourceMapPath).default;
  }
}

const SourceMap = loadSourceMap();

module.exports = new Transformer({
  async transform({ asset, options }) {
    asset.invalidateOnFileChange(__filename);

    const source = await asset.getCode();
    const sourceMapEnabled = Boolean(asset.env.sourceMap);
    const { code, map } = transform(source, {
      filename: asset.filePath,
      sourceMap: sourceMapEnabled,
      interop: true,
      hmr: options.mode === 'development',
      runtimeModuleName: '@vue-jsx-vapor/runtime'
    });

    asset.type = 'js';
    asset.setCode(code);

    if (sourceMapEnabled && map) {
      let sourceMap;

      try {
        sourceMap = new SourceMap({ projectRoot: options.projectRoot });
      } catch {
        sourceMap = new SourceMap(options.projectRoot);
      }
      const parsedMap = typeof map === 'string' ? JSON.parse(map) : map;

      sourceMap.addVLQMap(parsedMap);

      if (Array.isArray(parsedMap.sources)) {
        const mappedSource = parsedMap.sources.find(sourceName => typeof sourceName === 'string');

        if (mappedSource) {
          sourceMap.setSourceContent(mappedSource, source);
        }
      }

      asset.setMap(sourceMap);
    }

    return [asset];
  }
});
