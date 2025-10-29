# 🔄 Data Flow Documentation

> Chi tiết về luồng dữ liệu qua các services, API flows, và request/response patterns trong Library Management System

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Authentication Flow](#-authentication-flow)
- [Book Management Flow](#-book-management-flow)
- [Borrow Transaction Flow](#-borrow-transaction-flow)
- [Admin Operations Flow](#-admin-operations-flow)
- [Error Handling Flow](#-error-handling-flow)
- [Service-to-Service Communication](#-service-to-service-communication)
- [Database Operations](#-database-operations)
- [Request/Response Examples](#-requestresponse-examples)

---

## 🎯 Tổng quan

### Data Flow Layers:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│              (Browser / Mobile App)                      │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ JSON Payload
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  GATEWAY LAYER                           │
│             • Route Resolution                           │
│             • Rate Limiting                              │
│             • Request Logging                            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Proxy
                     │ Consul Discovery
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 SERVICE LAYER                            │
│       • Authentication                                   │
│       • Business Logic                                   │
│       • Validation                                       │
│       • Inter-service Calls                              │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
                     │ MongoDB Driver
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│              MongoDB - libraryDB                         │
│       • CRUD Operations                                  │
│       • Transactions                                     │
│       • Indexing                                         │
└─────────────────────────────────────────────────────────┘
```

### Request Lifecycle:

```
1. Client sends HTTP request
2. Gateway receives request
3. Rate limiter checks limit
4. Gateway queries Consul for service
5. Consul returns service URL
6. Gateway proxies to service
7. Service validates request
8. Service checks authentication (JWT)
9. Service performs business logic
10. Service queries/updates MongoDB
11. Service returns response
12. Gateway forwards response
13. Client receives response
```

---

## 🔐 Authentication Flow

### 1. User Registration

**Endpoint:** `POST /users/register`

#### Sequence Diagram:

```
Client          Gateway         User Service       MongoDB
  │                │                 │                │
  │ POST /users    │                 │                │
  │  /register     │                 │                │
  ├───────────────>│                 │                │
  │                │                 │                │
  │                │ 1. Rate Limit   │                │
  │                │    Check        │                │
  │                │    (3/60min)    │                │
  │                │                 │                │
  │                │ 2. Proxy        │                │
  │                ├────────────────>│                │
  │                │                 │                │
  │                │                 │ 3. Validate    │
  │                │                 │    Input       │
  │                │                 │                │
  │                │                 │ 4. Check       │
  │                │                 │    Duplicate   │
  │                │                 ├───────────────>│
  │                │                 │◀───────────────┤
  │                │                 │                │
  │                │                 │ 5. Hash        │
  │                │                 │    Password    │
  │                │                 │  (bcrypt)      │
  │                │                 │                │
  │                │                 │ 6. Create User │
  │                │                 ├───────────────>│
  │                │                 │◀───────────────┤
  │                │                 │                │
  │                │                 │ 7. Generate    │
  │                │                 │    JWT Token   │
  │                │                 │                │
  │                │ 8. Response     │                │
  │                │◀────────────────┤                │
  │                │                 │                │
  │ 9. Success     │                 │                │
  │◀───────────────┤                 │                │
  │ + JWT Token    │                 │                │
  │                │                 │                │
```

#### Request:
```json
POST http://localhost:5000/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!",
  "email": "john@example.com",
  "role": "user"
}
```

#### Response (Success - 201):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2025-10-30T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Response (Error - 400):
```json
{
  "success": false,
  "message": "User already exists"
}
```

#### Response (Rate Limited - 429):
```json
{
  "success": false,
  "message": "Quá nhiều lần đăng ký! Vui lòng thử lại sau 1 giờ.",
  "retryAfter": 3600
}
```

---

### 2. User Login

**Endpoint:** `POST /users/login`

#### Sequence Diagram:

```
Client          Gateway         User Service       MongoDB
  │                │                 │                │
  │ POST /users    │                 │                │
  │  /login        │                 │                │
  ├───────────────>│                 │                │
  │                │                 │                │
  │                │ 1. Rate Limit   │                │
  │                │    Check        │                │
  │                │    (5/15min)    │                │
  │                │                 │                │
  │                │ 2. Proxy        │                │
  │                ├────────────────>│                │
  │                │                 │                │
  │                │                 │ 3. Find User   │
  │                │                 ├───────────────>│
  │                │                 │◀───────────────┤
  │                │                 │                │
  │                │                 │ 4. Verify      │
  │                │                 │    Password    │
  │                │                 │  (bcrypt)      │
  │                │                 │                │
  │                │                 │ 5. Generate    │
  │                │                 │    JWT Token   │
  │                │                 │                │
  │                │ 6. Response     │                │
  │                │◀────────────────┤                │
  │                │                 │                │
  │ 7. Success     │                 │                │
  │◀───────────────┤                 │                │
  │ + JWT Token    │                 │                │
  │                │                 │                │
```

#### Request:
```json
POST http://localhost:5000/users/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

#### Response (Success - 200):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Response (Error - 401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /users/me`

#### Sequence Diagram:

```
Client          Gateway         User Service       MongoDB
  │                │                 │                │
  │ GET /users/me  │                 │                │
  │ Header: Auth   │                 │                │
  ├───────────────>│                 │                │
  │                │                 │                │
  │                │ 1. Rate Limit   │                │
  │                │    Check        │                │
  │                │                 │                │
  │                │ 2. Proxy        │                │
  │                │    + Forward    │                │
  │                │    Auth Header  │                │
  │                ├────────────────>│                │
  │                │                 │                │
  │                │                 │ 3. Verify JWT  │
  │                │                 │    Token       │
  │                │                 │                │
  │                │                 │ 4. Extract     │
  │                │                 │    User ID     │
  │                │                 │                │
  │                │                 │ 5. Find User   │
  │                │                 ├───────────────>│
  │                │                 │◀───────────────┤
  │                │                 │                │
  │                │ 6. Response     │                │
  │                │◀────────────────┤                │
  │                │                 │                │
  │ 7. User Data   │                 │                │
  │◀───────────────┤                 │                │
  │                │                 │                │
```

#### Request:
```http
GET http://localhost:5000/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (Success - 200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2025-10-30T10:00:00.000Z"
  }
}
```

#### Response (Error - 401):
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

---

## 📚 Book Management Flow

### 1. Get All Books

**Endpoint:** `GET /books`

#### Sequence Diagram:

```
Client          Gateway         Book Service       MongoDB
  │                │                 │                │
  │ GET /books     │                 │                │
  ├───────────────>│                 │                │
  │                │                 │                │
  │                │ 1. Rate Limit   │                │
  │                │    Check        │                │
  │                │                 │                │
  │                │ 2. Query Consul │                │
  │                │    for Book     │                │
  │                │    Service      │                │
  │                │                 │                │
  │                │ 3. Proxy        │                │
  │                ├────────────────>│                │
  │                │                 │                │
  │                │                 │ 4. Find All    │
  │                │                 │    Books       │
  │                │                 ├───────────────>│
  │                │                 │◀───────────────┤
  │                │                 │                │
  │                │                 │ 5. Sort &      │
  │                │                 │    Filter      │
  │                │                 │                │
  │                │ 6. Response     │                │
  │                │◀────────────────┤                │
  │                │                 │                │
  │ 7. Books Array │                 │                │
  │◀───────────────┤                 │                │
  │                │                 │                │
```

#### Request:
```http
GET http://localhost:5000/books
```

#### Response (Success - 200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "genre": "Programming",
      "description": "A Handbook of Agile Software Craftsmanship",
      "publishedYear": 2008,
      "isbn": "978-0132350884",
      "totalCopies": 5,
      "availableCopies": 3,
      "createdAt": "2025-10-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Design Patterns",
      "author": "Gang of Four",
      "genre": "Programming",
      "publishedYear": 1994,
      "totalCopies": 3,
      "availableCopies": 0,
      "createdAt": "2025-10-01T00:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 2. Create New Book (Admin/Librarian)

**Endpoint:** `POST /books`

#### Sequence Diagram:

```
Client       Gateway      Book Service    MongoDB    Logging Service
  │             │              │             │              │
  │ POST /books │              │             │              │
  │ + JWT Token │              │             │              │
  ├────────────>│              │             │              │
  │             │              │             │              │
  │             │ 1. Rate Limit│             │              │
  │             │    Check     │             │              │
  │             │              │             │              │
  │             │ 2. Proxy     │             │              │
  │             ├─────────────>│             │              │
  │             │              │             │              │
  │             │              │ 3. Verify   │              │
  │             │              │    JWT      │              │
  │             │              │             │              │
  │             │              │ 4. Check    │              │
  │             │              │    Role     │              │
  │             │              │  (Admin/Lib)│              │
  │             │              │             │              │
  │             │              │ 5. Validate │              │
  │             │              │    Input    │              │
  │             │              │             │              │
  │             │              │ 6. Create   │              │
  │             │              │    Book     │              │
  │             │              ├────────────>│              │
  │             │              │◀────────────┤              │
  │             │              │             │              │
  │             │              │ 7. Log      │              │
  │             │              │    Action   │              │
  │             │              ├─────────────────────────>  │
  │             │              │◀─────────────────────────  │
  │             │              │             │              │
  │             │ 8. Response  │             │              │
  │             │◀─────────────┤             │              │
  │             │              │             │              │
  │ 9. Success  │              │             │              │
  │◀────────────┤              │             │              │
  │             │              │             │              │
```

#### Request:
```json
POST http://localhost:5000/books
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt, David Thomas",
  "genre": "Programming",
  "description": "Your Journey To Mastery",
  "publishedYear": 2019,
  "isbn": "978-0135957059",
  "totalCopies": 10,
  "availableCopies": 10
}
```

#### Response (Success - 201):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt, David Thomas",
    "genre": "Programming",
    "description": "Your Journey To Mastery",
    "publishedYear": 2019,
    "isbn": "978-0135957059",
    "totalCopies": 10,
    "availableCopies": 10,
    "createdAt": "2025-10-30T11:00:00.000Z"
  }
}
```

#### Response (Error - 403):
```json
{
  "success": false,
  "message": "Not authorized to create books"
}
```

---

## 🔄 Borrow Transaction Flow

### 1. Borrow Book (Complete Flow)

**Endpoint:** `POST /borrows`

This is the **most complex flow** involving multiple services.

#### Sequence Diagram:

```
Client    Gateway   Borrow    User     Book     Logging   MongoDB
  │          │       Service   Service  Service  Service     │
  │          │         │         │        │         │        │
  │ POST     │         │         │        │         │        │
  │ /borrows │         │         │        │         │        │
  ├─────────>│         │         │        │         │        │
  │          │         │         │        │         │        │
  │          │ 1. Rate │         │        │         │        │
  │          │  Limit  │         │        │         │        │
  │          │         │         │        │         │        │
  │          │ 2. Proxy│         │        │         │        │
  │          ├────────>│         │        │         │        │
  │          │         │         │        │         │        │
  │          │         │ 3. Extract JWT   │         │        │
  │          │         │    User ID       │         │        │
  │          │         │         │        │         │        │
  │          │         │ 4. Verify User   │         │        │
  │          │         ├────────>│        │         │        │
  │          │         │◀────────┤        │         │        │
  │          │         │ User OK │        │         │        │
  │          │         │         │        │         │        │
  │          │         │ 5. Check Book    │         │        │
  │          │         │    Availability  │         │        │
  │          │         ├─────────────────>│         │        │
  │          │         │◀─────────────────┤         │        │
  │          │         │ Book Available   │         │        │
  │          │         │                  │         │        │
  │          │         │ 6. Decrease      │         │        │
  │          │         │    Book Copies   │         │        │
  │          │         ├─────────────────>│         │        │
  │          │         │                  │         │        │
  │          │         │                  │ 7. Atomic        │
  │          │         │                  │   Update         │
  │          │         │                  │   (Race          │
  │          │         │                  │   Protection)    │
  │          │         │                  ├─────────────────>│
  │          │         │                  │◀─────────────────┤
  │          │         │◀─────────────────┤         │        │
  │          │         │ Success          │         │        │
  │          │         │                  │         │        │
  │          │         │ 8. Create Borrow Record   │        │
  │          │         ├───────────────────────────────────>│
  │          │         │◀───────────────────────────────────┤
  │          │         │                  │         │        │
  │          │         │ 9. Log Activity  │         │        │
  │          │         ├─────────────────────────>  │        │
  │          │         │◀─────────────────────────  │        │
  │          │         │                  │         │        │
  │          │ 10. Response               │         │        │
  │          │◀────────┤                  │         │        │
  │          │         │                  │         │        │
  │ 11. Success        │                  │         │        │
  │◀─────────┤         │                  │         │        │
  │          │         │                  │         │        │
```

#### Detailed Steps:

**Step 1-2: Gateway Processing**
- Rate limit check (100 req/15min)
- Query Consul for borrow-service URL
- Proxy request with headers

**Step 3: JWT Extraction**
```javascript
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET);
const userId = decoded.id;
```

**Step 4: User Verification**
```javascript
// Call to User Service
const userResponse = await axios.get(
  `http://localhost:5001/users/${userId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

if (!userResponse.data.success) {
  throw new Error('User not found');
}
```

**Step 5: Book Availability Check**
```javascript
// Call to Book Service
const bookResponse = await axios.get(
  `http://localhost:5002/books/${bookId}`
);

const book = bookResponse.data.data;

if (book.availableCopies < 1) {
  return res.status(400).json({
    success: false,
    message: 'Book not available'
  });
}
```

**Step 6-7: Atomic Decrease (Race Condition Protection)**
```javascript
// Call to Book Service with atomic operation
const updateResponse = await axios.put(
  `http://localhost:5002/books/${bookId}/decrease`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);

// Inside Book Service:
const book = await Book.findOneAndUpdate(
  { 
    _id: bookId, 
    availableCopies: { $gte: 1 }  // Condition: only if available
  },
  { 
    $inc: { availableCopies: -1 }  // Atomic decrement
  },
  { new: true }
);

if (!book) {
  // Race condition: another user got the last copy
  return res.status(409).json({
    success: false,
    message: 'Book no longer available'
  });
}
```

**Step 8: Create Borrow Record**
```javascript
const borrow = await Borrow.create({
  userId: userId,
  bookId: bookId,
  borrowDate: new Date(),
  status: 'borrowed'
});
```

**Step 9: Log Activity**
```javascript
// Call to Logging Service
await axios.post(
  'http://localhost:5004/logs',
  {
    userId: userId,
    username: user.username,
    action: 'BORROW_BOOK',
    details: `Borrowed book: ${book.title}`,
    level: 'info'
  },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

#### Request:
```json
POST http://localhost:5000/borrows
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "bookId": "507f1f77bcf86cd799439012"
}
```

#### Response (Success - 201):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439011",
    "bookId": "507f1f77bcf86cd799439012",
    "borrowDate": "2025-10-30T12:00:00.000Z",
    "returnDate": null,
    "status": "borrowed",
    "book": {
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "availableCopies": 2
    }
  },
  "message": "Book borrowed successfully"
}
```

#### Response (Error - 400 Book Not Available):
```json
{
  "success": false,
  "message": "Book not available for borrowing"
}
```

#### Response (Error - 409 Race Condition):
```json
{
  "success": false,
  "message": "Book no longer available (someone just borrowed it)"
}
```

#### Response (Error - 500 Service Unavailable):
```json
{
  "success": false,
  "message": "Book Service unavailable",
  "error": "ECONNREFUSED"
}
```

---

### 2. Return Book

**Endpoint:** `PUT /borrows/:id/return`

#### Sequence Diagram:

```
Client    Gateway   Borrow    Book     Logging   MongoDB
  │          │       Service  Service  Service     │
  │          │         │        │         │        │
  │ PUT      │         │        │         │        │
  │ /borrows │         │        │         │        │
  │ /:id/ret │         │        │         │        │
  ├─────────>│         │        │         │        │
  │          │         │        │         │        │
  │          │ 1. Proxy│        │         │        │
  │          ├────────>│        │         │        │
  │          │         │        │         │        │
  │          │         │ 2. Verify        │        │
  │          │         │    Ownership     │        │
  │          │         ├─────────────────────────>│
  │          │         │◀─────────────────────────┤
  │          │         │        │         │        │
  │          │         │ 3. Check Status  │        │
  │          │         │   (not returned) │        │
  │          │         │        │         │        │
  │          │         │ 4. Increase      │        │
  │          │         │    Book Copies   │        │
  │          │         ├───────>│         │        │
  │          │         │◀───────┤         │        │
  │          │         │        │         │        │
  │          │         │ 5. Update Borrow │        │
  │          │         │    Status        │        │
  │          │         ├─────────────────────────>│
  │          │         │◀─────────────────────────┤
  │          │         │        │         │        │
  │          │         │ 6. Log Return    │        │
  │          │         ├────────────────>  │        │
  │          │         │◀────────────────  │        │
  │          │         │        │         │        │
  │          │ 7. Response      │         │        │
  │          │◀────────┤        │         │        │
  │          │         │        │         │        │
  │ 8. Success         │        │         │        │
  │◀─────────┤         │        │         │        │
  │          │         │        │         │        │
```

#### Request:
```http
PUT http://localhost:5000/borrows/507f1f77bcf86cd799439015/return
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (Success - 200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439011",
    "bookId": "507f1f77bcf86cd799439012",
    "borrowDate": "2025-10-30T12:00:00.000Z",
    "returnDate": "2025-10-30T15:30:00.000Z",
    "status": "returned"
  },
  "message": "Book returned successfully"
}
```

---

## 👨‍💼 Admin Operations Flow

### 1. Get All Users (Admin Only)

**Endpoint:** `GET /users`

#### Sequence Diagram:

```
Admin Client  Gateway    User Service   MongoDB
     │           │            │            │
     │ GET /users│            │            │
     │ + JWT     │            │            │
     ├──────────>│            │            │
     │           │            │            │
     │           │ 1. Proxy   │            │
     │           ├───────────>│            │
     │           │            │            │
     │           │            │ 2. Verify  │
     │           │            │    JWT     │
     │           │            │            │
     │           │            │ 3. Check   │
     │           │            │    Role    │
     │           │            │  (admin?)  │
     │           │            │            │
     │           │            │ 4. Find All│
     │           │            │    Users   │
     │           │            ├───────────>│
     │           │            │◀───────────┤
     │           │            │            │
     │           │ 5. Response│            │
     │           │◀───────────┤            │
     │           │            │            │
     │ 6. Users  │            │            │
     │   Array   │            │            │
     │◀──────────┤            │            │
     │           │            │            │
```

#### Request:
```http
GET http://localhost:5000/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (Success - 200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2025-10-30T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439016",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2025-10-01T00:00:00.000Z"
    }
  ],
  "count": 2
}
```

#### Response (Error - 403):
```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

