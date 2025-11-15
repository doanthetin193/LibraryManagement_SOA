# 📘 HƯỚNG DẪN SỬ DỤNG CONSUL - THỰC TẾ

## **🎯 TÓM TẮT**

```
┌──────────────────────────────────────────────────────────────┐
│  CONSUL = "DANH BẠ ĐIỆN THOẠI" CHO CÁC SERVICES             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ KHÔNG CÓ CONSUL:                                         │
│  Gateway: "User Service ở đâu nhỉ?"                         │
│  → Phải hardcode: http://localhost:5001                     │
│  → Service đổi port → phải sửa code Gateway                 │
│                                                              │
│  ✅ CÓ CONSUL:                                               │
│  Gateway: "Consul ơi, User Service ở đâu?"                  │
│  Consul: "Ở http://localhost:5001, đang khỏe mạnh!"         │
│  → Service đổi port → Consul tự cập nhật                    │
│  → Gateway tự động biết địa chỉ mới                         │
└──────────────────────────────────────────────────────────────┘
```

---

## **1️⃣ LUỒNG HOẠT ĐỘNG THỰC TẾ**

### **📍 Bước 1: Khởi động Consul Server**

```powershell
# Terminal 1: Chạy Consul
consul agent -dev

# Kết quả:
# ==> Consul agent running!
# ==> HTTP server listening on 127.0.0.1:8500
```

**🌐 Mở Web UI:** `http://localhost:8500/ui`
- Tab **Services**: Chỉ có "consul" (Consul tự đăng ký)
- Chưa có services nào của bạn!

---

### **📍 Bước 2: User Service Tự Đăng Ký**

**File: `services/user-service/server.js`**

```javascript
const { registerService, setupGracefulShutdown, isConsulAvailable } = require("../../shared/config/consulClient");

const PORT = 5001;
const SERVICE_NAME = "user-service";

app.listen(PORT, async () => {
  console.log(`🚀 User Service running on port ${PORT}`);
  
  // ✅ BƯỚC 1: Kiểm tra Consul có chạy không
  const consulAvailable = await isConsulAvailable();
  
  if (consulAvailable) {
    // ✅ BƯỚC 2: Đăng ký với Consul
    await registerService({
      id: `${SERVICE_NAME}-${PORT}`,        // user-service-5001 (unique ID)
      name: SERVICE_NAME,                    // user-service (để search)
      address: "localhost",
      port: PORT,
      tags: ["user", "authentication"],     // Metadata
      check: {
        http: `http://localhost:${PORT}/health`,
        interval: "10s",                     // Consul ping mỗi 10 giây
        timeout: "5s"
      }
    });
    
    // ✅ BƯỚC 3: Setup tự động deregister khi tắt
    setupGracefulShutdown(`${SERVICE_NAME}-${PORT}`);
    
    console.log("✅ Registered with Consul");
  } else {
    console.warn("⚠️ Consul not available - running standalone");
  }
});
```

**🔄 Điều gì xảy ra:**

```
1. User Service khởi động
   ↓
2. Gọi isConsulAvailable()
   → Consul API: GET /v1/agent/self
   → Response 200 OK
   → Return true
   ↓
3. Gọi registerService()
   → consulClient.js gọi: consul.agent.service.register({...})
   → Consul API: PUT /v1/agent/service/register
   → Consul lưu service vào registry
   ↓
4. Consul bắt đầu Health Check
   → Mỗi 10 giây gọi: GET http://localhost:5001/health
   → Nếu status 200 → "passing" ✅
   → Nếu timeout → "critical" ❌
   ↓
5. Setup graceful shutdown
   → Khi Ctrl+C → deregister → xóa khỏi Consul
```

**🌐 Kiểm tra Consul UI:**
- Reload `http://localhost:8500/ui`
- Tab **Services**: Giờ có 2 services
  - ✅ **consul** (1 instance)
  - ✅ **user-service** (1 instance, passing)

---

### **📍 Bước 3: API Gateway Tìm Service**

**File: `api-gateway/server.js`**

```javascript
const { getServiceUrl } = require("../shared/config/consulClient");
const { createProxyMiddleware } = require("http-proxy-middleware");

// ✅ DYNAMIC PROXY: Tự động tìm service qua Consul
const createDynamicProxy = (serviceName) => {
  return createProxyMiddleware({
    router: async (req) => {
      // 🔍 HỎI CONSUL: "user-service ở đâu?"
      const serviceUrl = await getServiceUrl(serviceName);
      // 📍 CONSUL TRẢ LỜI: "http://localhost:5001"
      return serviceUrl;
    },
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error(`❌ Service ${serviceName} unavailable`);
      res.status(502).json({ message: "Service unavailable" });
    }
  });
};

// Route mọi request /users/* tới user-service
app.use("/users", createDynamicProxy("user-service"));
```

