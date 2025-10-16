# 📚 Library Management System - SOA Architecture

Hệ thống quản lý thư viện được xây dựng theo kiến trúc **Service-Oriented Architecture (SOA)** với API Gateway.

---

## 🏗️ **KIẾN TRÚC SOA**

### **Đặc điểm chính:**
- ✅ **4 Services độc lập**: User, Book, Borrow, Logging
- ✅ **Database chung**: Tất cả services dùng chung MongoDB `libraryDB`
- ✅ **API Gateway**: Enterprise Service Bus - routing tất cả requests
- ✅ **Service Registry**: Tự code, không dùng Consul
- ✅ **Service Communication**: Service-to-service qua Gateway

### **Sơ đồ kiến trúc:**
```
Frontend (React)
       ↓
API Gateway (Port 5000) ← Service Registry
       ↓
   ┌───┴───┬───────┬──────────┐
   ↓       ↓       ↓          ↓
User    Book    Borrow    Logging
5001    5002     5003      5004
   └───┬───┴───────┴──────────┘
       ↓
MongoDB (libraryDB - Database chung)
```

---

## 📁 **CẤU TRÚC PROJECT**

```
LibraryManagement/
├── backend/
│   ├── api-gateway/           # API Gateway - ESB
│   │   └── server.js
│   ├── services/              # 4 Services độc lập
│   │   ├── user-service/      # Port 5001
│   │   ├── book-service/      # Port 5002
│   │   ├── borrow-service/    # Port 5003
│   │   └── logging-service/   # Port 5004
│   ├── shared/                # Shared components
│   │   ├── config/            # DB, Service registry
│   │   ├── middlewares/       # Auth, Error handler
│   │   └── utils/             # Logger, Token generator
│   └── scripts/               # Utility scripts
│       ├── health-check.js    # Health check tool
│       ├── start-system.js    # System startup
│       └── test-api.js        # API testing
└── frontend/                  # React + Vite
    └── src/
        ├── pages/             # Login, Register, Books, etc.
        ├── components/        # Navbar, BookCard
        ├── context/           # AuthContext
        └── api/               # Axios config
```

---

## 🚀 **KHỞI ĐỘNG HỆ THỐNG**

### **Yêu cầu:**
- Node.js v16+
- MongoDB Atlas account (hoặc MongoDB local)
- npm hoặc yarn

### **1. Cài đặt dependencies:**

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### **2. Cấu hình môi trường:**

Tạo file `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/libraryDB
JWT_SECRET=your_secret_key
USER_PORT=5001
BOOK_PORT=5002
BORROW_PORT=5003
LOGGING_PORT=5004
GATEWAY_PORT=5000
```

### **3. Khởi động Backend (SOA):**

**Cách 1: Chạy tất cả services cùng lúc (Khuyên dùng)**
```bash
cd backend
npm run dev:all
```

**Cách 2: Chạy từng service riêng (5 terminals)**
```bash
# Terminal 1 - Gateway
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

**Cách 3: Dùng script tự động**
```bash
node scripts/start-system.js
```

### **4. Khởi động Frontend:**
```bash
cd frontend
npm run dev
```

Mở browser: **http://localhost:5173**

---

## 🧪 **KIỂM TRA HỆ THỐNG**

### **1. Health Check:**
```bash
# Check tất cả services
npm run health

# Hoặc truy cập:
curl http://localhost:5000/health
```

### **2. Test API:**
```bash
cd backend
node scripts/test-api.js
```

### **3. Test trên Frontend:**
- Đăng ký tài khoản: `/register`
- Đăng nhập: `/login`
- Xem sách: `/` (trang chủ)
- Mượn sách: `/borrow`
- Admin panel: `/admin`

---

## 📋 **SERVICES**

### **1. User Service (Port 5001)**
**Chức năng:**
- Đăng ký, đăng nhập
- Quản lý user (admin)
- Authentication & Authorization

**API Endpoints:**
- `POST /users/register` - Đăng ký
- `POST /users/login` - Đăng nhập
- `GET /users/me` - Thông tin user hiện tại
- `GET /users/:id` - Chi tiết user (admin)
- `GET /users/all` - Danh sách users (admin)

### **2. Book Service (Port 5002)**
**Chức năng:**
- Quản lý sách (CRUD)
- Tìm kiếm, lọc sách
- Cập nhật số lượng sách

**API Endpoints:**
- `GET /books` - Danh sách sách
- `GET /books/:id` - Chi tiết sách
- `POST /books` - Thêm sách (admin)
- `PUT /books/:id` - Sửa sách (admin)
- `DELETE /books/:id` - Xóa sách (admin)
- `PUT /books/:id/copies` - Cập nhật số lượng (internal)

### **3. Borrow Service (Port 5003)**
**Chức năng:**
- Mượn/trả sách
- Lịch sử mượn sách
- Giao tiếp với User & Book Service

**API Endpoints:**
- `POST /borrows` - Mượn sách
- `PUT /borrows/:id/return` - Trả sách
- `GET /borrows` - Danh sách mượn (admin)
- `GET /borrows/me` - Lịch sử mượn của user

### **4. Logging Service (Port 5004)**
**Chức năng:**
- Ghi log tất cả hành động
- Audit trail
- Monitoring

**API Endpoints:**
- `POST /logs` - Ghi log (internal)
- `GET /logs` - Xem logs (admin)

---

## 🔐 **AUTHENTICATION**

### **JWT Token:**
- Token được generate khi login/register
- Lưu trong localStorage
- Header: `Authorization: Bearer <token>`
- Expire: 7 ngày

### **Roles:**
- `user` - Người dùng thường (mượn/trả sách)
- `admin` - Quản trị viên (full quyền)
- `librarian` - Thủ thư (quản lý sách)

---

## 🛠️ **CÔNG NGHỆ SỬ DỤNG**

### **Backend:**
- **Node.js** + **Express** - Web framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **http-proxy-middleware** - API Gateway proxy
- **axios** - HTTP client
- **dotenv** - Environment variables
- **concurrently** - Run multiple processes

### **Frontend:**
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Material-UI** - UI components
- **Axios** - HTTP client
- **Context API** - State management

---

## 📊 **DATABASE SCHEMA**

### **Collections:**

**users:**
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  role: String (user/admin/librarian),
  createdAt: Date,
  updatedAt: Date
}
```

