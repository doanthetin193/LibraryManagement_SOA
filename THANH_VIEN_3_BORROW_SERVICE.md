# 📖 HƯỚNG DẪN BORROW SERVICE - THÀNH VIÊN 3

## 🎯 Nhiệm vụ của bạn: Quản lý Mượn/Trả Sách

Bạn chịu trách nhiệm **Borrow Service** - Service xử lý nghiệp vụ mượn và trả sách, có **giao tiếp với 2 services khác** (User Service & Book Service).

**Độ khó:** ⭐⭐⭐⭐⭐ (Khó nhất trong 3 services!)

---

## 📁 1. CẤU TRÚC THƯ MỤC

```
borrow-service/
├── server.js                      ← Khởi động service
├── models/
│   └── Borrow.js                  ← Model định nghĩa borrow record
├── controllers/
│   └── borrowController.js        ← Logic nghiệp vụ (PHỨC TẠP!)
├── routes/
│   └── borrowRoutes.js            ← Routes định nghĩa
└── helpers/
    └── serviceClient.js           ← Giao tiếp với services khác (QUAN TRỌNG!)
```

### 🔑 Thư mục đặc biệt: `helpers/`

**`serviceClient.js`** - Đây là phần QUAN TRỌNG NHẤT và là điểm khác biệt so với Book Service!

Chứa 4 functions gọi API sang services khác:
- `getCurrentUser()` → Lấy user hiện tại từ User Service
- `getUserById()` → Lấy user theo ID từ User Service
- `getBookById()` → Lấy thông tin sách từ Book Service
- `updateBookCopies()` → Cập nhật số sách (với atomic) từ Book Service

---

## 📊 2. TỔNG QUAN LUỒNG HOẠT ĐỘNG

### Khi user mượn sách:

```
Frontend
   ↓ POST /borrows (bookId, token)
API Gateway
   ↓
Borrow Service
   ↓
┌─────────────────────────────────────────────────────┐
│ 1. Gọi Book Service: Lấy thông tin sách            │
│    → getBookById(bookId)                            │
│                                                     │
│ 2. Kiểm tra: Còn sách không?                       │
│    → if (availableCopies <= 0) → Error             │
│                                                     │
│ 3. Gọi Book Service: Giảm số sách (ATOMIC)        │
│    → updateBookCopies(bookId, copies-1, true)      │
│                                                     │
│ 4. Nếu atomic fail (409) → Error race condition   │
│                                                     │
│ 5. Tạo borrow record trong DB                      │
│                                                     │
│ 6. Gọi Logging Service: Ghi log                    │
│                                                     │
│ 7. Return borrow record                            │
└─────────────────────────────────────────────────────┘
```

**Đặc điểm:** Cần gọi 2-3 services khác trong 1 request!

---

## 🗂️ 3. BORROW MODEL (Borrow.js)

```javascript
{
  user: ObjectId,           // ID của user mượn (ref: User)
  book: ObjectId,           // ID của sách (ref: Book)
  borrowDate: Date,         // Ngày mượn (default: now)
  returnDate: Date,         // Ngày trả (null nếu chưa trả)
  status: String,           // "borrowed" hoặc "returned"
  createdAt: Date
}
```

**Lưu ý:** Model chỉ lưu ID, không lưu thông tin chi tiết user/book. Phải gọi service khác để lấy!

---

## 🔧 4. SERVICE CLIENT (helpers/serviceClient.js)

### 4.1. Cấu hình

```javascript
const API_GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:5000";
const USER_SERVICE_URL = `${API_GATEWAY_URL}/users`;
const BOOK_SERVICE_URL = `${API_GATEWAY_URL}/books`;
```

**Quan trọng:** Tất cả requests đều đi qua API Gateway, KHÔNG gọi trực tiếp service!

---

### 4.2. Function `getCurrentUser(token)`

**Mục đích:** Lấy thông tin user hiện tại từ token

