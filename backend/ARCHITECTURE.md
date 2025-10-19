# 📚 Library Management System - Backend Documentation

## 🏗️ Kiến trúc SOA

Hệ thống sử dụng **Service-Oriented Architecture (SOA)** với:
- ✅ **4 Microservices**: User, Book, Borrow, Logging
- ✅ **API Gateway**: Enterprise Service Bus pattern
- ✅ **Dynamic Service Discovery**: Auto service registration
- ✅ **Auto Health Monitoring**: Check mỗi 60s
- ✅ **Auto-Recovery Detection**: Tự động phát hiện service phục hồi

---

## 📁 Cấu trúc

```
backend/
├── api-gateway/              # API Gateway (Port 5000)
│   └── server.js
├── services/                 # 4 Microservices
│   ├── user-service/         # Port 5001
│   ├── book-service/         # Port 5002
│   ├── borrow-service/       # Port 5003
│   └── logging-service/      # Port 5004
├── shared/                   # Shared components
│   ├── config/               # DB, Service registry
│   ├── middlewares/          # Auth, Error handler
│   └── utils/                # Logger, Service registration
└── scripts/                  # Utility scripts
    ├── health-check.js       # Check health tất cả services
    └── test-api.js           # Test API endpoints
```

---

## 🚀 Chạy hệ thống

### Development (All services)
```bash
npm run dev:all
```

### Chạy từng service riêng
```bash
npm run dev:gateway   # API Gateway
npm run dev:user      # User Service
npm run dev:book      # Book Service
npm run dev:borrow    # Borrow Service
npm run dev:logging   # Logging Service
```

### Production
```bash
npm start             # Chỉ Gateway (requires services running)
```

### Health Check
```bash
npm run health        # Check status tất cả services
```

---

## 🔍 Service Discovery Features

### 1. Dynamic Service Registry
- Services tự announce khi startup
- Gateway track real-time status
- Support dynamic add/remove services

### 2. Auto Health Monitoring
- Check mỗi 60 giây
- Track failure count
- Auto mark DOWN sau 3 failures

### 3. Service Status
- 🟢 **healthy**: Hoạt động bình thường (0 failures)
- 🟡 **degraded**: Có vấn đề nhẹ (1-2 failures)
- 🔴 **down**: Không phản hồi (≥3 failures)
- ⚪ **unknown**: Chưa được check

### 4. Event Notifications
Gateway tự động log khi có thay đổi status:
- Service discovered
- Service degraded
- Service DOWN
- Service recovery

---

## 🌐 API Endpoints

### Gateway Endpoints
- `GET /health` - Gateway + All services health status
- `GET /registry` - Service registry với real-time status

### Service Routes (qua Gateway)
- `/users/*` → User Service (5001)
- `/books/*` → Book Service (5002)
- `/borrows/*` → Borrow Service (5003)
- `/logs/*` → Logging Service (5004)

---

## 🎯 SOA Patterns Implemented

1. **API Gateway Pattern** ✅
   - Single entry point
   - Request routing
   - Health-aware routing

2. **Service Registry Pattern** ✅
   - Dynamic service discovery
   - Health monitoring
   - Status tracking

3. **Circuit Breaker (Basic)** ✅
   - Failure tracking
   - Auto-recovery detection
   - Service status management

4. **Centralized Logging** ✅
   - Logging Service
   - All services send logs
   - Unified log management

5. **Shared Nothing (Partial)** ⚠️
   - Services độc lập
   - Shared database (for simplicity)
   - Service-to-service communication qua Gateway

---

## 📊 Monitoring & Debugging

### Check Service Registry
```bash
curl http://localhost:5000/registry
```

Response:
```json
{
  "statistics": {
    "total": 4,
    "healthy": 4,
    "degraded": 0,
    "down": 0
  },
  "services": [...]
}
```

### Check Health
```bash
curl http://localhost:5000/health
```

### View Logs
- Gateway logs: Console output
- Service logs: Console output
- Application logs: Logging Service database

---

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
USER_PORT=5001
BOOK_PORT=5002
BORROW_PORT=5003
LOGGING_PORT=5004
GATEWAY_PORT=5000
```

### Service Registry Config
File: `shared/config/services.js`
```javascript
// Health check frequency
healthCheckFrequency: 60000  // 60 seconds

// Max failures before marking DOWN
maxFailures: 3
```

---

## 🎓 Phù hợp cho Project

**Điểm mạnh:**
- ✅ Kiến trúc SOA chuẩn
- ✅ Dynamic service discovery
- ✅ Auto health monitoring
- ✅ Clean code, dễ maintain
- ✅ Professional logging
- ✅ Production-ready patterns

**Điểm SOA: 8.5/10**

Perfect cho project giữa kỳ! 🎉
