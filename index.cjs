const { Transformer } = require('@parcel/plugin');
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
    asset.setCode(
      map
        ? `${code}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(map).toString('base64')}`
        : code
    );

    return [asset];
  }
});