```javascript
const getCurrentUser = async (token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 3000  // ← Timeout 3s để tránh block
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};
```

**Khi nào dùng:** Khi cần verify user có quyền không (ít dùng vì đã có JWT middleware)

---

### 4.3. Function `getUserById(userId, token)`

**Mục đích:** Lấy thông tin user theo ID (dùng cho admin xem borrows)

```javascript
const getUserById = async (userId, token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 3000
    });
    return response.data;
  } catch (error) {
    // ⚠️ Fallback: Nếu lỗi, trả về user mặc định
    return {
      _id: userId,
      username: "Unknown User",
      role: "user"
    };
  }
};
```

**Đặc điểm:** Có fallback để tránh crash nếu User Service down

**Khi nào dùng:** Trong `getAllBorrows()` để lấy thông tin user cho admin

---

### 4.4. Function `getBookById(bookId)`

**Mục đích:** Lấy thông tin sách từ Book Service

```javascript
const getBookById = async (bookId) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_URL}/${bookId}`, {
      timeout: 3000
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get book: ${error.message}`);
  }
};
```

**Khi nào dùng:** 
- Trong `borrowBook()` → Kiểm tra sách còn không
- Trong `returnBook()` → Lấy availableCopies hiện tại để +1

---

### 4.5. Function `updateBookCopies(bookId, availableCopies, atomic)` ⭐⭐⭐⭐⭐

**Đây là function QUAN TRỌNG NHẤT!**

```javascript
const updateBookCopies = async (bookId, availableCopies, atomic = false) => {
  try {
    const response = await axios.put(
      `${BOOK_SERVICE_URL}/${bookId}/copies`, 
      { availableCopies, atomic },
      { timeout: 3000 }
    );
    
    // 🔒 Kiểm tra atomic operation thành công chưa
    if (atomic && response.data.success === false) {
      return null; // Race condition: sách đã hết
    }
    
    return response.data;
  } catch (error) {
    // Nếu là 409 (conflict) trong atomic mode → trả về null
    if (atomic && error.response?.status === 409) {
      return null;
    }
    throw new Error(`Failed to update book: ${error.message}`);
  }
};
```

**Tham số:**
- `bookId` - ID sách cần update
- `availableCopies` - Số lượng mới
- `atomic` - true = dùng atomic (borrow), false = bình thường (return)

**Return:**
- `book object` - Nếu thành công
- `null` - Nếu atomic fail (race condition)
- `throw Error` - Nếu lỗi khác

**Khi nào dùng:**
- `borrowBook()` → atomic = true
- `returnBook()` → atomic = false

---

## 🎮 5. CONTROLLER - BORROW BOOK (borrowBook)

**Đây là method PHỨC TẠP NHẤT!**

### 5.1. Flow chi tiết

```javascript
const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    // BƯỚC 1: Validate input
    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    // BƯỚC 2: Lấy thông tin sách từ Book Service
    const book = await getBookById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // BƯỚC 3: Kiểm tra còn sách không
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "No copies available" });
    }

    // BƯỚC 4: 🔒 ATOMIC - Giảm số lượng sách
    const updated = await updateBookCopies(
      bookId, 
      book.availableCopies - 1, 
      true  // ← atomic = true
    );
    
    // BƯỚC 5: Kiểm tra atomic có thành công không
    if (!updated) {
      // Race condition: Người khác đã mượn trước rồi!
      return res.status(409).json({ 
        message: "Book was just borrowed by another user. Please try again.",
        code: "RACE_CONDITION"
      });
    }

    // BƯỚC 6: Tạo borrow record (chỉ khi đã giảm số sách thành công)
    const borrow = await Borrow.create({
      user: req.user.id,
      book: bookId,
    });

    // BƯỚC 7: Ghi log
    await sendLog(
      "Borrow Service",
      "BORROW_BOOK",
      { id: req.user.id, username: req.user.username },
      { bookId, borrowId: borrow._id },
      "info"
    );

    // BƯỚC 8: Trả về borrow record
    res.status(201).json(borrow);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### 5.2. Xử lý Race Condition

**Tình huống:**
```
Sách "Harry Potter" còn 1 cuốn
User A và User B cùng click "Mượn" trong cùng 1 giây
```

**Không có ATOMIC:**
```
1. User A: Lấy thông tin sách → availableCopies = 1 ✅
2. User B: Lấy thông tin sách → availableCopies = 1 ✅ (vẫn 1!)
3. User A: Giảm sách → availableCopies = 0 ✅
4. User B: Giảm sách → availableCopies = -1 ❌ (BUG!)
```

**Có ATOMIC:**
```
1. User A: Lấy thông tin sách → availableCopies = 1 ✅
2. User B: Lấy thông tin sách → availableCopies = 1 ✅
3. User A: ATOMIC giảm sách → OK ✅ (availableCopies = 0)
4. User B: ATOMIC giảm sách → FAIL ❌ (Book Service trả 409)
5. User B nhận error: "Book was just borrowed by another user"
```

**Atomic được xử lý ở đâu?**
- Book Service: `findOneAndUpdate({ availableCopies: { $gt: 0 } })`
- Borrow Service: Kiểm tra `if (!updated)` → return 409

---

## 🔄 6. CONTROLLER - RETURN BOOK (returnBook)

**Đơn giản hơn borrowBook, không cần atomic**

```javascript
const returnBook = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    // BƯỚC 1: Tìm borrow record
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    // BƯỚC 2: Kiểm tra quyền (chỉ user mượn hoặc admin mới trả được)
    const userId = borrow.user._id ? borrow.user._id.toString() : borrow.user.toString();
    if (userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // BƯỚC 3: Kiểm tra đã trả chưa
    if (borrow.status === "returned") {
      return res.status(400).json({ message: "Book already returned" });
    }

    // BƯỚC 4: Lấy thông tin sách để biết availableCopies hiện tại
    const book = await getBookById(borrow.book);

    // BƯỚC 5: Cập nhật borrow status
    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    // BƯỚC 6: Tăng số lượng sách (KHÔNG dùng atomic)
    await updateBookCopies(borrow.book, book.availableCopies + 1);
    //                                                           ↑ atomic = false (default)

    // BƯỚC 7: Ghi log
    await sendLog(
      "Borrow Service",
      "RETURN_BOOK",
      { id: req.user.id, username: req.user.username },
      { bookId: borrow.book, borrowId: borrow._id },
      "info"
    );

    // BƯỚC 8: Trả về borrow record đã update
    res.json(borrow);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**Tại sao return không cần atomic?**
- Không có race condition khi trả sách
- Tăng số lượng không bao giờ gây lỗi âm

---

## 📋 7. CONTROLLER - GET ALL BORROWS (getAllBorrows) ⭐⭐⭐⭐⭐

**Đây là method PHỨC TẠP THỨ 2!**

### 7.1. Vấn đề

Admin muốn xem tất cả borrows với thông tin đầy đủ:
```javascript
{
  user: { username: "john", role: "user" },      // ← Cần gọi User Service
  book: { title: "Harry Potter", author: "..." }, // ← Cần gọi Book Service
  borrowDate: "2024-11-05",
  status: "borrowed"
}
```

Nhưng trong DB chỉ có:
```javascript
{
  user: "userId123",  // ← Chỉ có ID!
  book: "bookId456",  // ← Chỉ có ID!
  borrowDate: "2024-11-05",
  status: "borrowed"
}
```

**Giải pháp:** Gọi User Service và Book Service để lấy thông tin đầy đủ (Data Enrichment)

### 7.2. Code chi tiết

```javascript
const getAllBorrows = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    // BƯỚC 1: Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // BƯỚC 2: Lấy borrows từ DB
    const total = await Borrow.countDocuments();
    const borrows = await Borrow.find()
      .sort({ createdAt: -1 })  // Mới nhất trước
      .skip(skip)
      .limit(limit);
    
    // BƯỚC 3: Extract unique IDs để tối ưu API calls
    const userIds = [...new Set(borrows.map(b => b.user))];
    const bookIds = [...new Set(borrows.map(b => b.book))];
    
    // Ví dụ: 
    // - 10 borrows có thể có 3 users và 5 books
    // - Thay vì gọi 20 requests, chỉ gọi 8 requests!

    // BƯỚC 4: Parallel fetch (gọi đồng thời để nhanh)
    const [usersResults, booksResults] = await Promise.allSettled([
      Promise.allSettled(userIds.map(id => getUserById(id, token))),
      Promise.allSettled(bookIds.map(id => getBookById(id)))
    ]);

    // BƯỚC 5: Tạo lookup maps
    const usersMap = new Map();
    const booksMap = new Map();

    // Populate usersMap
    if (usersResults.status === 'fulfilled') {
      userIds.forEach((id, index) => {
        const result = usersResults.value[index];
        usersMap.set(id.toString(), 
          result.status === 'fulfilled' 
            ? result.value 
            : { _id: id, username: "Unknown User", role: "user" }
        );
      });
    }

    // Populate booksMap
    if (booksResults.status === 'fulfilled') {
      bookIds.forEach((id, index) => {
        const result = booksResults.value[index];
        booksMap.set(id.toString(), 
          result.status === 'fulfilled' 
            ? result.value 
            : { _id: id, title: "Unknown Book" }
        );
      });
    }

    // BƯỚC 6: Enrich borrows với user và book data
    const enrichedBorrows = borrows.map(b => ({
      ...b.toObject(),
      user: usersMap.get(b.user.toString()),
      book: booksMap.get(b.book.toString())
    }));

    // BƯỚC 7: Return với pagination
    res.json({
      data: enrichedBorrows,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### 7.3. Kỹ thuật quan trọng

#### **A. Promise.allSettled vs Promise.all**

```javascript
// ❌ Promise.all - Nếu 1 promise fail → tất cả fail
const results = await Promise.all([call1(), call2(), call3()]);

// ✅ Promise.allSettled - Cho phép 1 số fail, vẫn lấy được kết quả
const results = await Promise.allSettled([call1(), call2(), call3()]);
// results = [
//   { status: 'fulfilled', value: data1 },
//   { status: 'rejected', reason: error },
//   { status: 'fulfilled', value: data3 }
// ]
```

**Tại sao dùng allSettled?**
- Nếu 1 service down → Vẫn lấy được data từ services khác
- Fallback cho missing data

#### **B. Parallel API Calls**

```javascript
// ❌ Sequential (chậm)
for (let id of userIds) {
  const user = await getUserById(id);  // Chờ từng cái
}
// Tổng thời gian = 3s × 10 users = 30s

// ✅ Parallel (nhanh)
const users = await Promise.allSettled(
  userIds.map(id => getUserById(id))
);
// Tổng thời gian = 3s (gọi đồng thời)
```

#### **C. Lookup Maps**

```javascript
// ❌ Tìm kiếm O(n²) - chậm
borrows.forEach(b => {
  const user = users.find(u => u._id === b.user);  // Tìm mỗi lần
});

// ✅ Lookup Map O(1) - nhanh
const usersMap = new Map();
users.forEach(u => usersMap.set(u._id, u));
borrows.forEach(b => {
  const user = usersMap.get(b.user);  // Instant lookup
});
```

---

## 📋 8. CONTROLLER - GET MY BORROWS (getMyBorrows)

**Đơn giản hơn getAllBorrows vì không cần gọi User Service**

```javascript
const getMyBorrows = async (req, res) => {
  try {
    // BƯỚC 1: Lấy borrows của user hiện tại
    const borrows = await Borrow.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    // BƯỚC 2: Lấy book IDs
    const bookIds = [...new Set(borrows.map(b => b.book))];
    
    // BƯỚC 3: Parallel fetch books
    const booksResults = await Promise.allSettled(
      bookIds.map(id => getBookById(id))
    );
    
    // BƯỚC 4: Create books map
    const booksMap = new Map();
    bookIds.forEach((id, index) => {
      const result = booksResults[index];
      booksMap.set(id.toString(), 
        result.status === 'fulfilled' 
          ? result.value 
          : { _id: id, title: "Unknown Book" }
      );
    });
    
    // BƯỚC 5: Enrich borrows
    const enrichedBorrows = borrows.map(b => ({
      ...b.toObject(),
      book: booksMap.get(b.book.toString())
    }));
    
    res.json(enrichedBorrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**Đơn giản hơn vì:**
- Không cần user data (đã biết là user hiện tại)
- Không cần pagination (user thường có ít borrows)

---

## 🛣️ 9. ROUTES (borrowRoutes.js)

```javascript
const express = require("express");
const router = express.Router();
const { authMiddleware, adminOnly } = require("../../shared/middlewares/authMiddleware");
const {
  borrowBook,
  returnBook,
  getMyBorrows,
  getAllBorrows
} = require("../controllers/borrowController");

// User routes (cần đăng nhập)
router.post("/", authMiddleware, borrowBook);           // Mượn sách
router.put("/:id/return", authMiddleware, returnBook);  // Trả sách
router.get("/me", authMiddleware, getMyBorrows);        // Xem borrows của mình

// Admin routes (cần admin)
router.get("/", authMiddleware, adminOnly, getAllBorrows); // Xem tất cả borrows

module.exports = router;
```

**Lưu ý thứ tự:** `/me` phải đặt trước `/:id` để tránh conflict!

---

## 🚀 10. SERVER (server.js)

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../../shared/config/db");
const borrowRoutes = require("./routes/borrowRoutes");
const { errorHandler } = require("../../shared/middlewares/errorHandler");
const { registerService, setupGracefulShutdown, isConsulAvailable } = require("../../shared/config/consulClient");

dotenv.config();
connectDB("Borrow Service");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Borrow Service", 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Routes
app.use("/", borrowRoutes);

// Error handling
app.use(errorHandler("Borrow Service"));

const PORT = process.env.BORROW_PORT || 5003;
const SERVICE_NAME = "borrow-service";

app.listen(PORT, async () => {
  console.log(`🚀 Borrow Service running on port ${PORT}`);
  
  // Register with Consul
  try {
    const consulAvailable = await isConsulAvailable();
    
    if (consulAvailable) {
      await registerService({
        id: `${SERVICE_NAME}-${PORT}`,
        name: SERVICE_NAME,
        address: "localhost",
        port: PORT,
        tags: ["borrow", "transaction", "lending"],
        check: {
          http: `http://localhost:${PORT}/health`,
          interval: "10s",
          timeout: "5s"
        }
      });
      
      setupGracefulShutdown(`${SERVICE_NAME}-${PORT}`);
    }
  } catch (error) {
    console.error("❌ Failed to register with Consul:", error.message);
  }
});
```

---

## ✅ 11. CHECKLIST CÔNG VIỆC

```
[ ] 1. Hiểu cấu trúc và luồng hoạt động

[ ] 2. Viết Borrow Model (Borrow.js)
    - user, book, borrowDate, returnDate, status

[ ] 3. Viết Service Client (helpers/serviceClient.js) ⭐⭐⭐⭐⭐
    [ ] getCurrentUser()
    [ ] getUserById()
    [ ] getBookById()
    [ ] updateBookCopies() với atomic support

[ ] 4. Viết borrowController.js
    [ ] borrowBook() - Mượn sách với atomic protection ⭐⭐⭐⭐⭐
    [ ] returnBook() - Trả sách
    [ ] getMyBorrows() - Xem borrows của user
    [ ] getAllBorrows() - Admin xem tất cả với data enrichment ⭐⭐⭐⭐⭐

[ ] 5. Viết borrowRoutes.js
    - Kết nối 4 routes với controllers
    - Phân quyền đúng (user vs admin)

[ ] 6. Viết server.js
    - Import routes
    - Connect DB
    - Register với Consul

[ ] 7. Test từng endpoint
    [ ] Test borrow với race condition (2 users cùng mượn)
    [ ] Test return
    [ ] Test getMyBorrows
    [ ] Test getAllBorrows với pagination
```

---

## 🧪 12. TESTING

### Test Race Condition (Quan trọng!)

**Chuẩn bị:** Tạo 1 sách có `availableCopies = 1`

**Terminal 1:**
```bash
curl -X POST http://localhost:5000/borrows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_USER_A" \
  -d '{"bookId": "BOOK_ID"}'
```

**Terminal 2:** (chạy đồng thời)
```bash
curl -X POST http://localhost:5000/borrows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_USER_B" \
  -d '{"bookId": "BOOK_ID"}'
```

**Kết quả mong đợi:**
- Terminal 1: `201 Created` ✅
- Terminal 2: `409 Conflict - Book was just borrowed by another user` ✅

---

## 💡 13. TIPS VÀ BEST PRACTICES

### ✅ DO:

1. **Luôn dùng timeout cho API calls**
   ```javascript
   axios.get(url, { timeout: 3000 })
   ```

2. **Dùng Promise.allSettled thay vì Promise.all**
   ```javascript
   await Promise.allSettled([...]) // ✅ Cho phép 1 số fail
   await Promise.all([...])        // ❌ Tất cả phải thành công
   ```

3. **Fallback khi service down**
   ```javascript
   return { _id: userId, username: "Unknown User" } // ✅
   throw new Error("User not found")                // ❌
   ```

4. **Extract unique IDs trước khi gọi API**
   ```javascript
   const userIds = [...new Set(borrows.map(b => b.user))]; // ✅
   ```

### ❌ DON'T:

1. **Không gọi sequential khi có thể parallel**
   ```javascript
   // ❌ Chậm
   for (let id of ids) {
     await getBookById(id);
   }
   
   // ✅ Nhanh
   await Promise.allSettled(ids.map(id => getBookById(id)));
   ```

2. **Không bỏ qua error handling**
   ```javascript
   // ❌
   const book = await getBookById(bookId);
   
   // ✅
   try {
     const book = await getBookById(bookId);
   } catch (error) {
     return res.status(500).json({ message: error.message });
   }
   ```

---

## 🎓 14. KẾT LUẬN

### Điểm mạnh của Borrow Service:

1. ⭐⭐⭐⭐⭐ **Service-to-Service Communication**
   - Gọi 2 services khác (User & Book)
   - Timeout protection
   - Error handling & fallback

2. ⭐⭐⭐⭐⭐ **Race Condition Protection**
   - Atomic operation khi mượn sách
   - Handle 409 conflict từ Book Service

3. ⭐⭐⭐⭐⭐ **Data Enrichment**
   - Parallel API calls
   - Promise.allSettled
   - Lookup maps cho performance

4. ⭐⭐⭐⭐ **Complex Business Logic**
   - 4 methods với logic phức tạp
   - Phân quyền rõ ràng
   - Logging đầy đủ

### Khi demo, nhấn mạnh:

- 🔒 **Race condition protection** - Demo với 2 terminal cùng mượn sách cuối cùng
- 🚀 **Parallel API calls** - Giải thích tối ưu performance
- 🔗 **Service communication** - Giải thích SOA pattern

**Đây là service khó nhất nhưng cũng ấn tượng nhất khi demo!** 🌟
