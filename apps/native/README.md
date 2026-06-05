# 📱 Hướng dẫn Setup Ứng dụng Native (Expo)

Tài liệu này cung cấp hướng dẫn chi tiết để thiết lập, cấu hình và khởi chạy ứng dụng Native (React Native / Expo) trong hệ sinh thái Sentimeta.

---

## 1. Yêu cầu hệ thống (Prerequisites)

- **Node.js**: >= 18 (Khuyến nghị Node 20).
- **Trình giả lập (Emulator/Simulator)**: 
  - Android: Cài đặt **Android Studio** và tạo máy ảo (AVD).
  - iOS: Cài đặt **Xcode** (chỉ hỗ trợ trên macOS).
- **Thiết bị thật**: Cài đặt ứng dụng **Expo Go** từ App Store hoặc Google Play.

---

## 2. Cài đặt Dependencies

Dự án này sử dụng kiến trúc Monorepo (Turborepo). Việc cài đặt thư viện nên được thực hiện ở thư mục gốc của dự án:

```bash
# Từ thư mục gốc (social-network-2.0)
npm ci
```

---

## 3. Cấu hình Biến Môi Trường (`.env`)

Bạn cần tạo file biến môi trường riêng cho Native App. Tại thư mục `apps/native/`:

```bash
cp .env.example .env
```

### ⚠️ LƯU Ý QUAN TRỌNG VỀ ĐỊA CHỈ API (Localhost)
Khi chạy Backend ở local máy tính của bạn, các thiết bị ảo/thật sẽ hiểu `localhost` theo cách khác nhau. Bạn **bắt buộc** phải thay đổi `EXPO_PUBLIC_API_URL` và `EXPO_PUBLIC_WS_URL` tùy theo thiết bị bạn dùng để test:

1. **Test trên iOS Simulator**:
   Dùng thẳng `localhost`:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
   EXPO_PUBLIC_WS_URL=ws://localhost:3000
   ```

2. **Test trên Android Emulator**:
   Android Emulator có dải mạng nội bộ riêng. Để trỏ về localhost của máy tính, dùng IP `10.0.2.2`:
   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
   EXPO_PUBLIC_WS_URL=ws://10.0.2.2:3000
   ```

3. **Test trên Thiết bị thật (Điện thoại)**:
   Điện thoại và máy tính phải dùng **chung một mạng Wi-Fi**. Dùng địa chỉ IP LAN của máy tính (VD: `192.168.1.x`):
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.x:3000/api/v1
   EXPO_PUBLIC_WS_URL=ws://192.168.1.x:3000
   ```

*Đừng quên điền đầy đủ các key khác cho Clerk và Cloudinary.*

---

## 4. Khởi chạy Ứng dụng

Bạn có thể đứng ở thư mục gốc và chạy thông qua workspaces:

```bash
# Khởi động Expo Metro Bundler
npm run dev --workspace sentimeta-native

# Khởi động và mở trực tiếp máy ảo Android
npm run android --workspace sentimeta-native

# Khởi động và mở trực tiếp máy ảo iOS (Yêu cầu macOS)
npm run ios --workspace sentimeta-native
```

*(Nếu bạn đang đứng ở trong thư mục `apps/native/`, chỉ cần gõ `npm run android` hoặc `npm run ios`).*

---

## 5. Khắc phục lỗi thường gặp (Troubleshooting)

1. **App hiển thị màn hình trắng / Lỗi Network Request Failed**:
   - Backend chưa chạy hoặc chạy sai Port.
   - Sai IP cấu hình trong `.env` (nhớ xem kỹ mục 3).

2. **Lỗi Cache của Metro Bundler**:
   - Khi bạn đổi biến trong `.env` hoặc thay đổi cấu hình sâu, Metro có thể cache lại thông tin cũ. Hãy xóa cache:
   ```bash
   npm run start -- -c
   ```

3. **Lỗi bộ nhớ khi Build APK/Release**:
   - Nếu gặp lỗi `Out of Memory` hoặc `heap out of memory`, hãy chạy lệnh build kèm theo tùy chọn cấp phát thêm RAM cho Node:
   ```bash
   NODE_OPTIONS="--max-old-space-size=8192" npm run build
   ```
