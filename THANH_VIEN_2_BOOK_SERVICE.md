# 📚 HƯỚNG DẪN BOOK SERVICE - THÀNH VIÊN 2

## 🎯 Nhiệm vụ của bạn: Quản lý Sách

Bạn chịu trách nhiệm làm **Book Service** - Service quản lý thông tin sách trong thư viện.

---

## 📁 1. CẤU TRÚC THỨ MỤC

```
book-service/
├── server.js              ← File chạy service
├── models/
│   └── Book.js           ← Định nghĩa sách gồm những gì
├── controllers/
│   └── bookController.js ← Code xử lý logic (QUAN TRỌNG NHẤT!)
└── routes/
    └── bookRoutes.js     ← Định nghĩa các đường dẫn API
```

### 📝 Giải thích từng thư mục:

| Thư mục | Chức năng | Ví dụ |
|---------|-----------|-------|
| **models/** | Định nghĩa sách có những thông tin gì | Sách có: tên, tác giả, số lượng... |
| **controllers/** | Code xử lý logic nghiệp vụ | Tạo sách mới, xóa sách, cập nhật... |
| **routes/** | Định nghĩa URL để gọi API | `/books` để lấy danh sách sách |
| **server.js** | Khởi động service | Chạy service trên port 5002 |

---

## 📖 2. FILE BOOK MODEL (Book.js)

**Mục đích:** Định nghĩa 1 cuốn sách gồm những thông tin gì

```javascript
// Một cuốn sách gồm:
{
  title: "Tên sách",              // Ví dụ: "Harry Potter"
  author: "Tác giả",              // Ví dụ: "J.K. Rowling"
  isbn: "Mã sách",                // Ví dụ: "978-0439708180"
  publishedYear: 2001,            // Năm xuất bản
  genre: "Thể loại",              // Ví dụ: "Fantasy"
  totalCopies: 10,                // Tổng số sách trong thư viện
  availableCopies: 10             // Số sách còn lại (chưa ai mượn)
}
```

**Bạn chỉ cần biết:** Sách có những thông tin trên, MongoDB sẽ tự động lưu.

---

## 🎮 3. FILE CONTROLLER (bookController.js)

**Đây là file QUAN TRỌNG NHẤT!** Chứa tất cả code xử lý.

### 📋 Danh sách 6 methods (hàm):

| STT | Tên Method | Chức năng | URL |
|-----|-----------|-----------|-----|
| 1 | `createBook` | ✅ Tạo sách mới (Admin) | `POST /books` |
| 2 | `getBooks` | 📚 Xem danh sách sách | `GET /books` |
| 3 | `getBookById` | 🔍 Xem chi tiết 1 cuốn sách | `GET /books/:id` |
| 4 | `updateBook` | ✏️ Sửa thông tin sách (Admin) | `PUT /books/:id` |
| 5 | `deleteBook` | ❌ Xóa sách (Admin) | `DELETE /books/:id` |
| 6 | `updateBookCopies` | 🔒 Cập nhật số lượng sách (ATOMIC) | `PUT /books/:id/copies` |

---

### 📝 Chi tiết từng method:

#### **1. createBook** - Tạo sách mới

```javascript
// Chức năng: Admin tạo sách mới
// Input: Thông tin sách (title, author, isbn...)
// Output: Sách vừa tạo

Ví dụ:
- Admin nhập: Tên = "Harry Potter", Tác giả = "J.K. Rowling"
- Code lưu vào database
- Trả về thông tin sách vừa tạo
```

**Ai dùng được:** Chỉ Admin

---

#### **2. getBooks** - Xem danh sách sách

```javascript
// Chức năng: Xem tất cả sách trong thư viện
// Input: Không cần gì (hoặc có thể phân trang)
// Output: Danh sách sách

Ví dụ:
- User vào trang chủ
- Code lấy tất cả sách từ database
- Trả về [Sách 1, Sách 2, Sách 3...]
```

**Ai dùng được:** Ai cũng được (không cần đăng nhập)

---

#### **3. getBookById** - Xem chi tiết 1 sách

```javascript
// Chức năng: Xem thông tin chi tiết 1 cuốn sách
// Input: ID của sách
// Output: Thông tin chi tiết sách đó

Ví dụ:
- User click vào sách "Harry Potter"
- Code tìm sách theo ID
- Trả về: Tên, tác giả, số lượng còn...
```

**Ai dùng được:** Ai cũng được

---

#### **4. updateBook** - Sửa thông tin sách

```javascript
// Chức năng: Admin sửa thông tin sách
// Input: ID sách + Thông tin mới
// Output: Sách đã được cập nhật

Ví dụ:
- Admin sửa giá sách từ 100k → 120k
- Code cập nhật vào database
- Trả về thông tin sách mới
```

**Ai dùng được:** Chỉ Admin

---

#### **5. deleteBook** - Xóa sách

```javascript
// Chức năng: Admin xóa sách khỏi thư viện
// Input: ID sách
// Output: Thông báo xóa thành công

Ví dụ:
- Admin click nút "Xóa" sách cũ
- Code xóa sách khỏi database
- Trả về: "Book deleted successfully"
```

**Ai dùng được:** Chỉ Admin

---

#### **6. updateBookCopies** - Cập nhật số lượng sách (QUAN TRỌNG!)

**Đây là method ĐẶC BIỆT và QUAN TRỌNG NHẤT!**

```javascript
// Chức năng: Cập nhật số sách còn lại
// Input: ID sách + Số lượng mới + atomic (true/false)
// Output: Sách đã cập nhật

🔒 ATOMIC MODE (quan trọng!):
- Khi atomic = true: Chỉ cập nhật nếu còn sách (availableCopies > 0)
- Mục đích: Tránh 2 người cùng mượn sách cuối cùng

Ví dụ tình huống:
┌─────────────────────────────────────────────┐
│ Sách "Harry Potter" còn 1 cuốn              │
├─────────────────────────────────────────────┤
│ User A: Muốn mượn ✅                        │
│ User B: Muốn mượn ✅ (cùng lúc)             │
├─────────────────────────────────────────────┤
│ ATOMIC giải quyết:                          │
│ - User A mượn → OK ✅ (còn 0 cuốn)         │
│ - User B mượn → LỖI ❌ (hết sách rồi!)     │
└─────────────────────────────────────────────┘
```

**Code hoạt động như thế nào:**

```javascript
if (atomic === true) {
  // 🔒 Chỉ cập nhật nếu availableCopies > 0
  book = await Book.findOneAndUpdate(
    { 
      _id: req.params.id,
      availableCopies: { $gt: 0 }  // ← Điều kiện: phải > 0
    },
    { availableCopies },
    { new: true }
  );

  if (!book) {
    // Không tìm thấy → nghĩa là hết sách rồi!
    return res.status(409).json({ 
      message: "Book not available",
      success: false
    });
  }
}
```

**Tại sao cần ATOMIC?**

```
Không có ATOMIC:
User A: Check → Còn 1 cuốn ✅
User B: Check → Còn 1 cuốn ✅ (sai rồi!)
User A: Mượn → Còn 0 cuốn
User B: Mượn → Còn -1 cuốn ❌ (BUG!)

Có ATOMIC:
User A: Mượn atomic → OK ✅ (còn 0 cuốn)
User B: Mượn atomic → FAIL ❌ (database báo hết sách)
```

**Ai dùng được:** Borrow Service (khi user mượn/trả sách)

---

## 🛣️ 4. FILE ROUTES (bookRoutes.js)

**Mục đích:** Kết nối URL với method trong controller

```javascript
// Đơn giản thôi:
// 1. Import các methods từ controller
const { createBook, getBooks, updateBook, ... } = require("./controllers/bookController");

// 2. Kết nối URL với method
router.post("/books", authMiddleware, adminOnly, createBook);
//      ↑ URL         ↑ Check login  ↑ Check admin  ↑ Method xử lý
```

**Bảng kết nối:**

| URL | Method HTTP | Ai được dùng? | Gọi method nào? |
|-----|-------------|---------------|-----------------|
| `/books` | POST | Admin | `createBook` |
| `/books` | GET | Ai cũng được | `getBooks` |
| `/books/:id` | GET | Ai cũng được | `getBookById` |
| `/books/:id` | PUT | Admin | `updateBook` |
| `/books/:id` | DELETE | Admin | `deleteBook` |
| `/books/:id/copies` | PUT | Borrow Service | `updateBookCopies` |

---

## 🚀 5. FILE SERVER (server.js)

**Mục đích:** Khởi động service

```javascript
// 1. Import routes
const bookRoutes = require("./routes/bookRoutes");

// 2. Kết nối routes vào server
app.use("/", bookRoutes);
//      ↑ Tất cả requests đến /books sẽ đi vào bookRoutes

// 3. Chạy server trên port 5002
app.listen(5002, () => {
  console.log("Book Service đang chạy!");
});

// 4. Đăng ký với Consul (tự động)
registerService({
  name: "book-service",
  port: 5002
});
```

---

## 🔄 6. LUỒNG HOẠT ĐỘNG (Flow)

### Ví dụ: User muốn xem danh sách sách

```
1. User vào trang web
   ↓
2. Frontend gọi: GET http://localhost:5000/books
   ↓
3. API Gateway nhận request
   ↓
4. Gateway hỏi Consul: "Book Service ở đâu?"
   ↓
5. Consul trả lời: "Ở localhost:5002"
   ↓
6. Gateway chuyển request đến: http://localhost:5002/books
   ↓
7. Book Service nhận request
   ↓
8. server.js → bookRoutes.js → bookController.js → getBooks()
   ↓
9. getBooks() lấy sách từ database
   ↓
10. Trả về danh sách sách cho Frontend
```

---

## 🎯 7. NHIỆM VỤ CỤ THỂ CỦA BẠN

### ✅ Checklist công việc:

```
[ ] 1. Hiểu cấu trúc thư mục (models, controllers, routes, server.js)

[ ] 2. Viết Book Model (Book.js)
    - Định nghĩa các field: title, author, isbn...

[ ] 3. Viết bookController.js với 6 methods:
    [ ] createBook       - Tạo sách mới
    [ ] getBooks         - Lấy danh sách sách
    [ ] getBookById      - Lấy 1 sách
    [ ] updateBook       - Sửa sách
    [ ] deleteBook       - Xóa sách
    [ ] updateBookCopies - Cập nhật số lượng (ATOMIC) ⭐

[ ] 4. Viết bookRoutes.js
    - Kết nối 6 URLs với 6 methods

[ ] 5. Viết server.js
    - Import routes
    - Kết nối routes vào server
    - Chạy server trên port 5002
    - Đăng ký với Consul

[ ] 6. Test tất cả endpoints bằng Postman
```

---

## 💡 8. TIPS CHO BẠN

### 🎯 Method nào QUAN TRỌNG NHẤT?

**`updateBookCopies`** - Method này có ATOMIC operation để tránh bug khi 2 người cùng mượn sách cuối cùng.

### 🎯 Method nào DỄ NHẤT?

**`getBookById`** - Chỉ cần tìm sách theo ID và trả về thôi.

### 🎯 Code mẫu đơn giản cho `getBookById`:

```javascript
const getBookById = async (req, res) => {
  try {
    // 1. Lấy ID từ URL
    const bookId = req.params.id;
    
    // 2. Tìm sách trong database
    const book = await Book.findById(bookId);
    
    // 3. Nếu không tìm thấy
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    // 4. Trả về sách
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**Giải thích:**
- `req.params.id` → Lấy ID từ URL (ví dụ: `/books/123` → id = 123)
- `Book.findById()` → Tìm sách trong MongoDB
- `res.json(book)` → Trả kết quả về cho Frontend

---

## 🔗 9. KẾT NỐI GIỮA CÁC FILE

```
┌──────────────────────────────────────────────────────┐
│                    server.js                         │
│  - Khởi động service                                 │
│  - Import bookRoutes                                 │
│  - app.use("/", bookRoutes)                          │
└─────────────────┬────────────────────────────────────┘
                  │ import
                  ↓
┌──────────────────────────────────────────────────────┐
│                 bookRoutes.js                        │
│  - Import các methods từ bookController              │
│  - Kết nối URL với methods                           │
│  - router.get("/books", getBooks)                    │
└─────────────────┬────────────────────────────────────┘
                  │ import
                  ↓
┌──────────────────────────────────────────────────────┐
│              bookController.js                       │
│  - Chứa 6 methods xử lý logic                        │
│  - createBook, getBooks, updateBook...               │
│  - Tương tác với Book Model                          │
└─────────────────┬────────────────────────────────────┘
                  │ sử dụng
                  ↓
┌──────────────────────────────────────────────────────┐
│                   Book.js (Model)                    │
│  - Định nghĩa cấu trúc sách                          │
│  - title, author, isbn, copies...                    │
│  - Tương tác với MongoDB                             │
└──────────────────────────────────────────────────────┘
```

---

## 📚 10. TÀI LIỆU THAM KHẢO

### Khi code, bạn cần dùng:

**1. Mongoose (tương tác MongoDB):**
```javascript
// Tìm tất cả sách
const books = await Book.find();

// Tìm 1 sách theo ID
const book = await Book.findById(id);

// Tạo sách mới
const book = await Book.create({ title, author... });

// Cập nhật sách
const book = await Book.findByIdAndUpdate(id, newData, { new: true });

// Xóa sách
await Book.findByIdAndDelete(id);

// Cập nhật có điều kiện (ATOMIC)
const book = await Book.findOneAndUpdate(
  { _id: id, availableCopies: { $gt: 0 } },
  { availableCopies: newValue },
  { new: true }
);
```

**2. Express Response:**
```javascript
// Trả về thành công (200)
res.json(data);

// Trả về created (201)
res.status(201).json(data);

// Trả về not found (404)
res.status(404).json({ message: "Not found" });

// Trả về conflict (409)
res.status(409).json({ message: "Conflict" });

// Trả về error (500)
res.status(500).json({ message: "Server error" });
```

---

## ❓ 11. CÂU HỎI THƯỜNG GẶP

### Q1: Tại sao cần method `updateBookCopies` riêng?

**A:** Vì Borrow Service cần gọi để cập nhật số sách khi user mượn/trả. Không thể dùng `updateBook` vì cần ATOMIC operation.

---

### Q2: ATOMIC operation là gì?

**A:** Là cách đảm bảo chỉ 1 người mượn được sách cuối cùng. Code sẽ kiểm tra "còn sách không?" và "giảm số lượng" trong 1 bước duy nhất, không ai chen ngang được.

---

### Q3: Tại sao có methods cho Admin và methods cho ai cũng dùng được?

**A:** 
- **Admin methods:** Tạo/Sửa/Xóa sách (nguy hiểm, cần bảo vệ)
- **Public methods:** Xem sách (ai cũng được xem)

---

### Q4: Làm sao test method `updateBookCopies` với ATOMIC?

**A:** Dùng 2 terminal, chạy 2 requests cùng lúc:

```bash
# Terminal 1
curl -X PUT http://localhost:5002/books/123/copies \
  -H "Content-Type: application/json" \
  -d '{"availableCopies": 0, "atomic": true}'

# Terminal 2 (chạy cùng lúc)
curl -X PUT http://localhost:5002/books/123/copies \
  -H "Content-Type: application/json" \
  -d '{"availableCopies": 0, "atomic": true}'
```

**Kết quả mong đợi:** 1 request thành công, 1 request lỗi 409.

---

## 🎓 12. KẾT LUẬN

**Tóm tắt nhiệm vụ:**
1. ✅ Làm Book Service với 6 methods CRUD
2. ✅ Đặc biệt chú ý `updateBookCopies` với ATOMIC operation
3. ✅ Kết nối Controller → Routes → Server
4. ✅ Test tất cả endpoints

**Điểm đặc biệt của Book Service:**
- 🔒 **ATOMIC operation** - Xử lý race condition khi mượn sách
- 📚 **CRUD đầy đủ** - Create, Read, Update, Delete
- 🔐 **Phân quyền rõ ràng** - Admin vs Public

**Nếu bạn làm tốt phần ATOMIC operation, đây sẽ là điểm nhấn khi demo!** 🌟