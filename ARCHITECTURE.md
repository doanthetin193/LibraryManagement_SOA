# 🏗️ System Architecture Documentation

> Chi tiết về kiến trúc Service-Oriented Architecture (SOA) của Library Management System

---

## 📋 Mục lục

- [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
- [SOA Pattern & Principles](#-soa-pattern--principles)
- [Các thành phần chính](#-các-thành-phần-chính)
- [API Gateway (ESB)](#-api-gateway-esb)
- [Service Registry (Consul)](#-service-registry-consul)
- [Microservices](#-microservices)
- [Shared Database](#-shared-database)
- [Security Architecture](#-security-architecture)
- [Scalability & Performance](#-scalability--performance)
- [Monitoring & Health Check](#-monitoring--health-check)
- [Deployment Architecture](#-deployment-architecture)

---

## 🎯 Tổng quan kiến trúc

Hệ thống được thiết kế theo mô hình **Service-Oriented Architecture (SOA)** với các đặc điểm:

### ✅ Đáp ứng tiêu chí SOA:

1. **Service Independence** - Các service độc lập, có thể deploy riêng
2. **Loose Coupling** - Services giao tiếp qua well-defined interfaces (REST API)
3. **Service Reusability** - Services có thể tái sử dụng
4. **Service Discovery** - Tự động phát hiện services qua Consul
5. **Centralized Management** - API Gateway làm điểm trung tâm
6. **Shared Database** - Pattern SOA với shared data store

### 🏛️ Architectural Pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (SPA)                         │   │
│  │  - Material-UI Components                                 │   │
│  │  - React Router (Client-side routing)                     │   │
│  │  - Axios HTTP Client                                      │   │
│  │  - JWT Token Management                                   │   │
│  └───────────────────┬──────────────────────────────────────┘   │
└────────────────────┬─┴──────────────────────────────────────────┘
                     │ HTTPS/HTTP
                     │
┌────────────────────▼───────────────────────────────────────────┐
│                    SERVICE BUS LAYER                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             API Gateway (ESB Pattern)                     │  │
│  │  - Dynamic Proxy Routing                                  │  │
│  │  - Rate Limiting Protection                               │  │
│  │  - CORS Configuration                                     │  │
│  │  - Request Logging                                        │  │
│  │  - Load Balancing Ready                                   │  │
│  └──┬──────────┬──────────┬──────────┬─────────────────────┘  │
└─────┼──────────┼──────────┼──────────┼────────────────────────┘
      │          │          │          │
      │ ┌────────▼──────────▼──────────▼──────────┐
      │ │    Service Discovery & Registry          │
      │ │           (Consul)                       │
      │ │  - Service Registration                  │
      │ │  - Health Monitoring (10s interval)      │
      │ │  - Service Discovery                     │
      │ │  - Key-Value Store                       │
      │ └──────────────────────────────────────────┘
      │          │          │          │
┌─────▼──────────▼──────────▼──────────▼─────────────────────────┐
│                   BUSINESS LOGIC LAYER                          │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  User   │  │  Book   │  │ Borrow  │  │Logging  │           │
│  │ Service │  │ Service │  │ Service │  │Service  │           │
│  │ :5001   │  │ :5002   │  │ :5003   │  │ :5004   │           │
│  │         │  │         │  │         │  │         │           │
│  │ • Auth  │  │ • CRUD  │  │• Txn    │  │• Audit  │           │
│  │ • User  │  │ • Search│  │• Inter- │  │• Track  │           │
│  │   Mgmt  │  │ • Stock │  │  service│  │• Alert  │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
└───────┼────────────┼────────────┼────────────┼────────────────┘
        │            │            │            │
        │            │            │            │
┌───────▼────────────▼────────────▼────────────▼────────────────┐
│                    DATA LAYER                                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │            MongoDB - libraryDB                         │    │
│  │         (Shared Database - SOA Pattern)                │    │
│  │                                                         │    │
│  │  Collections:                                          │    │
│  │  • users      - User accounts & authentication         │    │
│  │  • books      - Book catalog & inventory               │    │
│  │  • borrows    - Transaction records                    │    │
│  │  • logs       - Audit logs & activities                │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 SOA Pattern & Principles

### 1. **Enterprise Service Bus (ESB) Pattern**

API Gateway đóng vai trò là **ESB** - điểm trung tâm cho tất cả communication:

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     ▼
┌─────────────┐     ┌──────────────┐
│ API Gateway │────▶│   Consul     │
│    (ESB)    │     │ (Discovery)  │
└──────┬──────┘     └──────────────┘
       │
       ├──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼
   Service 1  Service 2  Service 3  Service 4
```

**Lợi ích:**
- ✅ Centralized routing & management
- ✅ Consistent security policies
- ✅ Easy to add/remove services
- ✅ Single entry point for monitoring

### 2. **Service Independence**

Mỗi service:
- Chạy trên port riêng
- Có thể deploy/scale độc lập
- Có business logic riêng biệt
- Không phụ thuộc trực tiếp vào service khác

### 3. **Loose Coupling via REST API**

Services giao tiếp qua:
- **REST API** với JSON
- **Stateless** communication
- **Standard HTTP methods** (GET, POST, PUT, DELETE)

### 4. **Shared Database (SOA Pattern)**

**Lưu ý:** SOA ≠ Microservices
- **SOA**: Shared database cho consistency
- **Microservices**: Database per service cho independence

Hệ thống này sử dụng **SOA pattern** với shared MongoDB database.

---

## 🧩 Các thành phần chính

### System Components Overview:

| Component | Type | Port | Purpose | Technology |
|-----------|------|------|---------|------------|
| **Frontend** | Web UI | 5173 | User interface | React + Material-UI |
| **API Gateway** | ESB | 5000 | Central routing | Express + http-proxy-middleware |
| **Consul** | Service Registry | 8500 | Service discovery | HashiCorp Consul |
| **User Service** | Microservice | 5001 | Authentication & user management | Express + MongoDB |
| **Book Service** | Microservice | 5002 | Book catalog CRUD | Express + MongoDB |
| **Borrow Service** | Microservice | 5003 | Transaction orchestration | Express + MongoDB |
| **Logging Service** | Microservice | 5004 | Audit logging | Express + MongoDB |
| **MongoDB** | Database | 27017 | Data persistence | MongoDB 8.x |

### Communication Flow:

```
1. Client → API Gateway (Port 5000)
2. Gateway → Consul (Query service URL)
3. Consul → Gateway (Return service address)
4. Gateway → Target Service (Proxy request)
5. Service → MongoDB (Data operation)
6. Service → Gateway (Response)
7. Gateway → Client (Final response)
```

---

## 🌐 API Gateway (ESB)

### Responsibilities:

1. **Dynamic Routing** - Route requests to appropriate services
2. **Service Discovery Integration** - Query Consul for service locations
3. **Rate Limiting** - Protect against abuse and DDoS
4. **CORS Handling** - Cross-origin resource sharing
5. **Request Logging** - Track all incoming requests
6. **Error Handling** - Centralized error responses

### Implementation Details:

**File:** `backend/api-gateway/server.js`

#### 1. Dynamic Proxy Configuration

```javascript
const createDynamicProxy = (serviceName, displayName) => {
  return createProxyMiddleware({
    router: async (req) => {
      // Query Consul for healthy service instance
      const serviceUrl = await getServiceUrl(serviceName);
      return serviceUrl;
    },
    changeOrigin: true,
    logLevel: 'warn',
    onError: (err, req, res) => {
      res.status(502).json({ 
        success: false,
        message: `Service ${displayName} unavailable`, 
        error: err.message
      });
    }
  });
};
```

**Key Features:**
- ✅ Async router để query Consul real-time
- ✅ Automatic failover nếu service down
- ✅ Proper error handling với 502 Bad Gateway

#### 2. Rate Limiting Protection

```javascript
// Login endpoint - Prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: "Too many login attempts"
});

// Register endpoint - Prevent spam
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 60 minutes
  max: 3,                     // 3 registrations
  message: "Too many registration attempts"
});

// General API - Prevent DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests
  message: "Too many requests"
});
```

**Protection Levels:**
- 🔐 Login: 5 / 15 min → Brute force protection
- 📝 Register: 3 / 60 min → Spam prevention
- 🌐 API: 100 / 15 min → DDoS protection

#### 3. Route Mapping

```javascript
app.use("/users", createDynamicProxy("user-service", "User Service"));
app.use("/books", createDynamicProxy("book-service", "Book Service"));
app.use("/borrows", createDynamicProxy("borrow-service", "Borrow Service"));
app.use("/logs", createDynamicProxy("logging-service", "Logging Service"));
```

**URL Mapping:**
```
http://localhost:5000/users/*   → User Service (5001)
http://localhost:5000/books/*   → Book Service (5002)
http://localhost:5000/borrows/* → Borrow Service (5003)
http://localhost:5000/logs/*    → Logging Service (5004)
```

#### 4. Health Check Endpoint

```javascript
app.get("/health", async (req, res) => {
  const services = await getAllServices();
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: services
  });
});
```

#### 5. Service Registry Viewer

**Sử dụng Consul Web UI:**
- **URL:** http://localhost:8500/ui
- **Features:**
  - Real-time service monitoring
  - Health checks visualization
  - Service details & tags
  - Auto-refresh every 10s

---

## 🔍 Service Registry (Consul)

### Overview:

**Consul** là service discovery và health monitoring system của HashiCorp.

### Responsibilities:

1. **Service Registration** - Services tự động đăng ký khi khởi động
2. **Health Monitoring** - Check health mỗi 10 giây
3. **Service Discovery** - Gateway query để tìm service URLs
4. **Key-Value Store** - Lưu configuration (optional)
5. **DNS Interface** - Service DNS resolution (optional)

### Architecture:

```
┌──────────────────────────────────────────────────┐
│              Consul Server                        │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │          Service Catalog                    │  │
│  │                                             │  │
│  │  • user-service:                           │  │
│  │    - localhost:5001                        │  │
│  │    - status: passing                       │  │
│  │    - last_check: 2s ago                    │  │
│  │                                             │  │
│  │  • book-service:                           │  │
│  │    - localhost:5002                        │  │
│  │    - status: passing                       │  │
│  │                                             │  │
│  │  • borrow-service:                         │  │
│  │    - localhost:5003                        │  │
│  │    - status: passing                       │  │
│  │                                             │  │
│  │  • logging-service:                        │  │
│  │    - localhost:5004                        │  │
│  │    - status: passing                       │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
         ▲                           │
         │ Register                  │ Query
         │                           ▼
    ┌─────────┐              ┌──────────────┐
    │ Service │              │ API Gateway  │
    └─────────┘              └──────────────┘
```

### Implementation:

**File:** `backend/shared/config/consulClient.js`

#### 1. Service Registration

```javascript
async function registerService(serviceName, servicePort) {
  const serviceId = `${serviceName}-${servicePort}`;
  
  const registration = {
    id: serviceId,
    name: serviceName,
    address: process.env.SERVICE_HOST || 'localhost',
    port: servicePort,
    check: {
      http: `http://localhost:${servicePort}/health`,
      interval: '10s',      // Check every 10 seconds
      timeout: '5s',        // Timeout after 5 seconds
      deregistercriticalserviceafter: '1m'
    },
    tags: [process.env.NODE_ENV || 'development']
  };

  await consul.agent.service.register(registration);
  console.log(`✅ Registered ${serviceName} with Consul`);
}
```

**Key Features:**
- ✅ Unique service ID
- ✅ HTTP health check endpoint
- ✅ Auto-deregister sau 1 phút nếu failed
- ✅ Environment tags

#### 2. Service Discovery

```javascript
async function getServiceUrl(serviceName) {
  const services = await consul.health.service({
    service: serviceName,
    passing: true  // Only healthy services
  });

  if (services.length === 0) {
    throw new Error(`No healthy ${serviceName} found`);
  }

  // Load balancing: Pick random healthy instance
  const service = services[Math.floor(Math.random() * services.length)];
  const { Address, Port } = service.Service;
  
  return `http://${Address}:${Port}`;
}
```

**Features:**
- ✅ Chỉ trả về healthy services
- ✅ Simple load balancing (random)
- ✅ Error handling khi không có service

#### 3. Graceful Shutdown

```javascript
function setupGracefulShutdown(serviceName, servicePort) {
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`📴 ${signal} received, deregistering from Consul...`);
      
      const serviceId = `${serviceName}-${servicePort}`;
      await consul.agent.service.deregister(serviceId);
      
      console.log(`✅ Deregistered successfully`);
      process.exit(0);
    });
  });
}
```

**Purpose:**
- ✅ Clean shutdown
- ✅ Deregister từ Consul trước khi tắt
- ✅ Tránh Gateway route đến dead service

### Consul UI:

Access: **http://localhost:8500**

**Features:**
- 📊 View all registered services
- ❤️ Health status real-time
- 🔍 Service details & tags
- 📈 Service metrics
- ⚙️ Key-Value store management

---

## 🎯 Microservices

### Service Design Principles:

1. **Single Responsibility** - Mỗi service có 1 business domain
2. **Independent Deployment** - Deploy riêng không ảnh hưởng nhau
3. **Own Data Schema** - Mỗi service quản lý collections riêng
4. **RESTful API** - Standard HTTP/JSON interface
5. **Stateless** - Không lưu session state

---

### 1. 👤 User Service (Port 5001)

**Domain:** User management & Authentication

#### Responsibilities:
- User registration với password hashing
- Login với JWT token generation
- User profile management
- Role-based access (Admin/Librarian/User)
- User lookup cho các services khác

#### Endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new user | ❌ |
| POST | `/users/login` | Login & get JWT token | ❌ |
| GET | `/users/me` | Get current user profile | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| GET | `/users` | Get all users (Admin) | ✅ Admin |
| GET | `/users/health` | Health check | ❌ |

#### Data Model:

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  password: String (hashed, required),
  email: String (required),
  role: String (enum: ['user', 'librarian', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Security Features:
- ✅ Password hashing với bcryptjs (10 rounds)
- ✅ JWT token với 7 days expiry
- ✅ Role-based authorization
- ✅ Protected routes với middleware

#### File Structure:
```
user-service/
├── server.js              # Service entry point
├── controllers/
│   └── userController.js  # Business logic
├── models/
│   └── User.js            # Mongoose schema
└── routes/
    └── userRoutes.js      # Route definitions