**books:**
```javascript
{
  _id: ObjectId,
  title: String,
  author: String,
  publishedYear: Number,
  genre: String,
  availableCopies: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**borrows:**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  book: ObjectId (ref: Book),
  borrowDate: Date,
  returnDate: Date,
  status: String (borrowed/returned),
  createdAt: Date,
  updatedAt: Date
}
```

**logs:**
```javascript
{
  _id: ObjectId,
  service: String,
  action: String,
  user: { id: String, username: String },
  details: Object,
  level: String (info/warn/error),
  createdAt: Date
}
```

---

## 🎯 **TÍNH NĂNG**

### **User:**
- ✅ Đăng ký, đăng nhập
- ✅ Xem danh sách sách
- ✅ Mượn sách
- ✅ Trả sách
- ✅ Xem lịch sử mượn sách
- ✅ Cập nhật profile

### **Admin:**
- ✅ Tất cả tính năng User
- ✅ Quản lý sách (CRUD)
- ✅ Xem tất cả users
- ✅ Xem tất cả giao dịch mượn/trả
- ✅ Xem logs hệ thống
- ✅ Dashboard thống kê

---

## 🔍 **API GATEWAY**

### **Routing:**
```
http://localhost:5000/users/*    → User Service (5001)
http://localhost:5000/books/*    → Book Service (5002)
http://localhost:5000/borrows/*  → Borrow Service (5003)
http://localhost:5000/logs/*     → Logging Service (5004)
```

### **Features:**
- ✅ CORS handling
- ✅ Request logging
- ✅ Error handling
- ✅ Service health monitoring
- ✅ Load balancing ready

---

## 📝 **NPM SCRIPTS**

### **Backend:**
```json
{
  "dev:all": "Chạy tất cả services",
  "dev:gateway": "Chạy API Gateway",
  "dev:user": "Chạy User Service",
  "dev:book": "Chạy Book Service",
  "dev:borrow": "Chạy Borrow Service",
  "dev:logging": "Chạy Logging Service",
  "health": "Health check tất cả services",
  "soa": "Khởi động hệ thống SOA"
}
```

### **Frontend:**
```json
{
  "dev": "Chạy development server",
  "build": "Build production",
  "preview": "Preview production build"
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Services không khởi động:**
1. Kiểm tra MongoDB connection string trong `.env`
2. Kiểm tra ports có bị chiếm không
3. Đảm bảo đã `npm install`

### **CORS errors:**
- Frontend phải chạy trên port 5173 hoặc 3000
- Đã config trong Gateway `cors` options

### **401 Unauthorized:**
- Token hết hạn → Login lại
- Token không hợp lệ → Xóa localStorage và login lại

### **504 Gateway Timeout:**
- Service backend không chạy → Khởi động lại services
- Kiểm tra health: `npm run health`

---

## 📄 **LICENSE**

MIT License

---

## 👨‍💻 **AUTHOR**

**Đoàn Thế Tín**
- GitHub: doanthetin193
- Repository: LibraryManagement_SOA

---

## 🎉 **CREDITS**

Project này được xây dựng để học tập và demo kiến trúc **SOA (Service-Oriented Architecture)**.

**Đặc biệt:**
- ✅ Tuân thủ 100% nguyên tắc SOA
- ✅ Services độc lập nhưng dùng database chung
- ✅ API Gateway là Enterprise Service Bus
- ✅ Service Registry tự code
- ✅ Clean code, well-documented