### 2. Get All Logs (Admin Only)

**Endpoint:** `GET /logs?page=1&limit=50`

#### Request:
```http
GET http://localhost:5000/logs?page=1&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (Success - 200):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "userId": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "action": "BORROW_BOOK",
        "details": "Borrowed book: Clean Code",
        "timestamp": "2025-10-30T12:00:00.000Z",
        "level": "info",
        "ipAddress": "192.168.1.1"
      },
      {
        "_id": "507f1f77bcf86cd799439021",
        "userId": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "action": "RETURN_BOOK",
        "details": "Returned book: Clean Code",
        "timestamp": "2025-10-30T15:30:00.000Z",
        "level": "info",
        "ipAddress": "192.168.1.1"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalLogs": 234,
      "limit": 50
    }
  }
}
```

---

## ❌ Error Handling Flow

### Error Propagation:

```
Service Error
     │
     ▼
Try/Catch Block
     │
     ▼
Error Handler Middleware
     │
     ▼
Logging Service (optional)
     │
     ▼
JSON Error Response
     │
     ▼
Gateway (Pass through)
     │
     ▼
Client
```

### Error Response Format:

```javascript
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error details (dev mode only)",
  "timestamp": "2025-10-30T12:00:00.000Z",
  "path": "/users/login"
}
```

