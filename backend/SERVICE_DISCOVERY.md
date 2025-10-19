# 🔍 Dynamic Service Discovery & Health Monitoring

## 📋 Tổng quan

Hệ thống đã được nâng cấp với **Dynamic Service Discovery** và **Automatic Health Monitoring** đáp ứng các tiêu chí SOA.

---

## ✅ Các tính năng đã cải thiện

### 1. **Dynamic Service Registry** 
**Trước đây**: Hardcoded service URLs, không thể thay đổi khi runtime
**Bây giờ**: 
- ✅ Service Registry động với class `ServiceRegistry`
- ✅ Có thể register/unregister services runtime
- ✅ Mỗi service có metadata: status, lastCheck, failureCount
- ✅ Hỗ trợ service discovery tự động

### 2. **Automatic Health Monitoring**
**Trước đây**: Phải gọi `/health` manually để check
**Bây giờ**:
- ✅ Tự động check health mỗi 60 giây (optimized để giảm console spam)
- ✅ Tự động cập nhật status: `healthy`, `degraded`, `down`, `unknown`
- ✅ Track số lần failure (failureCount)
- ✅ Mark service DOWN sau 3 lần fail liên tiếp
- ✅ Silent mode: Chỉ log khi có thay đổi status (không spam console)

### 3. **Auto-Recovery Detection**
**Trước đây**: Không biết khi service phục hồi
**Bây giờ**:
- ✅ Phát hiện tự động khi service DOWN quay lại
- ✅ Event-driven notifications (service:up, service:down)
- ✅ Console logs rõ ràng về status changes

### 4. **Health-Aware Routing**
**Trước đây**: Vẫn route đến service dù đã DOWN
**Bây giờ**:
- ✅ Gateway biết status của từng service
- ✅ Warning khi route đến service DOWN
- ✅ Có thể implement fallback logic

---

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────┐
│          API Gateway (Port 5000)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │      Service Registry (Singleton)             │  │
│  │  - Dynamic service tracking                   │  │
│  │  - Health status monitoring                   │  │
│  │  - Event-driven notifications                 │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Health Monitoring Loop (Every 60s)                 │
│  ├─→ Check User Service     → Update status         │
│  ├─→ Check Book Service     → Update status         │
│  ├─→ Check Borrow Service   → Update status         │
│  └─→ Check Logging Service  → Update status         │
└─────────────────────────────────────────────────────┘
           ↓         ↓         ↓         ↓
    User Service  Book     Borrow   Logging
     (5001)      (5002)   (5003)    (5004)
```

---

## 📊 Service Status

Mỗi service có các trạng thái:

- 🟢 **healthy**: Service hoạt động bình thường (0 failures)
- 🟡 **degraded**: Service có vấn đề nhẹ (1-2 failures)
- 🔴 **down**: Service không phản hồi (≥3 failures)
- ⚪ **unknown**: Chưa được check lần nào

---

## 🚀 Sử dụng

### 1. Khởi động Gateway với Auto Monitoring

```bash
npm run dev:gateway
```

Output:
```
🚀 SOA API Gateway started successfully!
🔀 Gateway URL: http://localhost:5000

📋 Dynamic Service Registry:
   🔗 /users   → http://localhost:5001 [unknown]
   🔗 /books   → http://localhost:5002 [unknown]
   🔗 /borrows → http://localhost:5003 [unknown]
   🔗 /logs    → http://localhost:5004 [unknown]

✅ Features enabled:
   ✓ Dynamic Service Discovery
   ✓ Automatic Health Monitoring (every 60s)
   ✓ Service Registry API (/registry)
   ✓ Health-aware Routing
   ✓ Auto-recovery Detection
   ✓ Silent Health Checks (reduced console spam)

