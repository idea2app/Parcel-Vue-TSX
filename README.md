# parcel-transformer-vue-tsx-vapor

将 [idea2app/Vue-MobX-Prime-ts#15](https://github.com/idea2app/Vue-MobX-Prime-ts/pull/15) 中的 Parcel TSX 转换器提取为独立 NPM 包。

## 安装

```bash
npm i -D @parcel/config-default parcel-transformer-vue-tsx-vapor @vue-jsx-vapor/runtime
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

> 如果项目中混用 React/其他 TSX，可改成 `*.vapor.tsx` 等更窄的模式，只匹配 Vue Vapor 文件。