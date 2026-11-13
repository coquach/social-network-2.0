# Packages

## Overview
Shared library packages and cross-cutting toolchain configurations consumed across the Sentimeta client applications (`apps/web` and `apps/native`).

## Subdirectories & Boundaries
- [shared](./shared/README.md) - Platform-agnostic business logic, API services, Zod schemas, Zustand state stores, React Query hooks, and domain types.
- [ui](./ui/README.md) - Cross-platform UI primitives and styled components rendered across web and mobile.
- [typescript-config](./typescript-config/README.md) - Shared TypeScript compiler configuration presets (`base.json`, `nextjs.json`, `react-native-library.json`).
