# Service Worker & Environment Variables

## Vấn đề: Service Worker không access được .env

Service Workers chạy trong **worker context riêng biệt**, hoàn toàn tách biệt khỏi main thread và build process.

### ❌ KHÔNG hoạt động:

```javascript
// firebase-messaging-sw.js
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY; // ❌ undefined
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // ❌ undefined
  projectId: import.meta.env.FIREBASE_PROJECT_ID, // ❌ undefined
};
```

### Tại sao?

```
Build Time (Next.js)
├── .env variables → Injected vào client bundle
├── NEXT_PUBLIC_* → Available trong browser
└── Service Worker → ❌ KHÔNG nhận được variables

Runtime (Browser)
├── Main Thread: window, document, process.env ✅
└── Service Worker: Isolated context ❌
    ├── Không có window
    ├── Không có document
    ├── Không có process.env
    └── Chỉ có self, fetch, cache APIs
```

## Giải pháp đã implement

### ✅ Cách 1: API Endpoint (Recommended)

Service Worker fetch config từ API endpoint khi activate.

#### 1. API Route (`app/api/firebase-config/route.ts`)

```typescript
export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    // ... other configs
  };

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache 1 hour
    },
  });
}
```

**Ưu điểm:**
- ✅ Không cần hard-code config
- ✅ Tự động sync với .env
- ✅ Dễ update (chỉ restart server)
- ✅ Cache config để giảm requests

**Nhược điểm:**
- ⚠️ Cần network request (nhưng chỉ 1 lần và cached)

#### 2. Service Worker fetch config

```javascript
// public/firebase-messaging-sw.js
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    (async () => {
      // Fetch config from API
      const response = await fetch('/api/firebase-config');
      const firebaseConfig = await response.json();
      
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
      messaging = firebase.messaging();
    })()
  );
});
```

### ✅ Cách 2: Message từ Main Thread (Alternative)

Main thread gửi config cho Service Worker qua `postMessage`.

#### Service Worker

```javascript
// Listen for init message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_FIREBASE') {
    const config = event.data.config;
    firebase.initializeApp(config);
  }
});
```

#### Main Thread (FCM Service)

```typescript
// lib/fcm-service.ts
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.ready;
  
  // Send config to service worker
  registration.active?.postMessage({
    type: 'INIT_FIREBASE',
    config: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      // ... có thể access .env từ main thread
    }
  });
}
```

**Ưu điểm:**
- ✅ Không cần API endpoint
- ✅ Instant (không cần network)

**Nhược điểm:**
- ⚠️ Phức tạp hơn
- ⚠️ Phải handle registration state

## Implementation hiện tại

App đang dùng **Cách 1 (API Endpoint)** với fallback sang **Cách 2** nếu cần:

```
Flow:
1. Service Worker activate
2. Fetch /api/firebase-config
3. Initialize Firebase với config này
4. Ready để nhận push notifications
```

## Alternatives khác (Không recommend)

### ❌ Hard-code trong Service Worker

```javascript
// DON'T DO THIS
firebase.initializeApp({
  apiKey: 'AIzaSyAbc123...', // ❌ Hard-coded
  projectId: 'my-project-123', // ❌ Hard-coded
});
```

**Vấn đề:**
- ❌ Khó maintain
- ❌ Phải edit file mỗi khi thay đổi
- ❌ Security risk nếu commit credentials

### ❌ Generate Service Worker khi build

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    // Inject env vào service worker file
    // Rất phức tạp và không reliable
  }
};
```

**Vấn đề:**
- ❌ Quá phức tạp
- ❌ Build time injection không flexible
- ❌ Khó debug

## Best Practices

### ✅ DO:

1. **Dùng API endpoint** để serve config
2. **Cache config** với appropriate TTL
3. **Validate config** trước khi return
4. **Handle errors** gracefully
5. **Test với production build** (service worker chỉ hoạt động với build, không phải dev)

### ❌ DON'T:

1. Hard-code credentials trong service worker
2. Expect `process.env` hoạt động trong service worker
3. Quên cache API response (tránh spam requests)
4. Commit service worker có credentials
5. Test chỉ với `npm run dev` (SW cần build)

## Testing

### Test API endpoint:

```bash
# Start production build
npm run build
npm run start

# Test API
curl http://localhost:3000/api/firebase-config
# Should return: { "apiKey": "...", "projectId": "..." }
```

### Test Service Worker:

```javascript
// Browser console
navigator.serviceWorker.ready.then(reg => {
  console.log('SW ready:', reg);
});

// Check if Firebase initialized
// Trigger test notification
```

## Troubleshooting

### "Cannot read property 'messaging' of undefined"

→ Firebase chưa initialize trong SW  
→ Check API endpoint có return đúng config không

### "Failed to fetch /api/firebase-config"

→ API route chưa được tạo hoặc server chưa chạy  
→ Check `app/api/firebase-config/route.ts` exists

### "Firebase configuration is incomplete"

→ Missing env variables  
→ Check `.env.local` có đủ NEXT_PUBLIC_FIREBASE_* không

### Service Worker không activate

→ Cần build production  
→ `npm run build && npm run start`  
→ Service workers không hoạt động với `npm run dev`

## Kết luận

**Service Workers = Isolated context ≠ Build-time variables**

Giải pháp tốt nhất: **API endpoint** để serve config động, với caching để optimize performance.

Current implementation: ✅ HOÀN CHỈNH và PRODUCTION-READY
