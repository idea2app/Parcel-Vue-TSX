const { Transformer } = require('@parcel/plugin');
const { transform } = require('@vue-jsx-vapor/compiler-rs');
const { basename, dirname } = require('node:path');

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
      let hostParcelPath;

      try {
        hostParcelPath = require.resolve('@parcel/core/package.json', {
          paths: [options.projectRoot, dirname(asset.filePath)]
        });
      } catch {
        hostParcelPath = require.resolve('parcel/package.json', {
          paths: [options.projectRoot, dirname(asset.filePath)]
        });
      }
      let sourceMapPath;

      try {
        sourceMapPath = require.resolve('@parcel/source-map', {
          paths: [dirname(hostParcelPath)]
        });
      } catch {
        sourceMapPath = require.resolve('@parcel/source-map');
      }

      const SourceMap = require(sourceMapPath).default;
      let sourceMap;

      try {
        sourceMap = new SourceMap({ projectRoot: options.projectRoot });
      } catch {
        sourceMap = new SourceMap(options.projectRoot);
      }
      const parsedMap = typeof map === 'string' ? JSON.parse(map) : map;

      sourceMap.addVLQMap(parsedMap);

      if (Array.isArray(parsedMap.sources))
        for (const [index, sourceName] of parsedMap.sources.entries())
          if (typeof sourceName === 'string') {
            const sourceContent =
              Array.isArray(parsedMap.sourcesContent) && typeof parsedMap.sourcesContent[index] === 'string'
                ? parsedMap.sourcesContent[index]
                : sourceName === asset.filePath || sourceName === basename(asset.filePath)
                  ? source
                  : null;

            if (sourceContent != null)
              sourceMap.setSourceContent(sourceName, sourceContent);
          }

      asset.setMap(sourceMap);
    }

    return [asset];
  }
});