### Common Error Status Codes:

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Race condition, duplicate key |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 502 | Bad Gateway | Service unavailable |
| 503 | Service Unavailable | Database connection failed |

---

## 🔗 Service-to-Service Communication

### Communication Patterns:

#### 1. **Synchronous HTTP Calls**

Used by Borrow Service to call other services:

```javascript
// serviceClient.js

const axios = require('axios');

// Call User Service
async function getCurrentUser(token) {
  const response = await axios.get(
    'http://localhost:5001/users/me',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

// Call Book Service
async function getBookById(bookId) {
  const response = await axios.get(
    `http://localhost:5002/books/${bookId}`
  );
  return response.data.data;
}

// Call Book Service to update
async function updateBookCopies(bookId, action, token) {
  const response = await axios.put(
    `http://localhost:5002/books/${bookId}/${action}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

// Call Logging Service
async function createLog(logData, token) {
  await axios.post(
    'http://localhost:5004/logs',
    logData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

module.exports = {
  getCurrentUser,
  getBookById,
  updateBookCopies,
  createLog
};
```

#### 2. **Token Forwarding**

JWT token được forward từ client → Gateway → Service A → Service B:

```
Client Token
     │
     ▼
Authorization: Bearer <token>
     │
     ▼
Gateway (pass through)
     │
     ▼
Borrow Service (receives token)
     │
     ▼
Forward to User Service
Forward to Book Service
Forward to Logging Service
```

#### 3. **Error Handling in Inter-Service Calls**

```javascript
try {
  const user = await getCurrentUser(token);
  const book = await getBookById(bookId);
  
  // Continue with business logic
  
} catch (error) {
  if (error.response) {
    // Service returned error response
    return res.status(error.response.status).json({
      success: false,
      message: `${error.config.url} failed`,
      error: error.response.data.message
    });
  } else if (error.request) {
    // Service didn't respond
    return res.status(503).json({
      success: false,
      message: 'Service unavailable',
      error: error.message
    });
  } else {
    // Other error
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
```

---

## 💾 Database Operations

### CRUD Operation Patterns:

#### 1. **Create**

```javascript
// User Service - Create User
const newUser = await User.create({
  username: req.body.username,
  password: hashedPassword,
  email: req.body.email,
  role: req.body.role
});
```

#### 2. **Read**

```javascript
// Book Service - Find all books
const books = await Book.find()
  .sort({ createdAt: -1 })
  .select('-__v');

// Find one by ID
const book = await Book.findById(bookId);

// Find with conditions
const borrows = await Borrow.find({ 
  userId: userId, 
  status: 'borrowed' 
})
.populate('bookId', 'title author')
.sort({ borrowDate: -1 });
```

#### 3. **Update**

```javascript
// Book Service - Normal update
const updatedBook = await Book.findByIdAndUpdate(
  bookId,
  { title: newTitle, author: newAuthor },
  { new: true, runValidators: true }
);

// Book Service - Atomic update (Race condition protection)
const book = await Book.findOneAndUpdate(
  { 
    _id: bookId, 
    availableCopies: { $gte: 1 }  // Condition
  },
  { 
    $inc: { availableCopies: -1 }  // Atomic operation
  },
  { new: true }
);

if (!book) {
  throw new Error('Update failed - race condition');
}
```

#### 4. **Delete**

```javascript
// Book Service - Delete book
await Book.findByIdAndDelete(bookId);
```

### Transaction Example (if needed):

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Operation 1
  await Book.findByIdAndUpdate(
    bookId,
    { $inc: { availableCopies: -1 } },
    { session }
  );
  
  // Operation 2
  await Borrow.create([{
    userId,
    bookId,
    status: 'borrowed'
  }], { session });
  
  await session.commitTransaction();
  
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## 📊 Request/Response Examples

### Complete Request/Response Cycle:

#### Example: Borrow a Book

**1. Client Request:**
```http
POST http://localhost:5000/borrows HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInVzZXJuYW1lIjoiam9obl9kb2UiLCJyb2xlIjoidXNlciIsImlhdCI6MTczMDI4MDAwMCwiZXhwIjoxNzMwODg0ODAwfQ.signature
Content-Length: 45

{
  "bookId": "507f1f77bcf86cd799439012"
}
```

**2. Gateway Processing:**
```javascript
// Rate limit check
if (requestCount > 100) {
  return 429 Too Many Requests
}

// Query Consul
const serviceUrl = await getServiceUrl('borrow-service');
// Returns: http://localhost:5003

// Proxy request
proxy.web(req, res, { target: serviceUrl });
```

**3. Borrow Service Processing:**
```javascript
// Extract JWT
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(token, JWT_SECRET);
// decoded = { id: "507f1f77bcf86cd799439011", username: "john_doe", role: "user" }

// Verify user (call User Service)
const user = await getCurrentUser(token);

// Check book availability (call Book Service)
const book = await getBookById(bookId);

if (book.availableCopies < 1) {
  return res.status(400).json({
    success: false,
    message: 'Book not available'
  });
}

// Decrease book copies (call Book Service - atomic)
await updateBookCopies(bookId, 'decrease', token);

// Create borrow record
const borrow = await Borrow.create({
  userId: decoded.id,
  bookId: bookId,
  borrowDate: new Date(),
  status: 'borrowed'
});

// Log activity (call Logging Service)
await createLog({
  userId: decoded.id,
  username: decoded.username,
  action: 'BORROW_BOOK',
  details: `Borrowed book: ${book.title}`,
  level: 'info'
}, token);

// Return response
return res.status(201).json({
  success: true,
  data: borrow,
  message: 'Book borrowed successfully'
});
```

**4. Response to Client:**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 245

{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439011",
    "bookId": "507f1f77bcf86cd799439012",
    "borrowDate": "2025-10-30T12:00:00.000Z",
    "returnDate": null,
    "status": "borrowed"
  },
  "message": "Book borrowed successfully"
}
```

---

## 📈 Performance Metrics

### Typical Response Times:

| Operation | Services Involved | Avg Response Time |
|-----------|-------------------|-------------------|
| GET /books | 1 (Book) | ~50ms |
| POST /users/login | 1 (User) | ~100ms (bcrypt) |
| POST /users/register | 1 (User) | ~150ms (bcrypt) |
| POST /borrows | 4 (Borrow, User, Book, Logging) | ~200-300ms |
| PUT /borrows/:id/return | 3 (Borrow, Book, Logging) | ~150-200ms |
| GET /users/me | 1 (User) | ~50ms |

### Latency Breakdown (POST /borrows):

```
Total: ~250ms
├─ Gateway routing: 10ms
├─ Verify user: 50ms
├─ Check book: 50ms
├─ Update book (atomic): 60ms
├─ Create borrow: 40ms
└─ Log activity: 40ms
```

---

## 🎯 Summary

### Key Data Flow Patterns:

1. **Client → Gateway → Service → Database**
   - Standard CRUD operations
   - Single service involvement

2. **Client → Gateway → Service A → Service B,C,D → Database**
   - Complex transactions (Borrow/Return)
   - Multiple service orchestration

3. **Service → Service Communication**
   - Synchronous HTTP calls
   - JWT token forwarding
   - Error propagation

4. **Race Condition Protection**
   - Atomic MongoDB operations
   - Optimistic locking with conditions

5. **Error Handling**
   - Try/catch at service level
   - Global error handler middleware
   - Proper HTTP status codes

---

## 🔗 Related Documentation:

- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

<div align="center">

**Data flows seamlessly through SOA architecture** 🔄

</div>
