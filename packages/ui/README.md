# @repo/ui

## Overview
Shared cross-platform UI component library for Sentimeta, providing accessible and responsive component primitives compatible across Next.js Web and Expo React Native applications.

## Interface
- `Button`: Cross-platform button component supporting `text: string` and optional `onClick?: (event: GestureResponderEvent) => void`
- `ButtonProps`: TypeScript interface for button configuration (`text: string`, `onClick?: (event: GestureResponderEvent) => void`)

## Invariants
- Components must rely on cross-platform React Native primitives (`Pressable`, `Text`, `StyleSheet`) to preserve web and mobile rendering parity.
- Component styling must be encapsulated via `StyleSheet.create` or standard theme tokens.

## Side Effects
- Renders DOM elements on web and native views on mobile.
- Dispatches user gesture events through provided `onClick` / `onPress` callbacks.

## Verification
- Run: `npm run typecheck`
