# 📚 Library Management System - SOA Architecture

> Hệ thống quản lý thư viện được xây dựng theo kiến trúc **Service-Oriented Architecture (SOA)** với Express.js, Consul Service Discovery, và MongoDB.

[![Express.js](https://img.shields.io/badge/Express.js-v5.1.0-green.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.18.2-brightgreen.svg)](https://www.mongodb.com/)
[![Consul](https://img.shields.io/badge/Consul-v2.0.1-red.svg)](https://www.consul.io/)
[![React](https://img.shields.io/badge/React-v19.1.1-blue.svg)](https://reactjs.org/)

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [Các tính năng](#-các-tính-năng)
- [API Documentation](#-api-documentation)
- [Đặc điểm kỹ thuật nổi bật](#-đặc-điểm-kỹ-thuật-nổi-bật)
- [Bài học và kinh nghiệm](#-bài-học-và-kinh-nghiệm)

---

## 🎯 Tổng quan

**Library Management System** là một hệ thống quản lý thư viện hoàn chỉnh, được thiết kế theo mô hình **SOA (Service-Oriented Architecture)** để đảm bảo:

- ✅ **Tính độc lập**: Mỗi service tự quản lý logic và có thể deploy riêng
- ✅ **Khả năng mở rộng**: Scale từng service theo nhu cầu thực tế
- ✅ **Dễ bảo trì**: Sửa lỗi một service không ảnh hưởng toàn hệ thống
- ✅ **Tái sử dụng**: Services có thể dùng cho nhiều mục đích khác nhau

### Các chức năng chính:
- 📖 **Quản lý sách**: CRUD operations cho danh mục sách
- 👥 **Quản lý người dùng**: Đăng ký, đăng nhập, phân quyền (User/Admin)
- 📤 **Mượn/Trả sách**: Quản lý giao dịch mượn/trả với race condition protection
- 📊 **Audit Logging**: Ghi lại tất cả hoạt động quan trọng
- 🛡️ **Rate Limiting**: Bảo vệ hệ thống khỏi brute-force và DDoS

---

## 🏗️ Kiến trúc hệ thống

### SOA Architecture Overview

```
┌──────────────┐
│   Client     │ (React Frontend - Port 5173)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│          API Gateway (Port 5000)                 │
│  • Dynamic Routing (Consul)                      │
│  • Rate Limiting (Login/Register/General)        │
│  • CORS & Security                               │
│  • Request Logging                               │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│        Consul Service Registry (Port 8500)       │
│  • Service Discovery                             │
│  • Health Monitoring (10s interval)              │
│  • Load Balancing Ready                          │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│               Business Services                   │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐                │
│  │User Service │  │Book Service │                │
│  │ (Port 5001) │  │ (Port 5002) │                │
│  └─────────────┘  └─────────────┘                │
│                                                   │
│  ┌─────────────┐  ┌─────────────┐                │
│  │   Borrow    │  │   Logging   │                │
│  │   Service   │  │   Service   │                │
│  │ (Port 5003) │  │ (Port 5004) │                │
│  └─────────────┘  └─────────────┘                │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  MongoDB (Shared DB)  │
        │  Collections:         │
        │  • users              │
        │  • books              │
        │  • borrows            │
        │  • logs               │
        └───────────────────────┘
```

### Nguyên tắc SOA được áp dụng:

1. **Loose Coupling**: Services giao tiếp qua API Gateway, không phụ thuộc trực tiếp
2. **Service Autonomy**: Mỗi service tự quản lý logic và lifecycle
3. **Reusability**: User Service được dùng cho auth, admin, và reporting
4. **Discoverability**: Consul Registry giúp services tự tìm thấy nhau
5. **Statelessness**: Mỗi request độc lập, không lưu state giữa các lần gọi
6. **Composability**: Gateway orchestrate nhiều services cho business flow phức tạp

---

## 🔧 Công nghệ sử dụng

### Backend Stack

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Node.js** | v18+ | Runtime environment |
| **Express.js** | v5.1.0 | Web framework cho services |
| **MongoDB** | v8.18.2 | NoSQL database (shared DB pattern) |
| **Mongoose** | v8.18.2 | ODM cho MongoDB |
| **Consul** | v2.0.1 | Service discovery & health monitoring |
| **JWT** | v9.0.2 | Authentication token |
| **bcryptjs** | v3.0.2 | Password hashing |
| **express-rate-limit** | v8.2.0 | API rate limiting |
| **http-proxy-middleware** | v3.0.5 | Dynamic proxy cho Gateway |
| **axios** | v1.12.2 | HTTP client (service-to-service) |

### Frontend Stack

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **React** | v19.1.1 | UI framework |
| **Material-UI** | v7.3.4 | Component library |
| **React Router** | v7.9.3 | Client-side routing |
| **Vite** | v5.0.4 | Build tool & dev server |
| **Axios** | v1.12.2 | HTTP client |

### DevOps Tools

- **Nodemon** v3.1.10 - Hot reload cho development
- **Concurrently** v9.2.1 - Chạy multi-service đồng thời
- **dotenv** v17.2.2 - Environment variables

---

## 📁 Cấu trúc thư mục

```
LibraryManagement/
│
├── backend/
│   ├── api-gateway/
│   │   └── server.js              # API Gateway chính
│   │
│   ├── services/
│   │   ├── user-service/
│   │   │   ├── controllers/       # Business logic
│   │   │   ├── models/            # User schema
│   │   │   ├── routes/            # API routes
│   │   │   └── server.js          # Service entry point
│   │   │
│   │   ├── book-service/
│   │   │   ├── controllers/       # CRUD operations
│   │   │   ├── models/            # Book schema
│   │   │   ├── routes/
│   │   │   └── server.js
│   │   │
│   │   ├── borrow-service/
│   │   │   ├── controllers/       # Borrow/Return logic
│   │   │   ├── models/            # Borrow schema
│   │   │   ├── routes/
│   │   │   ├── helpers/
│   │   │   │   └── serviceClient.js  # Service-to-service calls
│   │   │   └── server.js
│   │   │
│   │   └── logging-service/
│   │       ├── controllers/       # Centralized logging
│   │       ├── models/            # Log schema
│   │       ├── routes/
│   │       └── server.js
│   │
│   ├── shared/                    # 🔄 Shared Components (DRY)
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── consulClient.js    # Consul integration
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js  # JWT verification
│   │   │   └── errorHandler.js    # Error handling
│   │   └── utils/
│   │       ├── generateToken.js   # JWT generator
│   │       └── logger.js          # Logging utility
│   │
│   ├── scripts/
│   │   └── health-check.js        # Health check all services
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── context/               # Auth context
│   │   ├── api/                   # Axios config
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- **Node.js**: v18 trở lên
- **MongoDB**: v6.0 trở lên (hoặc MongoDB Atlas)
- **Consul**: v1.15 trở lên
- **npm** hoặc **yarn**

### 1️⃣ Clone repository

```bash
git clone https://github.com/doanthetin193/LibraryManagement_SOA.git
cd LibraryManagement_SOA
```

### 2️⃣ Cài đặt Backend

```bash
cd backend
npm install
```

### 3️⃣ Cấu hình môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/library_management
# hoặc dùng MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/library_management

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Consul
CONSUL_HOST=localhost
CONSUL_PORT=8500

# Services Ports
GATEWAY_PORT=5000
USER_PORT=5001
BOOK_PORT=5002
BORROW_PORT=5003
LOGGING_PORT=5004

# Environment
NODE_ENV=development
```

### 4️⃣ Khởi động Consul

**Trên Windows:**
```powershell
# Download Consul từ https://www.consul.io/downloads
# Extract và chạy:
consul agent -dev
```

**Trên Linux/Mac:**
```bash
consul agent -dev
```

Consul UI: http://localhost:8500

### 5️⃣ Khởi động tất cả services

**Cách 1: Chạy tất cả cùng lúc (Khuyên dùng cho development)**
```bash
npm run dev:all
```

**Cách 2: Chạy từng service riêng**
```bash
# Terminal 1 - API Gateway
npm run dev:gateway

# Terminal 2 - User Service
npm run dev:user

# Terminal 3 - Book Service
npm run dev:book

# Terminal 4 - Borrow Service
npm run dev:borrow

# Terminal 5 - Logging Service
npm run dev:logging
```

### 6️⃣ Cài đặt và chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### 7️⃣ Kiểm tra Health Status

```bash
cd backend
npm run health
```

---

## ✨ Các tính năng

### 👤 User Management
- ✅ Đăng ký tài khoản (Rate limit: 3 requests/giờ)
- ✅ Đăng nhập (Rate limit: 5 requests/15 phút)
- ✅ JWT Authentication
- ✅ Phân quyền: User / Admin
- ✅ Profile management

### 📚 Book Management
- ✅ CRUD operations (Admin only)
- ✅ Tìm kiếm sách
- ✅ Quản lý số lượng sách khả dụng
- ✅ Race condition protection

### 📤 Borrow Management
- ✅ Mượn sách (với atomic operation)
- ✅ Trả sách
- ✅ Xem lịch sử mượn/trả
- ✅ Admin dashboard

### 📊 Logging & Monitoring
- ✅ Centralized logging
- ✅ Audit trail (user actions)
- ✅ Service health monitoring
- ✅ Consul service discovery

### 🛡️ Security Features
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt - 10 rounds)
- ✅ Rate limiting (3-tier)
- ✅ CORS protection
- ✅ Input validation

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

#### Register
```http
POST /users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, default: "user"
}
```

#### Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Book Endpoints

#### Get All Books
```http
GET /books
```

#### Get Book by ID
```http
GET /books/:id
```

#### Create Book (Admin only)
```http
POST /books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "publishedYear": 2008,
  "genre": "Programming",
  "availableCopies": 5
}
```

#### Update Book (Admin only)
```http
PUT /books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Clean Code - Updated",
  "availableCopies": 10
}
```

#### Delete Book (Admin only)
```http
DELETE /books/:id
Authorization: Bearer <token>
```

### Borrow Endpoints

#### Borrow Book
```http
POST /borrows
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id_here"
}
```

#### Return Book
```http
PUT /borrows/:id/return
Authorization: Bearer <token>
```

#### Get User's Borrow History
```http
GET /borrows/my
Authorization: Bearer <token>
```

#### Get All Borrows (Admin only)
```http
GET /borrows
Authorization: Bearer <token>
```

### Logging Endpoints

#### Get All Logs (Admin only)
```http
GET /logs
Authorization: Bearer <token>
```

---

## 🌟 Đặc điểm kỹ thuật nổi bật

### 1. Dynamic Service Discovery với Consul

**Vấn đề**: Gateway làm sao biết service đang chạy ở port nào?

**Giải pháp**: Consul Service Registry
- Services tự đăng ký khi khởi động
- Health check mỗi 10 giây
- Gateway query Consul để lấy địa chỉ động
- Tự động failover khi service down

```javascript
// Service tự đăng ký
await consul.agent.service.register({
  id: "user-service-5001",
  name: "user-service",
  port: 5001,
  check: {
    http: "http://localhost:5001/health",
    interval: "10s"
  }
});

// Gateway query Consul
const serviceUrl = await getServiceUrl("user-service");
```

**Lợi ích:**
- ✅ Zero configuration
- ✅ Auto load balancing
- ✅ Health-aware routing
- ✅ Zero-downtime deployment

---

### 2. Three-Tier Rate Limiting

**Vấn đề**: Bảo vệ API khỏi brute-force và DDoS

**Giải pháp**: Rate limiting phân tầng theo mức độ rủi ro

| Endpoint | Limit | Lý do |
|----------|-------|-------|
| `/users/register` | 3 requests/giờ | Chống spam tài khoản |
| `/users/login` | 5 requests/15 phút | Chống brute-force |
| API chung | 1000 requests/15 phút | Chống DDoS |

```javascript
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 giờ
  max: 3,
  message: "Quá nhiều lần đăng ký!"
});
```

**Lợi ích:**
- ✅ Bảo mật nhiều lớp
- ✅ Tiết kiệm tài nguyên
- ✅ Ngăn chặn 95% abuse cases

---

### 3. Race Condition Protection - Atomic Operations

**Vấn đề**: 2 người cùng mượn sách cuối cùng → cả 2 thành công?

**Giải pháp**: MongoDB atomic operation với điều kiện

```javascript
// ❌ SAI: Race condition
const book = await Book.findById(id);
book.availableCopies -= 1;
await book.save();

// ✅ ĐÚNG: Atomic operation
const book = await Book.findOneAndUpdate(
  { 
    _id: id, 
    availableCopies: { $gt: 0 }  // Chỉ update nếu còn sách
  },
  { availableCopies: newValue },
  { new: true }
);

if (!book) {
  return res.status(409).json({ 
    message: "Book not available" 
  });
}
```

**Kết quả:**
- User A: ✅ Success (copies: 1 → 0)
- User B: ❌ 409 Conflict

**Lợi ích:**
- ✅ Tránh overselling
- ✅ Data integrity
- ✅ No manual locking

---

### 4. Shared Components - DRY Principle

**Vấn đề**: Code trùng lặp giữa các services

**Giải pháp**: Shared folder với reusable components

```
backend/shared/
├── config/
│   ├── db.js              # MongoDB connection
│   └── consulClient.js    # Consul integration
├── middlewares/
│   ├── authMiddleware.js  # JWT verification
│   └── errorHandler.js    # Error handling
└── utils/
    ├── generateToken.js   # JWT generator
    └── logger.js          # Logging utility
```

**Lợi ích:**
- ✅ Code consistency
- ✅ Easy maintenance
- ✅ Single source of truth
- ✅ Faster development

---

### 5. Graceful Error Handling

**Vấn đề**: Logging Service down → tất cả services crash?

**Giải pháp**: Graceful degradation

```javascript
// ✅ Logging fail → KHÔNG crash service chính
try {
  await sendLog(...);
} catch (error) {
  console.warn('⚠️ Logging failed:', error.message);
  // Service chính vẫn chạy bình thường
}
```

**Nguyên tắc:**
- Critical operations: Throw error
- Auxiliary operations: Silently fail
- Always timeout (3s default)
- Fallback data khi cần

---

## 📚 Bài học và kinh nghiệm

### Những sai lầm ban đầu:
1. ❌ Hardcode service URLs → Khó scale
2. ❌ Không timeout → Service bị treo khi gọi service khác down
3. ❌ Không rollback strategy → Dữ liệu inconsistent
4. ❌ Services gọi trực tiếp nhau → Vi phạm SOA pattern

### Bài học quan trọng:

#### 1. SOA ≠ Microservices
- **Shared Database**: Đơn giản nhưng tạo coupling
- **Centralized Gateway**: Mạnh mẽ nhưng là single point of failure
- **Trade-off**: Đơn giản vs Independence

#### 2. Failure is Normal
- Services sẽ down → Cần timeout, fallback
- Network sẽ lag → Cần health check
- Database có thể chậm → Cần connection pooling

#### 3. Security in Layers
- Gateway: Rate limiting, CORS
- Services: JWT verification
- Database: Proper authorization
- Network: HTTPS (production)

#### 4. Three Pillars
- **Automation**: Concurrently, health checks
- **Monitoring**: Centralized logging
- **Resilience**: Circuit breaker, retry logic

---

## 🔮 Hướng phát triển

### Short-term (1-3 tháng)
- [ ] TypeScript migration
- [ ] Circuit Breaker pattern
- [ ] Distributed tracing (Jaeger)
- [ ] API versioning

### Mid-term (3-6 tháng)
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Redis caching layer
- [ ] Message queue (RabbitMQ)

### Long-term (6-12 tháng)
- [ ] Microservices migration (DB per service)
- [ ] Event-driven architecture
- [ ] GraphQL federation
- [ ] gRPC for internal communication

---

## 👥 Đóng góp

Nhóm 8 - Môn Kiến trúc Hướng Dịch Vụ:
- **Đoàn Thế Tín** - 4551190056
- **Nguyễn Hữu Trường** - 4551190063
- **Nguyễn Hồ Khôi Nguyên** - 4551190039

Giảng viên hướng dẫn: **Võ Thị Mỹ**

---

## 📝 License

MIT License - Tự do sử dụng cho mục đích học tập.

---

## 📧 Liên hệ

- GitHub: [@doanthetin193](https://github.com/doanthetin193)
- Repository: [LibraryManagement_SOA](https://github.com/doanthetin193/LibraryManagement_SOA)

---

## 🙏 Tài liệu tham khảo

- [Express.js Documentation](https://expressjs.com/)
- [HashiCorp Consul Documentation](https://www.consul.io/docs)
- [MongoDB Manual](https://docs.mongodb.com/)
- Service-Oriented Architecture (SOA), Thomas Erl, 2005
- Building Microservices, Sam Newman, O'Reilly Media, 2021
- Node.js Design Patterns, Mario Casciaro, Packt Publishing, 2020

---

**⭐ Nếu project này hữu ích, hãy star repository!**
