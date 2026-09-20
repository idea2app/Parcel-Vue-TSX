# parcel-transformer-vue-tsx-vapor

将 [idea2app/Vue-MobX-Prime-ts#15](https://github.com/idea2app/Vue-MobX-Prime-ts/pull/15) 中的 Parcel TSX 转换器提取为独立 NPM 包。

## 安装

```bash
npm i -D parcel-transformer-vue-tsx-vapor @vue-jsx-vapor/runtime
```

## 使用

在项目根目录创建或更新 `.parcelrc`：

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.tsx": ["parcel-transformer-vue-tsx-vapor", "..."]
  }
}
```

> 仅在项目里的 `*.tsx` 文件都是 **Vue TSX + Vapor** 语法时使用上面的全局配置。  
> 如果仓库中还有 React/其他 TSX，请改为只对 Vue Vapor 文件模式单独配置，避免覆盖其它 TSX 转换流程。