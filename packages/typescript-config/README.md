# @repo/typescript-config

## Overview
Shared TypeScript configuration package (`@repo/typescript-config`) providing standardized base, Next.js, and React Native compiler options across all monorepo workspaces.

## Interface
- `exports['./base.json']`: Base tsconfig preset with `strict: true`, bundler module resolution, declaration generation, and standard interop settings
- `exports['./nextjs.json']`: Next.js tsconfig preset extending `./base.json` with `jsx: preserve`, incremental builds, `noEmit`, and `target: es5`
- `exports['./react-native-library.json']`: React Native library tsconfig preset extending `./base.json` with `jsx: react`, `target: ESNext`, and `noEmit`

## Invariants
- Base configuration enforces `strict: true` and `moduleResolution: "bundler"`.
- Derived presets (`nextjs.json`, `react-native-library.json`) must extend `./base.json`.
- `node_modules` are excluded from compilation across all configs.
- Derived application and library configs specify `noEmit: true` since bundling and transpilation are handled by downstream bundlers (Metro, Turbopack, Next.js).

## Side Effects
- None at runtime (static configuration package).
- Governs compile-time type checking, JSX emission, and library declaration generation for consuming monorepo workspaces.

## Verification
- Run: `npm run typecheck`
