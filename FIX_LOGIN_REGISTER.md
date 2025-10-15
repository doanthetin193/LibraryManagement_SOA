# 🔧 VẤN ĐỀ VÀ CÁCH SỬA LOGIN/REGISTER

## 🔴 VẤN ĐỀ PHÁT HIỆN

### Triệu chứng:
- Login/Register không hoạt động từ Frontend
- API trả về lỗi "socket hang up" hoặc connection closed
- Request bị đóng bất ngờ

### Nguyên nhân:
**BUG trong API Gateway** - Phần `onProxyReq` trong `http-proxy-middleware` config

```javascript
// ❌ CODE CŨ (LỖI):
onProxyReq: (proxyReq, req, res) => {
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);  // ❌ Gây conflict với middleware đã xử lý body
  }
}
```

**Vấn đề**: 
- `express.json()` đã parse body thành object
- `http-proxy-middleware` tự động forward body
- Code thủ công `write(bodyData)` gây **duplicate body** → socket hang up

---

## ✅ CÁCH SỬA

### 1. Sửa file `backend/api-gateway/server.js`

**XÓA toàn bộ phần `onProxyReq`** trong function `proxyOptions`:

```javascript
// ✅ CODE MỚI (ĐÚNG):
const proxyOptions = (target, serviceName) => ({
  target,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error(`❌ Gateway Error: ${serviceName} - ${err.message}`);
    res.status(502).json({ 
      success: false,
      message: `Service ${serviceName} unavailable`, 
      error: err.message,
      timestamp: new Date().toISOString()
    });
  },
  // ✅ XÓA onProxyReq - để middleware tự động xử lý
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['x-powered-by'] = 'SOA-Gateway';
    proxyRes.headers['x-gateway-timestamp'] = new Date().toISOString();
  }
});
```

### 2. Restart API Gateway

```bash
# Bước 1: Tắt Gateway hiện tại (Ctrl+C)
# Bước 2: Chạy lại
npm run dev:gateway
```

### 3. Test lại với script

```bash
cd backend
node test-api.js
```

**Kết quả mong đợi:**
```
🧪 Testing Register API...
✅ Register Success: { _id: '...', username: '...', role: 'user', token: '...' }

🧪 Testing Login API...
✅ Login Success: { _id: '...', username: '...', role: 'admin', token: '...' }
```

---

## 🧪 TEST TỪ FRONTEND

### 1. Đảm bảo Frontend đang chạy
```bash
cd frontend
npm run dev
```

### 2. Mở browser: http://localhost:5173

### 3. Test Register:
- Vào trang `/register`
- Nhập username, password, chọn role
- Click "Register"
- Phải chuyển sang `/login` sau 1.5 giây

### 4. Test Login:
- Vào trang `/login`
- Nhập username và password
- Click "Login"
- Phải redirect về trang chủ `/`
- Navbar phải hiển thị username

---

## 📝 LƯU Ý QUAN TRỌNG

### ✅ Các điểm đúng trong code hiện tại:

1. **Frontend axios config** (đúng):
```javascript
const API_GATEWAY_URL = "http://localhost:5000";
export const userAPI = createAPI(`${API_GATEWAY_URL}/users`);
```

2. **Backend routes** (đúng):
```javascript
router.post("/register", registerUser);
router.post("/login", loginUser);
```

3. **Controllers** (đúng):
```javascript
// Register trả về: {_id, username, role, token}
// Login trả về: {_id, username, role, token}
```

4. **AuthContext** (đúng):
```javascript
const login = (data) => {
  setUser(data);
  localStorage.setItem("user", JSON.stringify(data));
};
```

### ⚠️ Điều cần nhớ:

- **Không tự ý ghi body** trong `onProxyReq` khi dùng `express.json()`
- `http-proxy-middleware` tự động forward body từ parsed request
- Chỉ cần config `target` và `changeOrigin: true` là đủ cho hầu hết cases

---

## 🎯 CHECKLIST SAU KHI SỬA

- [ ] Đã xóa phần `onProxyReq` trong Gateway
- [ ] Đã restart API Gateway
- [ ] Test register thành công với `node test-api.js`
- [ ] Test login thành công với `node test-api.js`
- [ ] Frontend register hoạt động (redirect sang /login)
- [ ] Frontend login hoạt động (redirect về /, navbar hiện username)
- [ ] Token được lưu vào localStorage
- [ ] User data được lưu vào localStorage

---

## 🚀 NẾU VẪN CÒN LỖI

### Kiểm tra services có đang chạy:
```bash
# Kiểm tra Gateway
curl http://localhost:5000/health

# Kiểm tra User Service
curl http://localhost:5001/health
```

### Kiểm tra logs:
- Terminal Gateway: Có thông báo request đến không?
- Terminal User Service: Có nhận được request không?
- Browser Console (F12): Có lỗi CORS hoặc Network không?

### Kiểm tra database:
```bash
# Trong MongoDB Compass hoặc Atlas
# Collection: users
# Phải thấy user vừa đăng ký
```

---

## 📞 DEBUG TIPS

### 1. Bật debug mode cho proxy:
```javascript
const proxyOptions = (target, serviceName) => ({
  target,
  changeOrigin: true,
  logLevel: 'debug',  // ✅ Thêm dòng này
  // ...
});
```

### 2. Log request trong Gateway:
```javascript
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});
```

### 3. Test trực tiếp User Service (bypass Gateway):
```bash
# Register trực tiếp
curl -X POST http://localhost:5001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test123","password":"123456","role":"user"}'
```

Nếu test trực tiếp thành công → Vấn đề ở Gateway
Nếu test trực tiếp cũng lỗi → Vấn đề ở User Service

---

**✅ Đã sửa xong! Chúc bạn test thành công!** 🎉
