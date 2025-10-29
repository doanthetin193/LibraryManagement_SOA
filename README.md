# 📚 Library Management System - SOA Architecture# 📚 Library Management System - SOA Architecture



> Hệ thống quản lý thư viện với kiến trúc hướng dịch vụ (SOA - Service-Oriented Architecture)Hệ thống quản lý thư viện được xây dựng theo kiến trúc **Service-Oriented Architecture (SOA)** với API Gateway.



![Status](https://img.shields.io/badge/status-production--ready-brightgreen)---

![Architecture](https://img.shields.io/badge/architecture-SOA-blue)

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)## 🏗️ **KIẾN TRÚC SOA**

![MongoDB](https://img.shields.io/badge/mongodb-latest-green)

### **Đặc điểm chính:**

---- ✅ **4 Services độc lập**: User, Book, Borrow, Logging

- ✅ **Database chung**: Tất cả services dùng chung MongoDB `libraryDB`

## 📋 Mục lục- ✅ **API Gateway**: Enterprise Service Bus - routing tất cả requests

- ✅ **Dynamic Service Registry**: Tự code với auto health monitoring

- [Giới thiệu](#-giới-thiệu)- ✅ **Service Communication**: Service-to-service qua Gateway

- [Tính năng chính](#-tính-năng-chính)- ✅ **Auto Health Monitoring**: Tự động check health mỗi 60 giây (silent mode)

- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)- ✅ **Auto-Recovery Detection**: Phát hiện tự động khi service phục hồi

- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)### **Sơ đồ kiến trúc:**

- [Cài đặt & Chạy](#-cài-đặt--chạy)```

- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)Frontend (React)

- [API Documentation](#-api-documentation)       ↓

- [Tài liệu bổ sung](#-tài-liệu-bổ-sung)API Gateway (Port 5000) 

- [Team](#-team)  ├─ Dynamic Service Registry

  ├─ Auto Health Monitoring (60s)

---  └─ Health-aware Routing

       ↓

## 🎯 Giới thiệu   ┌───┴───┬───────┬──────────┐

   ↓       ↓       ↓          ↓

**Library Management System** là hệ thống quản lý thư viện hiện đại được xây dựng theo kiến trúc **SOA (Service-Oriented Architecture)**. Hệ thống giúp quản lý sách, người dùng, mượn trả sách và theo dõi hoạt động một cách hiệu quả.User    Book    Borrow    Logging

5001    5002     5003      5004

### 🌟 Điểm nổi bật:[🟢]    [🟢]    [🟢]      [🟢]

   └───┬───┴───────┴──────────┘

- ✅ **Kiến trúc SOA chuẩn** với API Gateway, Service Registry, và độc lập service       ↓

- ✅ **Microservices** - 4 services độc lập (User, Book, Borrow, Logging)MongoDB (libraryDB - Database chung)

- ✅ **Service Discovery** với Consul - tự động phát hiện và giám sát services```

- ✅ **Rate Limiting** - bảo vệ khỏi tấn công brute force và DDoS

- ✅ **JWT Authentication** - bảo mật với JSON Web Token**Status Icons:**

- ✅ **Role-Based Access Control** - phân quyền Admin, Librarian, User- 🟢 healthy: Service hoạt động bình thường

- ✅ **Real-time Health Monitoring** - giám sát sức khỏe services real-time- 🟡 degraded: Service có vấn đề nhẹ

- ✅ **Race Condition Protection** - bảo vệ khỏi xung đột dữ liệu- 🔴 down: Service không phản hồi

- ✅ **Modern UI** - Giao diện Material-UI responsive và đẹp mắt- ⚪ unknown: Chưa được check



------



## 🚀 Tính năng chính## 📁 **CẤU TRÚC PROJECT**



### 👥 Quản lý người dùng```

- Đăng ký tài khoản với role (User/Librarian/Admin)LibraryManagement/

- Đăng nhập/Đăng xuất với JWT authentication├── backend/

- Xem và chỉnh sửa thông tin cá nhân│   ├── api-gateway/           # API Gateway - ESB

- Phân quyền 3 cấp: Admin, Librarian, User│   │   └── server.js

│   ├── services/              # 4 Services độc lập

### 📖 Quản lý sách│   │   ├── user-service/      # Port 5001

- Thêm, sửa, xóa thông tin sách (Admin/Librarian)│   │   ├── book-service/      # Port 5002

- Tìm kiếm sách theo tên, tác giả, thể loại│   │   ├── borrow-service/    # Port 5003

- Hiển thị trạng thái còn sách/hết sách│   │   └── logging-service/   # Port 5004

- Quản lý số lượng bản sao có sẵn│   ├── shared/                # Shared components

│   │   ├── config/            # DB, Service registry

### 🔄 Mượn/Trả sách│   │   ├── middlewares/       # Auth, Error handler

- Mượn sách với kiểm tra số lượng│   │   └── utils/             # Logger, Token generator

- Xem lịch sử mượn sách cá nhân│   └── scripts/               # Utility scripts

- Trả sách với cập nhật trạng thái│       ├── health-check.js    # Health check tool

- Race condition protection khi nhiều người mượn cùng lúc│       ├── start-system.js    # System startup

│       └── test-api.js        # API testing

### 📊 Dashboard Admin└── frontend/                  # React + Vite

- Thống kê tổng quan (Users, Books, Borrows, Logs)    └── src/

- Quản lý toàn bộ sách trong hệ thống        ├── pages/             # Login, Register, Books, etc.

- Xem logs hoạt động của users        ├── components/        # Navbar, BookCard

- Quản lý giao dịch mượn trả        ├── context/           # AuthContext

        └── api/               # Axios config

### 🔒 Bảo mật```

- JWT Authentication với token expiry

- Password hashing với bcrypt---

- Rate limiting:

  - Login: 5 attempts / 15 minutes## 🚀 **KHỞI ĐỘNG HỆ THỐNG**

  - Register: 3 attempts / 60 minutes

  - API general: 100 requests / 15 minutes### **Yêu cầu:**

- CORS configuration cho security- Node.js v16+

- MongoDB Atlas account (hoặc MongoDB local)

---- npm hoặc yarn



## 🏗️ Kiến trúc hệ thống### **1. Cài đặt dependencies:**



``````bash

┌─────────────────────────────────────────────────────────────┐# Backend

│                         FRONTEND                             │cd backend

│                    (React + Material-UI)                     │npm install

│                      Port: 5173/3000                         │

└────────────────────────┬────────────────────────────────────┘# Frontend

                         │ HTTP Requestscd frontend

                         ↓npm install

┌─────────────────────────────────────────────────────────────┐```

│                      API GATEWAY (ESB)                       │

│                  Dynamic Proxy Routing                       │### **2. Cấu hình môi trường:**

│                Rate Limiting + CORS                          │

│                        Port: 5000                            │Tạo file `backend/.env`:

└──────┬──────────┬──────────┬──────────┬─────────────────────┘```env

       │          │          │          │MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/libraryDB

       ↓          ↓          ↓          ↓JWT_SECRET=your_secret_key

   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐USER_PORT=5001

   │User  │  │Book  │  │Borrow│  │Log   │BOOK_PORT=5002

   │5001  │  │5002  │  │5003  │  │5004  │BORROW_PORT=5003

   └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘LOGGING_PORT=5004

      │         │         │         │GATEWAY_PORT=5000

      └─────────┴─────────┴─────────┘```

                │

                ↓### **3. Khởi động Backend (SOA):**

        ┌───────────────┐

        │   MongoDB     │**Cách 1: Chạy tất cả services cùng lúc (Khuyên dùng)**

        │  libraryDB    │```bash

        │ Shared Database│cd backend

        └───────────────┘npm run dev:all

                ↑```

                │

        ┌───────────────┐**Cách 2: Chạy từng service riêng (5 terminals)**

        │    Consul     │```bash

        │Port: 8500     │# Terminal 1 - Gateway

        │Service Registry│npm run dev:gateway

        └───────────────┘

```# Terminal 2 - User Service

npm run dev:user

### Thành phần chính:

# Terminal 3 - Book Service

1. **Frontend (React)**npm run dev:book

   - Single Page Application (SPA)

   - Material-UI components# Terminal 4 - Borrow Service

   - Responsive designnpm run dev:borrow

   - JWT token management

# Terminal 5 - Logging Service

2. **API Gateway** npm run dev:logging

   - Enterprise Service Bus (ESB) pattern```

   - Dynamic proxy routing với Consul

   - Rate limiting protection**Cách 3: Dùng script tự động**

   - CORS handling```bash

node scripts/start-system.js

3. **Consul Service Registry**```

   - Service discovery

   - Health monitoring (10s interval)### **4. Khởi động Frontend:**

   - Automatic service registration```bash

   - Load balancing supportcd frontend

npm run dev

4. **4 Microservices**```

   - **User Service** (5001): Authentication & user management

   - **Book Service** (5002): Book catalog CRUD operationsMở browser: **http://localhost:5173**

   - **Borrow Service** (5003): Transaction & service orchestration

   - **Logging Service** (5004): Audit logging---



5. **Shared Database (SOA Pattern)**## 🧪 **KIỂM TRA HỆ THỐNG**

   - MongoDB - libraryDB

   - 4 collections: users, books, borrows, logs### **1. Health Check:**

   - Shared across all services```bash

# Check tất cả services

📖 Chi tiết: [ARCHITECTURE.md](./ARCHITECTURE.md)npm run health



---# Hoặc truy cập Gateway health endpoint:

curl http://localhost:5000/health

## 🛠️ Công nghệ sử dụng

# Xem Service Registry với real-time status:

### Backend
# Truy cập Consul Web UI
http://localhost:8500/ui

## 🛠️ Công nghệ sử dụng

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Node.js** | ≥18.0.0 | Runtime environment |
| **Express.js** | 5.1.0 | Web framework |
| **MongoDB** | latest | Database |
| **Mongoose** | 8.18.2 | ODM for MongoDB |
| **Consul** | 2.0.1 | Service discovery & registry |
| **JWT** | 9.0.2 | Authentication token |
| **bcryptjs** | 3.0.2 | Password hashing |
| **express-rate-limit** | 8.2.0 | Rate limiting protection (1000 req/15min dev) |
| **http-proxy-middleware** | 3.0.5 | API Gateway proxy |
| **axios** | 1.12.2 | HTTP client |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 17.2.2 | Environment variables |

### Frontend

| Công nghệ | Version | Mục đích |

|-----------|---------|----------|      "url": "http://localhost:5001",

| **React** | 19.1.1 | UI library |      "status": "healthy",

| **Material-UI** | 7.3.4 | Component library |      "lastCheck": "2025-10-19T10:30:00.000Z",

| **React Router** | 7.9.3 | Client-side routing |      "failureCount": 0

| **Axios** | 1.12.2 | HTTP client |    }

| **Vite** | 7.1.7 | Build tool & dev server |    // ... other services

| **ESLint** | 9.36.0 | Code linting |  ]

}

### DevOps```

- **Consul** - Service registry & health monitoring

- **PowerShell** - System automation scripts### **2. Test API:**

- **Nodemon** - Development auto-reload```bash

- **Concurrently** - Run multiple servicescd backend

node scripts/test-api.js

---```



## 💻 Yêu cầu hệ thống### **3. Test trên Frontend:**

- Đăng ký tài khoản: `/register`

### Phần mềm cần thiết:- Đăng nhập: `/login`

- **Node.js** ≥ 18.0.0 ([Download](https://nodejs.org/))- Xem sách: `/` (trang chủ)

- **MongoDB** latest ([Download](https://www.mongodb.com/try/download/community))- Mượn sách: `/borrow`

- **Consul** latest ([Download](https://www.consul.io/downloads))- Admin panel: `/admin`

- **Git** (optional, để clone repo)

### **4. Monitoring Service Health:**

### Hệ điều hành hỗ trợ:

- ✅ Windows 10/11Khi Gateway chạy, nó sẽ tự động monitor health (silent mode - chỉ log khi có thay đổi):

- ✅ macOS 11+```

- ✅ Linux (Ubuntu 20.04+)🏥 Starting automatic health monitoring (every 60s)

✅ User Service discovered and healthy

---✅ Book Service discovered and healthy

✅ Borrow Service discovered and healthy

## 🚀 Cài đặt & Chạy✅ Logging Service discovered and healthy



### 1️⃣ Clone repository# Nếu service có vấn đề:

🟡 Book Service is degraded (1 failures)

```bash

git clone https://github.com/doanthetin193/LibraryManagement_SOA.git# Nếu service DOWN:

cd LibraryManagement_SOA🔴 ALERT: Book Service is DOWN!

```   Failures: 3

   Will keep monitoring for recovery...

### 2️⃣ Cài đặt Backend

# Khi service phục hồi:

```bash✅ RECOVERY: Book Service is back online!

cd backend```

npm install

```**Note**: Health checks không hiện trong console khi services healthy (giảm spam).



**Cấu hình .env:**---

```env

PORT=5000## 📋 **SERVICES**

MONGO_URI=mongodb://localhost:27017/libraryDB

JWT_SECRET=your_super_secret_key_here_change_in_production### **1. User Service (Port 5001)**

JWT_EXPIRE=7d**Chức năng:**

CONSUL_HOST=localhost- Đăng ký, đăng nhập

CONSUL_PORT=8500- Quản lý user (admin)

```- Authentication & Authorization



### 3️⃣ Cài đặt Frontend**API Endpoints:**

- `POST /users/register` - Đăng ký

```bash- `POST /users/login` - Đăng nhập

cd ../frontend- `GET /users/me` - Thông tin user hiện tại

npm install- `GET /users/:id` - Chi tiết user (admin)

```- `GET /users/all` - Danh sách users (admin)



### 4️⃣ Khởi động Consul### **2. Book Service (Port 5002)**

**Chức năng:**

**Windows:**- Quản lý sách (CRUD)

```powershell- Tìm kiếm, lọc sách

consul agent -dev- Cập nhật số lượng sách

```

**API Endpoints:**

**Linux/macOS:**- `GET /books` - Danh sách sách

```bash- `GET /books/:id` - Chi tiết sách

consul agent -dev- `POST /books` - Thêm sách (admin)

```- `PUT /books/:id` - Sửa sách (admin)

- `DELETE /books/:id` - Xóa sách (admin)

Consul UI: http://localhost:8500- `PUT /books/:id/copies` - Cập nhật số lượng (internal)



### 5️⃣ Khởi động MongoDB### **3. Borrow Service (Port 5003)**

**Chức năng:**

**Windows:**- Mượn/trả sách

```powershell- Lịch sử mượn sách

mongod- Giao tiếp với User & Book Service

```

**API Endpoints:**

**Linux/macOS:**- `POST /borrows` - Mượn sách

```bash- `PUT /borrows/:id/return` - Trả sách

sudo systemctl start mongod- `GET /borrows` - Danh sách mượn (admin)

```- `GET /borrows/me` - Lịch sử mượn của user



### 6️⃣ Khởi động hệ thống### **4. Logging Service (Port 5004)**

**Chức năng:**

**Option 1: Sử dụng PowerShell Script (Windows - Khuyến nghị)**- Ghi log tất cả hành động

- Audit trail

```powershell- Monitoring

# Từ thư mục root của project

.\start-system.ps1**API Endpoints:**

```- `POST /logs` - Ghi log (internal)

- `GET /logs` - Xem logs (admin)

Script sẽ tự động:

- Kiểm tra Consul & MongoDB---

- Khởi động API Gateway (port 5000)

- Khởi động 4 services (ports 5001-5004)## 🔐 **AUTHENTICATION**

- Khởi động Frontend (port 5173)

### **JWT Token:**

**Option 2: Khởi động thủ công**- Token được generate khi login/register

- Lưu trong localStorage

Terminal 1 - API Gateway:- Header: `Authorization: Bearer <token>`

```bash- Expire: 7 ngày

cd backend

npm start### **Roles:**

```- `user` - Người dùng thường (mượn/trả sách)

- `admin` - Quản trị viên (full quyền)

Terminal 2 - All Services:- `librarian` - Thủ thư (quản lý sách)

```bash

cd backend---

npm run dev:all

```## 🛠️ **CÔNG NGHỆ SỬ DỤNG**



Terminal 3 - Frontend:### **Backend:**

```bash- **Node.js** + **Express** - Web framework

cd frontend- **MongoDB** + **Mongoose** - Database

npm run dev- **JWT** - Authentication

```- **bcryptjs** - Password hashing

- **http-proxy-middleware** - API Gateway proxy

### 7️⃣ Truy cập ứng dụng- **axios** - HTTP client

- **dotenv** - Environment variables

- **Frontend**: http://localhost:5173- **concurrently** - Run multiple processes

- **API Gateway**: http://localhost:5000

- **Consul UI**: http://localhost:8500### **Frontend:**

- **Health Check**: http://localhost:5000/health- **React 18** - UI library

- **Vite** - Build tool

### 8️⃣ Tắt hệ thống- **React Router** - Routing

- **Material-UI** - UI components

**Windows:**- **Axios** - HTTP client

```powershell- **Context API** - State management

.\stop-system.ps1

```---



**Hoặc thủ công:** Ctrl+C ở mỗi terminal## 📊 **DATABASE SCHEMA**



---### **Collections:**



## 📁 Cấu trúc thư mục**users:**

```javascript

```{

LibraryManagement/  _id: ObjectId,

│  username: String (unique),

├── backend/                          # Backend services  password: String (hashed),

│   ├── api-gateway/                  # API Gateway (Port 5000)  role: String (user/admin/librarian),

│   │   └── server.js                 # Gateway với dynamic proxy  createdAt: Date,

│   │  updatedAt: Date

│   ├── services/                     # 4 Microservices}

│   │   ├── user-service/             # Port 5001```

│   │   │   ├── server.js

│   │   │   ├── controllers/**books:**

│   │   │   │   └── userController.js```javascript

│   │   │   ├── models/{

│   │   │   │   └── User.js  _id: ObjectId,

│   │   │   └── routes/  title: String,

│   │   │       └── userRoutes.js  author: String,

│   │   │  publishedYear: Number,

│   │   ├── book-service/             # Port 5002  genre: String,

│   │   │   ├── server.js  availableCopies: Number,

│   │   │   ├── controllers/  createdAt: Date,

│   │   │   │   └── bookController.js  updatedAt: Date

│   │   │   ├── models/}

│   │   │   │   └── Book.js```

│   │   │   └── routes/

│   │   │       └── bookRoutes.js**borrows:**

│   │   │```javascript

│   │   ├── borrow-service/           # Port 5003{

│   │   │   ├── server.js  _id: ObjectId,

│   │   │   ├── controllers/  user: ObjectId (ref: User),

│   │   │   │   └── borrowController.js  book: ObjectId (ref: Book),

│   │   │   ├── helpers/  borrowDate: Date,

│   │   │   │   └── serviceClient.js  # Service-to-service calls  returnDate: Date,

│   │   │   ├── models/  status: String (borrowed/returned),

│   │   │   │   └── Borrow.js  createdAt: Date,

│   │   │   └── routes/  updatedAt: Date

│   │   │       └── borrowRoutes.js}

│   │   │```

│   │   └── logging-service/          # Port 5004

│   │       ├── server.js**logs:**

│   │       ├── controllers/```javascript

│   │       │   └── logController.js{

│   │       ├── models/  _id: ObjectId,

│   │       │   └── Log.js  service: String,

│   │       └── routes/  action: String,

│   │           └── logRoutes.js  user: { id: String, username: String },

│   │  details: Object,

│   ├── shared/                       # Shared modules  level: String (info/warn/error),

│   │   ├── config/  createdAt: Date

│   │   │   ├── db.js                 # MongoDB connection}

│   │   │   └── consulClient.js       # Consul integration```

│   │   ├── middlewares/

│   │   │   ├── authMiddleware.js     # JWT authentication---

│   │   │   └── errorHandler.js       # Global error handler

│   │   └── utils/## 🎯 **TÍNH NĂNG**

│   │       ├── generateToken.js      # JWT token generator

│   │       └── logger.js             # Logging utility### **User:**

│   │- ✅ Đăng ký, đăng nhập

│   ├── scripts/- ✅ Xem danh sách sách

│   │   └── health-check.js           # Health check script- ✅ Mượn sách

│   │- ✅ Trả sách

│   ├── .env                          # Environment variables- ✅ Xem lịch sử mượn sách

│   └── package.json- ✅ Cập nhật profile

│

├── frontend/                         # React frontend### **Admin:**

│   ├── src/- ✅ Tất cả tính năng User

│   │   ├── api/- ✅ Quản lý sách (CRUD)

│   │   │   └── axios.js              # API client config- ✅ Xem tất cả users

│   │   │- ✅ Xem tất cả giao dịch mượn/trả

│   │   ├── components/- ✅ Xem logs hệ thống

│   │   │   ├── Navbar.jsx            # Navigation bar- ✅ Dashboard thống kê

│   │   │   └── BookCard.jsx          # Book display card

│   │   │---

│   │   ├── context/

│   │   │   └── AuthContext.jsx       # Authentication context## 🔍 **API GATEWAY**

│   │   │

│   │   ├── pages/### **Routing:**

│   │   │   ├── Login.jsx             # Login page```

│   │   │   ├── Register.jsx          # Registration pagehttp://localhost:5000/users/*    → User Service (5001)

│   │   │   ├── Books.jsx             # Book listinghttp://localhost:5000/books/*    → Book Service (5002)

│   │   │   ├── Borrow.jsx            # Borrow historyhttp://localhost:5000/borrows/*  → Borrow Service (5003)

│   │   │   ├── Profile.jsx           # User profilehttp://localhost:5000/logs/*     → Logging Service (5004)

│   │   │   └── Admin.jsx             # Admin dashboard```

│   │   │

│   │   ├── App.jsx                   # Main app component### **Features:**

│   │   └── main.jsx                  # Entry point- ✅ CORS handling

│   │- ✅ Request logging

│   ├── public/- ✅ Error handling

│   ├── index.html- ✅ Service health monitoring

│   ├── vite.config.js- ✅ Load balancing ready

│   └── package.json

│---

├── start-system.ps1                  # System startup script

├── stop-system.ps1                   # System shutdown script## 📝 **NPM SCRIPTS**

├── README.md                         # This file

├── ARCHITECTURE.md                   # Architecture documentation### **Backend:**

└── DATA_FLOW.md                      # Data flow documentation```json

```{

  "dev:all": "Chạy tất cả services",

---  "dev:gateway": "Chạy API Gateway",

  "dev:user": "Chạy User Service",

## 📡 API Documentation  "dev:book": "Chạy Book Service",

  "dev:borrow": "Chạy Borrow Service",

### Base URL  "dev:logging": "Chạy Logging Service",

```  "health": "Health check tất cả services",

http://localhost:5000  "soa": "Khởi động hệ thống SOA"

```}

```

### Authentication

Hầu hết các endpoints yêu cầu JWT token trong header:### **Frontend:**

``````json

Authorization: Bearer <token>{

```  "dev": "Chạy development server",

  "build": "Build production",

### Endpoints Overview  "preview": "Preview production build"

}

#### 👤 User Service (`/users`)```

| Method | Endpoint | Description | Auth |

|--------|----------|-------------|------|---

| POST | `/users/register` | Đăng ký user mới | ❌ |

| POST | `/users/login` | Đăng nhập | ❌ |## 🐛 **TROUBLESHOOTING**

| GET | `/users/me` | Lấy thông tin user hiện tại | ✅ |

| GET | `/users/:id` | Lấy thông tin user theo ID | ✅ |### **Services không khởi động:**

| GET | `/users` | Lấy tất cả users (Admin) | ✅ Admin |1. Kiểm tra MongoDB connection string trong `.env`

| GET | `/users/health` | Health check | ❌ |2. Kiểm tra ports có bị chiếm không

3. Đảm bảo đã `npm install`

#### 📚 Book Service (`/books`)

| Method | Endpoint | Description | Auth |### **CORS errors:**

|--------|----------|-------------|------|- Frontend phải chạy trên port 5173 hoặc 3000

| GET | `/books` | Lấy tất cả sách | ❌ |- Đã config trong Gateway `cors` options

| GET | `/books/:id` | Lấy sách theo ID | ❌ |

| POST | `/books` | Thêm sách mới | ✅ Admin/Librarian |### **401 Unauthorized:**

| PUT | `/books/:id` | Cập nhật sách | ✅ Admin/Librarian |- Token hết hạn → Login lại

| DELETE | `/books/:id` | Xóa sách | ✅ Admin |- Token không hợp lệ → Xóa localStorage và login lại

| GET | `/books/health` | Health check | ❌ |

### **504 Gateway Timeout:**

#### 🔄 Borrow Service (`/borrows`)- Service backend không chạy → Khởi động lại services

| Method | Endpoint | Description | Auth |- Kiểm tra health: `npm run health`

|--------|----------|-------------|------|

| POST | `/borrows` | Mượn sách | ✅ |---

| GET | `/borrows/my` | Lịch sử mượn cá nhân | ✅ |

| GET | `/borrows` | Tất cả giao dịch (Admin) | ✅ Admin |## 📄 **LICENSE**

| PUT | `/borrows/:id/return` | Trả sách | ✅ |

| GET | `/borrows/health` | Health check | ❌ |MIT License



#### 📝 Logging Service (`/logs`)---

| Method | Endpoint | Description | Auth |

|--------|----------|-------------|------|## 👨‍💻 **AUTHOR**

| GET | `/logs` | Lấy tất cả logs | ✅ Admin |

| POST | `/logs` | Tạo log entry | ✅ |**Đoàn Thế Tín**

| GET | `/logs/health` | Health check | ❌ |- GitHub: doanthetin193

- Repository: LibraryManagement_SOA

#### 🌐 API Gateway

| Method | Endpoint | Description | Auth |---

|--------|----------|-------------|------|

| GET | `/health` | Health check Gateway | ❌ |## 🎉 **CREDITS**

| GET | `/registry` | Xem services đã đăng ký | ❌ |

Project này được xây dựng để học tập và demo kiến trúc **SOA (Service-Oriented Architecture)**.

### Rate Limiting

- **Login**: 5 requests / 15 minutes**Đặc biệt:**

- **Register**: 3 requests / 60 minutes- ✅ Tuân thủ 100% nguyên tắc SOA

- **General API**: 100 requests / 15 minutes- ✅ Services độc lập nhưng dùng database chung

- ✅ API Gateway là Enterprise Service Bus

Khi vượt giới hạn, server trả về:- ✅ Service Registry tự code

```json- ✅ Clean code, well-documented

{
  "success": false,
  "message": "Quá nhiều request! Vui lòng thử lại sau 15 phút.",
  "retryAfter": 900
}
```
Status code: `429 Too Many Requests`

### Example Requests

**Register:**
```bash
curl -X POST http://localhost:5000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123",
    "email": "john@example.com",
    "role": "user"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

**Get Books:**
```bash
curl http://localhost:5000/books
```

**Borrow Book:**
```bash
curl -X POST http://localhost:5000/borrows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "bookId": "book_id_here"
  }'
```

---

## 📚 Tài liệu bổ sung

| Document | Mô tả |
|----------|-------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Chi tiết về kiến trúc SOA, services, patterns |
| [DATA_FLOW.md](./DATA_FLOW.md) | Luồng dữ liệu qua các services, sequence diagrams |

---

## 🧪 Testing

### Health Check tất cả services:
```bash
cd backend
npm run health
```

### Manual Testing:
1. Đăng ký user mới
2. Đăng nhập
3. Browse sách
4. Mượn sách
5. Xem history
6. Trả sách (Admin panel)

---

## 🔧 Troubleshooting

### Consul không khởi động
```bash
# Kiểm tra port 8500 đang dùng chưa
netstat -ano | findstr :8500

# Kill process nếu cần (Windows)
taskkill /PID <process_id> /F
```

### MongoDB connection failed
```bash
# Kiểm tra MongoDB đang chạy
mongosh

# Nếu lỗi, khởi động lại
net start MongoDB
```

### Service không register với Consul
- Kiểm tra Consul đang chạy: http://localhost:8500
- Xem logs của service để check lỗi
- Đảm bảo .env có đúng CONSUL_HOST và CONSUL_PORT

### Port đã được sử dụng
```powershell
# Kiểm tra port đang dùng (Windows)
netstat -ano | findstr :<port>

# Kill process
taskkill /PID <process_id> /F
```

---

## 🤝 Contributing

Contributions are welcome! Vui lòng tạo Pull Request hoặc mở Issue nếu phát hiện bug.

### Development Workflow:
1. Fork repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Team

**Project Type:** Service-Oriented Architecture (SOA)  
**Course:** Giữa kỳ SOA  
**Year:** 2025

### Contact:
- GitHub: [@doanthetin193](https://github.com/doanthetin193)
- Repository: [LibraryManagement_SOA](https://github.com/doanthetin193/LibraryManagement_SOA)

---

## 🎉 Acknowledgments

- Material-UI for beautiful React components
- HashiCorp Consul for service discovery
- MongoDB for flexible database
- Express.js for robust backend framework

---

<div align="center">

**⭐ Nếu project hữu ích, đừng quên cho 1 star nhé! ⭐**

Made with ❤️ by [doanthetin193](https://github.com/doanthetin193)

</div>
