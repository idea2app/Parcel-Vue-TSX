# parcel-transformer-vue-tsx-vapor

将 [idea2app/Vue-MobX-Prime-ts#15](https://github.com/idea2app/Vue-MobX-Prime-ts/pull/15) 中的 Parcel TSX 转换器提取为独立 NPM 包。

## 安装

```bash
npm i -D parcel @parcel/config-default parcel-transformer-vue-tsx-vapor @vue-jsx-vapor/runtime
```

## 使用

推荐在项目根目录创建或更新 `.parcelrc`（仅匹配 Vue Vapor 文件）：

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.vapor.tsx": ["parcel-transformer-vue-tsx-vapor", "..."]
  }
}
```

如果项目里的 TSX 全部都是 Vue Vapor，也可以直接使用 `*.tsx` 全量匹配。

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.tsx": ["parcel-transformer-vue-tsx-vapor", "..."]
  }
}
```