**🔄 Khi client gọi API:**

```
Client: GET http://localhost:5000/users/me
   ↓
API Gateway nhận request
   ↓
Gateway gọi: getServiceUrl("user-service")
   ↓
consulClient.js:
  1. Gọi getService("user-service", true) // chỉ lấy healthy
  2. Consul API: GET /v1/health/service/user-service?passing=true
  3. Consul trả về: [{ address: "localhost", port: 5001, status: "passing" }]
  4. Chọn instance đầu tiên
  5. Return: "http://localhost:5001"
   ↓
Gateway proxy request tới:
   http://localhost:5001/me
   ↓
User Service xử lý và trả response
   ↓
Gateway trả về cho Client
```

---

## **2️⃣ CÁC METHODS TRONG `consulClient.js`**

### **Method 1: `registerService(config)` - ĐĂNG KÝ SERVICE**

```javascript
// Dùng khi: Service khởi động
await registerService({
  id: "user-service-5001",              // ✅ UNIQUE ID (vì có thể chạy nhiều instances)
  name: "user-service",                  // ✅ TÊN để tìm kiếm
  address: "localhost",
  port: 5001,
  tags: ["user", "auth"],                // ✅ Metadata (optional)
  check: {
    http: "http://localhost:5001/health",
    interval: "10s",                     // ✅ Ping mỗi 10 giây
    timeout: "5s"
  }
});

// → Consul lưu service vào registry
// → Consul bắt đầu health check
```

---

### **Method 2: `deregisterService(serviceId)` - HỦY ĐĂNG KÝ**

```javascript
// Dùng khi: Service tắt (thường dùng trong setupGracefulShutdown)
await deregisterService("user-service-5001");

// → Consul xóa service khỏi registry
// → Gateway không còn route tới service này
```

---

### **Method 3: `getService(serviceName, onlyHealthy)` - TÌM INSTANCES**

```javascript
// Lấy danh sách TẤT CẢ instances của user-service
const instances = await getService("user-service", true);
// [
//   {
//     id: "user-service-5001",
//     name: "user-service",
//     address: "localhost",
//     port: 5001,
//     tags: ["user", "auth"],
//     status: "healthy"
//   }
// ]

// Nếu chạy 2 instances:
// [
//   { id: "user-service-5001", port: 5001, status: "healthy" },
//   { id: "user-service-5002", port: 5002, status: "healthy" }
// ]
```

---

### **Method 4: `getAllServices()` - XEM TẤT CẢ SERVICES**

```javascript
const services = await getAllServices();
// {
//   "consul": [],
//   "user-service": [],
//   "book-service": [],
//   "api-gateway": []
// }

console.log(Object.keys(services));
// ['consul', 'user-service', 'book-service', ...]
```

---

### **Method 5: `getServiceUrl(serviceName)` - LẤY URL ⭐ QUAN TRỌNG NHẤT**

```javascript
// Gateway dùng để route dynamic
const url = await getServiceUrl("user-service");
// → "http://localhost:5001"

// Sau đó proxy request tới URL này
```

**🔧 Cách hoạt động:**
1. Gọi `getService("user-service", true)` → lấy instances khỏe mạnh
2. Chọn instance đầu tiên (có thể mở rộng thành load balancing)
3. Ghép thành URL: `http://{address}:{port}`

---

### **Method 6: `setupGracefulShutdown(serviceId)` - TỰ ĐỘNG HỦY ĐĂNG KÝ**

```javascript
// Gọi sau khi registerService() thành công
setupGracefulShutdown("user-service-5001");

// → Khi nhấn Ctrl+C (SIGINT):
//   1. Bắt signal
//   2. Gọi deregisterService("user-service-5001")
//   3. Tắt process

// → Khi systemd/docker stop (SIGTERM):
//   1. Bắt signal
//   2. Deregister
//   3. Tắt process

// → Khi code crash (uncaughtException):
//   1. Bắt exception
//   2. Deregister
//   3. Tắt process
```

---

### **Method 7: `isConsulAvailable()` - KIỂM TRA CONSUL**

```javascript
const available = await isConsulAvailable();

if (available) {
  // Consul đang chạy → đăng ký
  await registerService({...});
} else {
  // Consul không chạy → chạy standalone
  console.warn("Running without Consul");
}
```

---

## **3️⃣ DEMO THỰC TẾ**

### **🧪 Test 1: Service Discovery**

