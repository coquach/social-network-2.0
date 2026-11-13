# Sentimeta Native App (`apps/native`)

## Overview
Cross-platform mobile application for Sentimeta built with Expo SDK 55, React Native, Uniwind (Tailwind CSS for React Native), and HeroUI Native. Provides mobile user experiences for personalized newsfeeds, real-time messaging, AI chatbot assistance, emotion intelligence reports, and community groups.

## Interface
- **Application Entry** (`./App.tsx` / `./index.ts`): Expo bootstrap lifecycle with Clerk authentication and deep-link routing.
- **Navigation Flows** (`./navigation`): Stack and Tab navigators for Home Feed, Realtime Chat, AI Assistant, Emotion Trends, Notifications, and Profile Settings.
- **Dependencies & Packages**: Consumes `[shared](../../packages/shared/README.md)`, `[ui](../../packages/ui/README.md)`, and `[typescript-config](../../packages/typescript-config/README.md)`.

## Invariants
- `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL` must point to appropriate host bindings based on execution runtime (`localhost` for iOS Simulator, `10.0.2.2` for Android Emulator, or LAN IP for physical device).
- All API client interactions and domain models must strictly import from `@repo/shared`.
- UI rendering components must preserve React Native platform compatibility.

## Side Effects
- Establishes HTTP and WebSocket connections to Sentimeta backend microservices via API Gateway.
- Persists user tokens, active sessions, and client preferences in device secure storage (Expo SecureStore / AsyncStorage).
- Accesses native device capabilities (camera, media library, push notification permissions).

## Verification
- Run: `npm run typecheck`
- Run: `npm run lint`

---

## 📱 Native App Setup Guide (Expo)

This guide provides detailed setup, configuration, and execution instructions for the Sentimeta Native application (React Native / Expo).

### 1. Prerequisites

- **Node.js**: >= 18 (Node 20 recommended).
- **Emulator / Simulator**: 
  - Android: Install **Android Studio** and create an Android Virtual Device (AVD).
  - iOS: Install **Xcode** (macOS only).
- **Physical Device**: Install the **Expo Go** application from App Store or Google Play.

### 2. Dependency Installation

The project uses Turborepo monorepo architecture. Dependencies should be installed from the root directory:

```bash
# From repository root (social-network-2.0)
npm ci
```

### 3. Environment Variables (`.env`)

Create an environment configuration file for the Native application in `apps/native/`:

```bash
cp .env.example .env
```

#### ⚠️ IMPORTANT NOTICE REGARDING LOCALHOST API ADDRESSES
When running the Backend locally, emulators and physical devices resolve `localhost` differently. You **must** configure `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL` according to your target runtime:

1. **iOS Simulator**:
   Use `localhost` directly:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
   EXPO_PUBLIC_WS_URL=ws://localhost:3000
   ```

2. **Android Emulator**:
   Android emulators run on an internal virtual network. To reach the host computer's localhost, use IP `10.0.2.2`:
   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
   EXPO_PUBLIC_WS_URL=ws://10.0.2.2:3000
   ```

3. **Physical Device (Mobile Phone)**:
   The phone and host computer must be on the **same Wi-Fi network**. Use the computer's local LAN IP (e.g. `192.168.1.x`):
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api/v1
   EXPO_PUBLIC_WS_URL=ws://192.168.1.x:3000
   ```

*Ensure all keys for Clerk and Cloudinary are populated.*

### 4. Running the Application

Execute commands from the root directory using npm workspaces:

```bash
# Start Expo Metro Bundler
npm run dev --workspace sentimeta-native

# Launch Android Emulator directly
npm run android --workspace sentimeta-native

# Launch iOS Simulator directly (macOS required)
npm run ios --workspace sentimeta-native
```

*(If working inside the `apps/native/` folder, run `npm run android` or `npm run ios` directly).*

### 5. Troubleshooting

1. **White screen or Network Request Failed error**:
   - Backend is not running or listening on a different port.
   - Incorrect host IP configuration in `.env` (review section 3).

2. **Metro Bundler Cache Issues**:
   - If changes in `.env` or configurations are not reflecting, clear the Metro cache:
   ```bash
   npm run start -- -c
   ```

3. **Memory Limits during Release / APK Builds**:
   - If you encounter `Out of Memory` or `heap out of memory`, run the build with increased Node.js heap allocation:
   ```bash
   NODE_OPTIONS="--max-old-space-size=8192" npm run build
   ```
