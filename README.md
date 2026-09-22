# Parcel-transformer-Vue-TSX

Parcel transformer for [Vue JSX Vapor compiler][1] output

[![NPM Dependency](https://img.shields.io/librariesio/github/idea2app/Parcel-transformer-Vue-TSX.svg)][2]
[![CI & CD](https://github.com/idea2app/Parcel-transformer-Vue-TSX/actions/workflows/main.yml/badge.svg)][3]

[![NPM](https://nodei.co/npm/parcel-transformer-vue-tsx.png?downloads=true&downloadRank=true&stars=true)][4]

## Installation

```bash
npm i -D parcel @parcel/config-default parcel-transformer-vue-tsx @vue-jsx-vapor/runtime
```

## Usage

Use this as the default option when all TSX files in your project are Vue Vapor TSX:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.tsx": ["parcel-transformer-vue-tsx", "..."]
  }
}
```

If your repository mixes Vue Vapor TSX with other TSX variants (for example React TSX), scope the matcher:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.vapor.tsx": ["parcel-transformer-vue-tsx", "..."]
  }
}
```

To customize the Vue JSX compiler options, add one of these config files to your project root:

- `vue-jsx.config.json`
- `vue-jsx.config.js`
- `vue-jsx.config.cjs`
- `vue-jsx.config.mjs`
- `vue-jsx.config.ts`
- `vue-jsx.config.cts`
- `vue-jsx.config.mts`

Example:

```json
{
  "runtimeModuleName": "@vue-jsx-vapor/runtime",
  "optimize": true,
  "mergeProps": true
}
```

The config file is passed through to `@vue-jsx-vapor/compiler-rs`, so you can use the compiler options documented at https://vuejsx.dev/introduction/options.html.

[1]: https://github.com/vuejs/vue-jsx-vapor
[2]: https://libraries.io/npm/parcel-transformer-vue-tsx
[3]: https://github.com/idea2app/Parcel-transformer-Vue-TSX/actions/workflows/main.yml
[4]: https://npm.im/parcel-transformer-vue-tsx/