```

---

### 2. 📚 Book Service (Port 5002)

**Domain:** Book catalog & inventory management

#### Responsibilities:
- CRUD operations cho books
- Search books by title, author, genre
- Manage book inventory (totalCopies, availableCopies)
- Race condition protection khi mượn sách
- Stock status tracking

#### Endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/books` | Get all books | ❌ |
| GET | `/books/:id` | Get book by ID | ❌ |
| POST | `/books` | Create new book | ✅ Admin/Librarian |
| PUT | `/books/:id` | Update book | ✅ Admin/Librarian |
| DELETE | `/books/:id` | Delete book | ✅ Admin |
| PUT | `/books/:id/decrease` | Decrease available copies | ✅ (Internal) |
| PUT | `/books/:id/increase` | Increase available copies | ✅ (Internal) |
| GET | `/books/health` | Health check | ❌ |

#### Data Model:

```javascript
{
  _id: ObjectId,
  title: String (required),
  author: String (required),
  genre: String,
  description: String,
  publishedYear: Number,
  isbn: String (unique),
  totalCopies: Number (default: 1),
  availableCopies: Number (default: 1),
  createdAt: Date,
  updatedAt: Date
}
```

#### Race Condition Protection:

```javascript
// Atomic operation với condition
const book = await Book.findOneAndUpdate(
  { 
    _id: bookId, 
    availableCopies: { $gte: 1 }  // Only if available
  },
  { 
    $inc: { availableCopies: -1 }  // Atomic decrement
  },
  { new: true }
);

if (!book) {
  return res.status(409).json({
    success: false,
    message: "Book not available (race condition prevented)"
  });
}
```

