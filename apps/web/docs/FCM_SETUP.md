# Firebase Cloud Messaging (FCM) Setup Guide

This guide explains how to set up Firebase Cloud Messaging for push notifications in the web application.

## Prerequisites

1. A Firebase project ([Create one here](https://console.firebase.google.com/))
2. Web Push certificates configured in Firebase Console

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Add Web App to Firebase Project

1. In Firebase Console, click the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "Social Network Web")
3. Copy the Firebase configuration object

### 3. Generate Web Push Certificate (VAPID Key)

1. In Firebase Console, go to **Project Settings** → **Cloud Messaging**
2. Scroll to **Web Push certificates**
3. Click **Generate key pair**
4. Copy the generated key pair (this is your VAPID key)

### 4. Configure Environment Variables

Update your `.env.local` file with Firebase credentials:

```env
# Firebase Cloud Messaging (Push Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 5. Update Service Worker

**IMPORTANT**: Service Workers run in a separate context and **CANNOT access .env variables**.

The service worker now automatically fetches Firebase config from the API endpoint `/api/firebase-config` during activation. No manual configuration needed!

```javascript
// ✅ Config is fetched automatically from API
// No need to manually edit firebase-messaging-sw.js
```

If you prefer manual configuration, you can edit `public/firebase-messaging-sw.js`, but the dynamic approach is recommended for security and maintainability.

### 6. Install Dependencies

```bash
npm install firebase
```

## Backend Configuration

The notification service needs Firebase Admin SDK credentials:

### Option 1: Service Account File

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save the JSON file securely
4. Set environment variable in backend:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json
```

### Option 2: Environment Variables

Set these in your backend notification service:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Testing Push Notifications

### 1. Grant Permission

When you first load the app (after signing in), the browser will request notification permission. Click **Allow**.

### 2. Verify Token Registration

Open browser console and look for:
```
✅ FCM initialized and token registered
```

### 3. Test Notification

The backend will automatically send push notifications when:
- Someone likes your post
- Someone comments on your post
- Someone sends you a friend request
- etc.

### 4. Check Foreground Notifications

When the app is open, you should see:
```
📩 Foreground message received: { ... }
🔔 New notification received: { ... }
```

### 5. Check Background Notifications

When the app is closed or in the background, notifications will appear as system notifications.

## Troubleshooting

### "Notifications not supported in this browser"

- FCM requires a modern browser (Chrome, Firefox, Edge, Safari 16.4+)
- Check if notifications are enabled in browser settings

### "No FCM token available"

- Verify Firebase config is correct in `.env.local`
- Check that VAPID key is properly set
- Ensure user granted notification permission

### "Failed to register FCM token"

- Check network connection to backend
- Verify backend endpoints are working (`/notifications/device-tokens`)
- Check browser console for detailed errors

### Service Worker Not Registering

- Ensure `firebase-messaging-sw.js` is in the `/public` folder
- Service workers require HTTPS (except on localhost)
- Check browser console for service worker errors

### Background Notifications Not Working

- Verify service worker is properly registered
- Check that Firebase config in `firebase-messaging-sw.js` matches your project
- Test with browser extension like "Web Push Tester"

## Browser Support

| Browser | Min Version | Notes |
|---------|------------|-------|
| Chrome | 50+ | Full support |
| Firefox | 44+ | Full support |
| Safari | 16.4+ | iOS 16.4+ required |
| Edge | 17+ | Full support |
| Opera | 37+ | Full support |

## Security Notes

1. **Never commit Firebase credentials** to version control
2. Store service account JSON files securely
3. Use environment variables for all sensitive data
4. Rotate VAPID keys periodically
5. Monitor token usage in Firebase Console

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Firebase Console](https://console.firebase.google.com/)