```powershell
# 1. Khởi động Consul
consul agent -dev

# 2. Khởi động User Service
cd backend
npm run dev:user

# Console log:
# 🚀 User Service running on port 5001
# ✅ [Consul] Service registered: user-service (user-service-5001) at localhost:5001
# Health check: http://localhost:5001/health every 10s

# 3. Khởi động API Gateway
npm run dev:gateway

# Console log:
# 🚀 SOA API Gateway started successfully!
# ✅ Features enabled:
#    ✓ Consul Service Discovery

# 4. Gọi API qua Gateway
curl http://localhost:5000/users/me -H "Authorization: Bearer <token>"

# Gateway tự động:
# 1. Hỏi Consul: "user-service ở đâu?"
# 2. Consul trả về: "http://localhost:5001"
# 3. Proxy tới: http://localhost:5001/me
# 4. Trả response về client
```

---

### **🧪 Test 2: Service Down Detection**

```powershell
# 1. Mở Consul UI: http://localhost:8500/ui
# → user-service: passing (màu xanh)

# 2. Tắt User Service (Ctrl+C)
# Console log:
# 🛑 [SIGINT] Shutting down gracefully...
# ✅ Service user-service-5001 deregistered from Consul

# 3. Reload Consul UI
# → user-service: biến mất khỏi danh sách

# 4. Gọi API
curl http://localhost:5000/users/me

# Response:
# {
#   "message": "Service User Service unavailable",
#   "hint": "Service may be down or not registered with Consul"
# }
```

---

### **🧪 Test 3: Dynamic Port Change**

```powershell
# Scenario: User Service đổi port 5001 → 5999

# 1. Sửa .env hoặc code:
USER_PORT=5999

# 2. Khởi động lại User Service
npm run dev:user

# Console log:
# 🚀 User Service running on port 5999
# ✅ [Consul] Service registered: user-service (user-service-5999) at localhost:5999

# 3. Gọi API (KHÔNG CẦN SỬA GATEWAY CODE!)
curl http://localhost:5000/users/me

# Gateway tự động:
# 1. Hỏi Consul: "user-service ở đâu?"
# 2. Consul trả về: "http://localhost:5999" ← Port mới!
# 3. Proxy tới đúng địa chỉ mới
# → ✅ Hoạt động bình thường!
```

---

## **4️⃣ TROUBLESHOOTING**

### **❌ Lỗi: "Consul not available"**

```powershell
# Nguyên nhân: Consul chưa khởi động
# Giải pháp:
consul agent -dev

# Kiểm tra:
curl http://localhost:8500/v1/status/leader
# Response: "127.0.0.1:8300" → Consul đang chạy
```

---

### **❌ Lỗi: "Service already exists"**

```powershell
# Nguyên nhân: Service trước đó chưa deregister
# Giải pháp 1: Deregister thủ công
consul services deregister -id=user-service-5001

# Giải pháp 2: Restart Consul (dev mode mất hết data)
# Ctrl+C để tắt Consul
consul agent -dev
```

---

### **❌ Lỗi: "No healthy instances found"**

```powershell
# Nguyên nhân: Service chưa khởi động hoặc health check fail
# Giải pháp:

# 1. Kiểm tra service có chạy không
curl http://localhost:5001/health
# Phải trả về: { "status": "ok", ... }

# 2. Xem Consul UI
# http://localhost:8500/ui → Services → user-service
# → Nếu màu đỏ (critical) → health check fail

# 3. Kiểm tra logs
# Console của User Service có lỗi gì không?
```

---

## **5️⃣ TỔNG KẾT**

### **✅ CONSUL GIẢI QUYẾT:**

| Vấn đề | Không có Consul | Có Consul |
|--------|----------------|-----------|
| **Tìm service** | Hardcode URL | Dynamic discovery |
| **Service down** | 502 không rõ lý do | Biết chính xác service nào down |
| **Đổi port** | Sửa code nhiều nơi | Tự động cập nhật |
| **Multiple instances** | Config thủ công | Load balance tự động |
| **Monitoring** | Tự code | Web UI + API có sẵn |

### **📂 CẤU TRÚC CODE:**

```
backend/
├── shared/
│   └── config/
│       └── consulClient.js       ← Helper functions (7 methods)
│
├── api-gateway/
│   └── server.js                 ← Dùng getServiceUrl() để route
│
└── services/
    ├── user-service/
    │   └── server.js             ← Dùng registerService() khi khởi động
    ├── book-service/
    │   └── server.js             ← Dùng registerService()
    └── borrow-service/
        └── server.js             ← Dùng registerService()
```

### **🎯 QUY TRÌNH ĐƠN GIẢN:**

1. **Chạy Consul**: `consul agent -dev`
2. **Chạy Services**: Tự động đăng ký qua `registerService()`
3. **Gateway tìm services**: Qua `getServiceUrl()`
4. **Consul health check**: Tự động mỗi 10 giây
5. **Tắt service**: Tự động deregister qua `setupGracefulShutdown()`