**Protection:**
- ✅ Atomic MongoDB operations
- ✅ Optimistic locking với condition
- ✅ Proper error handling cho race conditions

---

### 3. 🔄 Borrow Service (Port 5003)

**Domain:** Transaction management & Service orchestration

#### Responsibilities:
- Borrow book transactions
- Return book transactions
- Borrow history tracking
- **Service-to-service communication**:
  - Call User Service để verify user
  - Call Book Service để check/update stock
  - Call Logging Service để log activities
- Transaction validation

#### Endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/borrows` | Borrow a book | ✅ |
| GET | `/borrows/my` | Get my borrow history | ✅ |
| GET | `/borrows` | Get all borrows (Admin) | ✅ Admin |
| PUT | `/borrows/:id/return` | Return a book | ✅ |
| GET | `/borrows/health` | Health check | ❌ |

#### Data Model:

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  bookId: ObjectId (ref: 'Book'),
  borrowDate: Date (default: now),
  returnDate: Date (nullable),
  status: String (enum: ['borrowed', 'returned']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Service Orchestration Flow:

**Borrow Book:**
```
1. Client → POST /borrows { bookId }
2. Borrow Service → Verify JWT token
3. Borrow Service → User Service: GET /users/me (verify user exists)
4. Borrow Service → Book Service: GET /books/:id (check availability)
5. Borrow Service → Book Service: PUT /books/:id/decrease (decrease stock)
6. Borrow Service → Create borrow record in DB
7. Borrow Service → Logging Service: POST /logs (log activity)
8. Borrow Service → Client: Success response
```

**Return Book:**
```
1. Client → PUT /borrows/:id/return
2. Borrow Service → Verify ownership
3. Borrow Service → Update borrow status to 'returned'
4. Borrow Service → Book Service: PUT /books/:id/increase (increase stock)
5. Borrow Service → Logging Service: POST /logs (log return)
6. Borrow Service → Client: Success response
```

#### Inter-Service Communication:

**File:** `backend/services/borrow-service/helpers/serviceClient.js`

```javascript
async function getUserById(userId, token) {
  const response = await axios.get(
    `http://localhost:5001/users/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

async function getBookById(bookId) {
  const response = await axios.get(
    `http://localhost:5002/books/${bookId}`
  );
  return response.data;
}

async function updateBookCopies(bookId, action, token) {
  const response = await axios.put(
    `http://localhost:5002/books/${bookId}/${action}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}
```

**Features:**
- ✅ JWT token forwarding
- ✅ Error handling cho service failures
- ✅ Proper HTTP status codes

---

### 4. 📝 Logging Service (Port 5004)

**Domain:** Audit logging & Activity tracking

#### Responsibilities:
- Log user activities
- Log system events
- Admin audit trail
- Error logging
- Performance monitoring (optional)

#### Endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/logs` | Get all logs (paginated) | ✅ Admin |
| POST | `/logs` | Create log entry | ✅ |
| GET | `/logs/health` | Health check | ❌ |

#### Data Model:

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  username: String,
  action: String (e.g., 'BORROW_BOOK', 'RETURN_BOOK'),
  details: String,
  ipAddress: String,
  timestamp: Date (default: now),
  level: String (enum: ['info', 'warning', 'error'])
}
```

#### Log Types:

| Action | Level | Example |
|--------|-------|---------|
| User registered | info | "User john_doe registered" |
| User logged in | info | "User john_doe logged in" |
| Book borrowed | info | "User john_doe borrowed book 'Clean Code'" |
| Book returned | info | "User john_doe returned book 'Clean Code'" |
| Failed login | warning | "Failed login attempt for user admin" |
| Book not available | warning | "Book 'Design Patterns' not available for borrow" |
| Service error | error | "Book Service connection failed" |

---

## 💾 Shared Database

### MongoDB Architecture:

**Database:** `libraryDB`  
**Pattern:** Shared Database (SOA)

#### Collections:

```
libraryDB/
├── users           # User accounts & authentication
├── books           # Book catalog & inventory
├── borrows         # Borrow transactions
└── logs            # Audit logs & activities
```

### Connection Strategy:

**File:** `backend/shared/config/db.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // No deprecated options in Mongoose 8.x
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**Features:**
- ✅ Environment-based configuration
- ✅ Connection error handling
- ✅ Auto-reconnect capability
- ✅ Proper logging

### Data Relationships:

```
users (1) ──────< borrows (N)
                      │
books (1) ──────< borrows (N)
                      │
users (1) ──────< logs (N)
```

**Relationships:**
- One user can have many borrows
- One book can have many borrow records
- One user can have many log entries

### Indexing Strategy:

```javascript
// User Model
username: { type: String, unique: true, index: true }
email: { type: String, unique: true, index: true }

// Book Model
isbn: { type: String, unique: true, index: true }
title: { type: String, index: true }

// Borrow Model
userId: { type: ObjectId, index: true }
bookId: { type: ObjectId, index: true }
status: { type: String, index: true }

// Log Model
userId: { type: ObjectId, index: true }
timestamp: { type: Date, index: true }
action: { type: String, index: true }
```

**Purpose:**
- ✅ Fast lookups by username/email
- ✅ Quick search by book title/ISBN
- ✅ Efficient borrow history queries
- ✅ Fast log filtering

---

## 🔒 Security Architecture

### 1. Authentication Flow:

```
┌──────┐                                    ┌──────────┐
│Client│                                    │  User    │
│      │                                    │ Service  │
└──┬───┘                                    └────┬─────┘
   │                                             │
   │ 1. POST /users/login                        │
   │    { username, password }                   │
   ├────────────────────────────────────────────▶│
   │                                             │
   │                                    2. Verify password
   │                                       (bcrypt.compare)
   │                                             │
   │                                    3. Generate JWT
   │                                       (jwt.sign)
   │                                             │
   │ 4. Return token                             │
   │◀────────────────────────────────────────────┤
   │    { token: "eyJhbGc..." }                  │
   │                                             │
   │ 5. Subsequent requests                      │
   │    Header: Authorization: Bearer <token>    │
   ├────────────────────────────────────────────▶│
   │                                             │
   │                                    6. Verify JWT
   │                                       (jwt.verify)
   │                                             │
   │ 7. Response with user data                  │
   │◀────────────────────────────────────────────┤
   │                                             │
```

### 2. JWT Token Structure:

```javascript
// Payload
{
  id: user._id,
  username: user.username,
  role: user.role,
  iat: 1234567890,  // Issued at
  exp: 1234567890   // Expiry (7 days)
}

// Header
{
  alg: 'HS256',
  typ: 'JWT'
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### 3. Password Security:

```javascript
// Hashing on registration
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Verification on login
const isMatch = await bcrypt.compare(password, user.password);
```

**Security Level:**
- ✅ bcrypt with 10 salt rounds
- ✅ One-way hashing (cannot reverse)
- ✅ Rainbow table resistant

### 4. Role-Based Access Control (RBAC):

```javascript
// Middleware: authMiddleware.js

// Check if user is authenticated
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};

// Check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is librarian or admin
const librarianOrAdmin = (req, res, next) => {
  if (!['librarian', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Librarian access required' });
  }
  next();
};
```

### 5. CORS Configuration:

```javascript
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

**Protection:**
- ✅ Only allowed origins
- ✅ Credentials support
- ✅ Specific methods allowed
- ✅ Header whitelist

### 6. Rate Limiting:

See [API Gateway section](#-api-gateway-esb) for details.

---

## 📈 Scalability & Performance

### Horizontal Scaling Strategy:

```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
       ├──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼
   Gateway 1  Gateway 2  Gateway 3  Gateway 4
       │          │          │          │
       └──────────┴──────────┴──────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
   Consul              MongoDB Replica Set
```

**Scalability Points:**
- ✅ API Gateway: Multiple instances behind load balancer
- ✅ Services: Scale individual services based on load
- ✅ Consul: Consul cluster cho high availability
- ✅ MongoDB: Replica set cho redundancy

### Performance Optimizations:

1. **MongoDB Indexing**
   - Indexed fields: username, email, isbn, title
   - Compound indexes for complex queries

2. **Connection Pooling**
   - Mongoose connection pooling (default 5)
   - Reuse connections across requests

3. **Consul Caching**
   - Cache service URLs (implement if needed)
   - Reduce Consul queries

4. **Rate Limiting**
   - Protect against abuse
   - Fair resource allocation

5. **Stateless Services**
   - No session state
   - Easy to scale horizontally

---

## 🏥 Monitoring & Health Check

### Health Check Endpoints:

Every service exposes `/health` endpoint:

```javascript
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "user-service",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Consul Health Monitoring:

```javascript
check: {
  http: `http://localhost:${servicePort}/health`,
  interval: '10s',      // Check every 10 seconds
  timeout: '5s',        // Timeout after 5 seconds
  deregistercriticalserviceafter: '1m'  // Deregister after 1 minute of failures
}
```

### Monitoring Points:

| Component | Monitor | Alert On |
|-----------|---------|----------|
| **Services** | Health endpoint | Status ≠ healthy |
| **Consul** | Service count | Service count < expected |
| **Gateway** | Response time | Response time > 5s |
| **MongoDB** | Connection status | Disconnected |
| **Logs** | Error logs | Error count spike |

### Health Check Script:

**File:** `backend/scripts/health-check.js`

```bash
npm run health
```

Output:
```
🏥 Checking Gateway health...
✅ API Gateway is healthy

🏥 Checking all services via Consul...
✅ user-service (localhost:5001) - healthy
✅ book-service (localhost:5002) - healthy
✅ borrow-service (localhost:5003) - healthy
✅ logging-service (localhost:5004) - healthy

📊 Summary: 4/4 services healthy
```

---

## 🚀 Deployment Architecture

### Development Environment:

```
localhost:5173  → Frontend (Vite dev server)
localhost:5000  → API Gateway
localhost:5001  → User Service
localhost:5002  → Book Service
localhost:5003  → Borrow Service
localhost:5004  → Logging Service
localhost:8500  → Consul UI
localhost:27017 → MongoDB
```

### Production Deployment (Example):

```
┌─────────────────────────────────────────┐
│           Cloud Load Balancer            │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴────────────┐
    │                        │
    ▼                        ▼
┌─────────┐            ┌─────────┐
│ VM/Pod 1│            │ VM/Pod 2│
│         │            │         │
│ Gateway │            │ Gateway │
│ + All   │            │ + All   │
│ Services│            │ Services│
└────┬────┘            └────┬────┘
     │                      │
     └──────────┬───────────┘
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
    ┌────────┐   ┌──────────┐
    │ Consul │   │ MongoDB  │
    │Cluster │   │ReplicaSet│
    └────────┘   └──────────┘
```

### Deployment Checklist:

- [ ] Environment variables configured
- [ ] MongoDB secured (authentication enabled)
- [ ] Consul secured (ACL enabled)
- [ ] HTTPS/TLS certificates
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented
- [ ] Log aggregation configured
- [ ] CI/CD pipeline ready

### Environment Variables (.env):

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb://username:password@host:27017/libraryDB?authSource=admin

# JWT
JWT_SECRET=super_secure_random_string_at_least_32_characters
JWT_EXPIRE=7d

# Consul
CONSUL_HOST=consul-server
CONSUL_PORT=8500

# Services
SERVICE_HOST=hostname_or_ip
```

---

## 📚 Summary

### Key Architectural Decisions:

1. **SOA over Microservices** - Shared database for data consistency
2. **Consul for Service Discovery** - Auto registration & health monitoring
3. **API Gateway as ESB** - Centralized routing & security
4. **JWT for Authentication** - Stateless, scalable auth
5. **Rate Limiting** - Protection against abuse
6. **REST API** - Standard, well-understood protocol

### Benefits:

- ✅ **Modularity** - Services can evolve independently
- ✅ **Scalability** - Scale services based on demand
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Resilience** - Service failure doesn't crash system
- ✅ **Security** - Layered security with JWT + Rate limiting
- ✅ **Monitoring** - Built-in health checks & discovery

### Trade-offs:

- ⚠️ **Shared Database** - Not as independent as microservices
- ⚠️ **Network Latency** - Inter-service calls add latency
- ⚠️ **Complexity** - More moving parts than monolith
- ⚠️ **Deployment** - Requires coordination

---

## 🔗 Related Documentation:

- [README.md](./README.md) - Project overview & setup
- [DATA_FLOW.md](./DATA_FLOW.md) - Data flow & sequence diagrams

---

<div align="center">

**Built with SOA best practices** 🏗️

</div>
