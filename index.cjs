const { Transformer } = require('@parcel/plugin');
const SourceMap = require('@parcel/source-map').default;
const { transform } = require('@vue-jsx-vapor/compiler-rs');
const { basename } = require('node:path');

module.exports = new Transformer({
  async transform({ asset, options }) {
    asset.invalidateOnFileChange(__filename);

    const source = await asset.getCode();
    const sourceMapEnabled = asset.env.sourceMap != null;
    const { code, map } = transform(source, {
      filename: asset.filePath,
      sourceMap: sourceMapEnabled,
      interop: true,
      hmr: options.mode === 'development',
      runtimeModuleName: '@vue-jsx-vapor/runtime'
    });

    asset.type = 'js';
    asset.setCode(code);

    if (map) {
      const sourceMap = new SourceMap(options.projectRoot);
      const parsedMap = JSON.parse(map);

      sourceMap.addVLQMap(parsedMap);

      const mappedSource =
        Array.isArray(parsedMap.sources) &&
        parsedMap.sources.find(
          sourceName =>
            typeof sourceName === 'string' &&
            (sourceName === asset.filePath || sourceName === basename(asset.filePath))
        );

      sourceMap.setSourceContent(mappedSource || asset.filePath, source);

      asset.setMap(sourceMap);
    }

    return [asset];
  }
});