🏥 Health monitoring is running in background...
```

### 2. Xem Service Registry

```bash
GET http://localhost:5000/registry
```

Response:
```json
{
  "message": "SOA Service Registry",
  "timestamp": "2025-10-19T10:30:00.000Z",
  "statistics": {
    "total": 5,
    "healthy": 4,
    "degraded": 0,
    "down": 1,
    "unknown": 0
  },
  "services": [
    {
      "key": "USER_SERVICE",
      "name": "User Service",
      "url": "http://localhost:5001",
      "port": 5001,
      "status": "healthy",
      "lastCheck": "2025-10-19T10:29:45.000Z",
      "failureCount": 0,
      "healthEndpoint": "http://localhost:5001/health"
    },
    // ... other services
  ]
}
```

### 3. Enhanced Health Check

```bash
GET http://localhost:5000/health
```

Response với registry info:
```json
{
  "gateway": {
    "status": "ok",
    "service": "SOA API Gateway",
    "timestamp": "2025-10-19T10:30:00.000Z",
    "port": 5000
  },
  "registry": {
    "statistics": {
      "total": 5,
      "healthy": 4,
      "degraded": 0,
      "down": 1,
      "unknown": 0
    },
    "monitoring": "automatic",
    "checkInterval": "60s"
  },
  "services": [...],
  "summary": {
    "total": 5,
    "healthy": 4,
    "degraded": 0,
    "down": 1,
    "overall": "degraded"
  }
}
```

---

## 🔔 Event Notifications

Gateway chỉ log khi có thay đổi status (không spam console khi healthy):

### Service Discovery
```
✅ User Service discovered and healthy
✅ Book Service discovered and healthy
```

### Service Degraded
```
🟡 Book Service is degraded (1 failures)
```

### Service DOWN
```
⚠️  ALERT: Book Service is DOWN!
   URL: http://localhost:5002
   Failures: 3
   Will keep monitoring for recovery...
```

### Service Recovery
```
✅ RECOVERY: Book Service is back online!
   URL: http://localhost:5002
```

---

## 🛠️ Cấu hình

Trong `shared/config/services.js`:

```javascript
const registry = new ServiceRegistry();

// Thay đổi tần suất health check (mặc định: 60s)
registry.healthCheckFrequency = 120000; // 120 seconds

// Thay đổi số lần failure tối đa (mặc định: 3)
registry.maxFailures = 5;

// Khởi động monitoring
registry.startHealthMonitoring();

// Dừng monitoring
registry.stopHealthMonitoring();
```

---

## 🎯 Giải quyết các vấn đề SOA

### ❌ Trước đây:
- Không dynamic (phải restart khi thay đổi)
- Không hỗ trợ auto-scaling
- Không có health monitoring tự động

### ✅ Bây giờ:
- ✅ **Dynamic**: Services có thể register/unregister runtime
- ✅ **Auto-scaling ready**: Có thể thêm/xóa service instances động
- ✅ **Auto Health Monitoring**: Check tự động mỗi 30s, không cần manual intervention
- ✅ **Resilient**: Tự động phát hiện và alert khi service DOWN/UP
- ✅ **Event-driven**: Sử dụng EventEmitter để notify status changes

---

## 📈 Lợi ích

1. **Reliability**: Biết được service nào đang hoạt động
2. **Observability**: Real-time monitoring qua `/registry`
3. **Resilience**: Tự động phát hiện failures và recovery
4. **Scalability**: Dễ dàng thêm/bớt services
5. **Developer Experience**: Logs rõ ràng, dễ debug

---

## 🔧 Mở rộng trong tương lai

Có thể nâng cấp thêm:
- Load balancing giữa nhiều instances của cùng 1 service
- Circuit breaker pattern
- Service mesh integration
- Metrics collection (response time, request count)
- Dashboard UI cho Service Registry
- API để register service từ external sources

---

## 📝 Testing

### Test 1: Kiểm tra auto-monitoring
1. Start Gateway: `npm run dev:gateway`
2. Start 1-2 services
3. Quan sát logs - Gateway sẽ tự động detect services (chỉ log lần đầu)
4. Stop 1 service
5. Sau 3 lần check (180s), service sẽ được mark DOWN
6. Start lại service
7. Gateway sẽ tự động detect và mark HEALTHY

**Note**: Logs đã được optimize để chỉ hiển thị khi có thay đổi status, không spam console với health checks thành công.

### Test 2: Service Registry API
```bash
# Xem tất cả services và status
curl http://localhost:5000/registry

# Xem health summary
curl http://localhost:5000/health
```

---

## 🎓 Phù hợp cho Project Giữa Kỳ

- ✅ Không quá phức tạp (không dùng Consul/Eureka)
- ✅ Đủ feature để demo SOA patterns
- ✅ Code dễ hiểu, dễ maintain
- ✅ Chạy ổn định, ít lỗi
- ✅ Có logs rõ ràng để demo
- ✅ Có API để test và demo

**Kết luận**: Đáp ứng đầy đủ yêu cầu SOA cho project demo, vừa đủ phức tạp để thể hiện hiểu biết, nhưng không quá phức tạp gây khó maintain! 🎉
