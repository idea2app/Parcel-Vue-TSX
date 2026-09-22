const { Transformer } = require('@parcel/plugin');
const SourceMap = require('@parcel/source-map').default;
const { transform } = require('@vue-jsx-vapor/compiler-rs');
const { basename } = require('node:path');

const configNames = [
  'vue-jsx.config.json',
  'vue-jsx.config.js',
  'vue-jsx.config.cjs',
  'vue-jsx.config.mjs'
];
const tsConfigNames = [
  'vue-jsx.config.ts',
  'vue-jsx.config.cts',
  'vue-jsx.config.mts'
];

module.exports = new Transformer({
  async loadConfig({ config, options }) {
    const searchPath = config.searchPath;
    const configFile = await config.getConfigFrom(searchPath, configNames);

    if (configFile) return configFile.contents || {};

    const tsConfig = await config.getConfigFrom(searchPath, tsConfigNames, {
      parse: false
    });
    if (!tsConfig) return {};

    config.addDevDependency({
      specifier: tsConfig.filePath,
      resolveFrom: searchPath
    });
    config.invalidateOnStartup();

    const loadedConfig = await options.packageManager.require(
      tsConfig.filePath,
      searchPath
    );

    return loadedConfig.default || loadedConfig;
  },
  async transform({ asset, config, options }) {
    asset.invalidateOnFileChange(__filename);

    const source = await asset.getCode();
    const sourceMapEnabled = Boolean(asset.env.sourceMap);

    const { code, map } = transform(source, {
      filename: asset.filePath,
      sourceMap: sourceMapEnabled,
      interop: true,
      hmr: options.mode === 'development',
      runtimeModuleName: '@vue-jsx-vapor/runtime',
      ...(config || {})
    });

    asset.type = 'js';
    asset.setCode(code);

    if (sourceMapEnabled && map) {
      const sourceMap = new SourceMap(options.projectRoot);

      /** @type {import("@parcel/source-map").VLQMap | undefined} */
      const parsedMap = map && JSON.parse(map);

      if (parsedMap) {
        sourceMap.addVLQMap(parsedMap);

        const { sources, sourcesContent } = parsedMap;

        for (const [index, sourceName] of sources.entries())
          if (typeof sourceName === 'string') {
            const sourceContent =
              sourcesContent && typeof sourcesContent[index] === 'string'
                ? sourcesContent[index]
                : sourceName === asset.filePath ||
                    sourceName === basename(asset.filePath)
                  ? source
                  : null;

            if (sourceContent != null)
              sourceMap.setSourceContent(sourceName, sourceContent);
          }
      }
      asset.setMap(sourceMap);
    }

    return [asset];
  }
});
