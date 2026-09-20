const { Transformer } = require('@parcel/plugin');
const SourceMap = require('@parcel/source-map').default;
const { transform } = require('@vue-jsx-vapor/compiler-rs');

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
      const sourceMap = new SourceMap(options.projectRoot);
      const parsedMap = JSON.parse(map);

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
