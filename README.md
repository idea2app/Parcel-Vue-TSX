# Parcel-transformer-Vue-TSX

Parcel transformer for Vue TSX Vapor compiler output

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