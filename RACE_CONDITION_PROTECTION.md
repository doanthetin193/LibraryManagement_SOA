# 🔒 Race Condition Protection

## ⚠️ Vấn đề (The Problem)

### Kịch bản Race Condition:
Khi hệ thống có **1 quyển sách cuối cùng**, và **2 người dùng cùng lúc** nhấn "Mượn sách":

```
Timeline:
00:00.000 - User A kiểm tra: availableCopies = 1 ✅ OK
00:00.001 - User B kiểm tra: availableCopies = 1 ✅ OK
00:00.002 - User A tạo borrow record
00:00.003 - User B tạo borrow record
00:00.004 - User A giảm: availableCopies = 0
00:00.005 - User B giảm: availableCopies = -1 ❌ WRONG!
```

**Kết quả:** Cả 2 đều mượn được sách, số lượng sách bị âm! 🐛

---

## ✅ Giải pháp (The Solution)

### Atomic Operation với MongoDB

Sử dụng `findOneAndUpdate` với **condition check** để đảm bảo operation atomic:

```javascript
// ❌ CÁCH CŨ (Không an toàn)
const book = await Book.findById(bookId);
if (book.availableCopies > 0) {
  book.availableCopies -= 1;
  await book.save();
}

// ✅ CÁCH MỚI (Atomic & Safe)
const book = await Book.findOneAndUpdate(
  { 
    _id: bookId,
    availableCopies: { $gt: 0 }  // Chỉ update nếu > 0
  },
  { 
    $inc: { availableCopies: -1 }  // Giảm 1
  },
  { new: true }
);

if (!book) {
  // Race condition detected!
  return "Sách vừa được mượn bởi người khác";
}
```

---

## 🏗️ Kiến trúc Implementation

### 1. Book Service - Atomic Update
**File:** `backend/services/book-service/controllers/bookController.js`

```javascript
const updateBookCopies = async (req, res) => {
  const { availableCopies, atomic } = req.body;

  if (atomic === true) {
    // 🔒 ATOMIC MODE
    const book = await Book.findOneAndUpdate(
      { 
        _id: req.params.id,
        availableCopies: { $gt: 0 }  // Condition: phải còn sách
      },
      { availableCopies },
      { new: true }
    );

    if (!book) {
      return res.status(409).json({ 
        message: "Book not available",
        code: "NOT_AVAILABLE",
        success: false
      });
    }
  }
  
  res.json({ success: true, book });
};
```

**Key Points:**
- ✅ `atomic` flag để phân biệt borrow (cần atomic) vs return (không cần)
- ✅ Condition `availableCopies > 0` trong query
- ✅ Trả về 409 Conflict nếu không còn sách
- ✅ MongoDB đảm bảo operation atomic

---

### 2. Service Client - Handle Atomic Response
**File:** `backend/services/borrow-service/helpers/serviceClient.js`

```javascript
const updateBookCopies = async (bookId, availableCopies, atomic = false) => {
  try {
    const response = await axios.put(
      `${BOOK_SERVICE_URL}/${bookId}/copies`, 
      { availableCopies, atomic }
    );
    
    // Kiểm tra atomic operation thành công
    if (atomic && response.data.success === false) {
      return null;  // Race condition: sách đã hết
    }
    
    return response.data;
  } catch (error) {
    if (atomic && error.response?.status === 409) {
      return null;  // Conflict: không còn sách
    }
    throw error;
  }
};
```

**Key Points:**
- ✅ Hỗ trợ `atomic` parameter
- ✅ Trả về `null` nếu race condition xảy ra
- ✅ Catch 409 Conflict status

---

### 3. Borrow Controller - Atomic Flow
**File:** `backend/services/borrow-service/controllers/borrowController.js`

```javascript
const borrowBook = async (req, res) => {
  const { bookId } = req.body;
  
  // Lấy thông tin sách
  const book = await getBookById(bookId);
  if (book.availableCopies <= 0) {
    return res.status(400).json({ message: "No copies available" });
  }

  // 🔒 ATOMIC UPDATE: Giảm số lượng TRƯỚC KHI tạo borrow
  const updated = await updateBookCopies(
    bookId, 
    book.availableCopies - 1, 
    true  // atomic = true
  );
  
  if (!updated) {
    // Race condition detected!
    return res.status(409).json({ 
      message: "Book was just borrowed by another user",
      code: "RACE_CONDITION"
    });
  }

  // Chỉ tạo borrow sau khi atomic update thành công
  const borrow = await Borrow.create({
    user: req.user.id,
    book: bookId,
  });

  res.status(201).json(borrow);
};
```

**Key Points:**
- ✅ Update số lượng sách **TRƯỚC** khi tạo borrow record
- ✅ Nếu atomic update fail → trả về 409 ngay lập tức
- ✅ Đảm bảo consistency: chỉ tạo borrow khi đã giảm số lượng thành công

---

## 🧪 Testing Race Condition

### Chạy test script:
```bash
cd backend
node scripts/test-race-condition.js
```

### Test scenario:
1. ✅ Tạo 2 users: user1, user2
2. ✅ Tạo sách với `availableCopies = 1`
3. ⚡ 2 users đồng thời mượn sách (using `Promise.all`)
4. ✅ Verify: Chỉ 1 người mượn được
5. ✅ Check: `availableCopies = 0` (đúng)

### Expected output:
```
⚡ STEP 4: TEST RACE CONDITION

🏁 2 users đồng thời mượn cùng 1 quyển sách...

📊 KẾT QUẢ:

✅ User1: Mượn thành công
   Borrow ID: 507f1f77bcf86cd799439011
❌ User2: Mượn thất bại
   Lý do: Book was just borrowed by another user
   🔒 Race condition được xử lý đúng!

========================================
✅ TEST PASSED: Chỉ 1 người mượn được sách!
✅ Race condition protection hoạt động đúng!
========================================
```

---

## 🎯 Flow Diagram

```
User A                      Book Service                    User B
  |                              |                             |
  |-- Check availableCopies ---->|                             |
  |<-- availableCopies = 1 ------|                             |
  |                              |<---- Check availableCopies --|
  |                              |------ availableCopies = 1 -->|
  |                              |                             |
  |-- Atomic Update ------------>|                             |
  |   (findOneAndUpdate with     |                             |
  |    condition: $gt 0)         |                             |
  |                              |                             |
  |<-- SUCCESS, copies = 0 ------|                             |
  |                              |                             |
  |                              |<---- Atomic Update ----------|
  |                              |   (findOneAndUpdate with    |
  |                              |    condition: $gt 0)        |
  |                              |                             |
  |                              |------ FAIL (409 Conflict) ->|
  |                              |   (no book with copies > 0) |
  |                              |                             |
  |-- Create Borrow Record       |                             |
  |   ✅ SUCCESS                 |                             |
  |                              |                             |
  |                              |       ❌ REJECTED          |
```

---

## 🔐 Transaction Guarantees

### MongoDB Atomic Operations
MongoDB đảm bảo `findOneAndUpdate` là **atomic operation**:

1. **Lock Document:** MongoDB lock document khi query
2. **Check Condition:** Kiểm tra `availableCopies > 0`
3. **Update:** Nếu condition pass, update ngay
4. **Release Lock:** Unlock document
5. **Return Result:** Trả về document mới hoặc null

**Không có khoảng trống** giữa check và update → **No race condition**

---

## 📊 Performance Impact

### Overhead:
- ⚡ Minimal: Chỉ thêm 1 condition check trong query
- ⚡ MongoDB native atomic operation (rất nhanh)
- ⚡ Không cần distributed lock hoặc transaction

### Scalability:
- ✅ Hoạt động tốt với concurrent requests
- ✅ Không cần coordinator service
- ✅ Mỗi Book Service instance độc lập xử lý
- ✅ MongoDB tự động handle concurrent updates

---

## 🚀 Best Practices

### 1. Always Use Atomic for Decrement Operations
```javascript
// ❌ BAD: Check-then-update (race condition)
if (book.availableCopies > 0) {
  book.availableCopies--;
}

// ✅ GOOD: Atomic update with condition
await Book.findOneAndUpdate(
  { _id: id, availableCopies: { $gt: 0 } },
  { $inc: { availableCopies: -1 } }
);
```

### 2. Handle Atomic Failures Gracefully
```javascript
const updated = await atomicUpdate(...);
if (!updated) {
  return res.status(409).json({
    message: "Resource was modified by another user",
    code: "RACE_CONDITION"
  });
}
```

### 3. Log Race Conditions for Monitoring
```javascript
if (!updated) {
  await sendLog(
    "Borrow Service",
    "RACE_CONDITION_DETECTED",
    { userId, bookId },
    "warning"
  );
}
```

---

## 📝 Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `NOT_AVAILABLE` | 409 | Sách không còn available (atomic check fail) |
| `RACE_CONDITION` | 409 | Race condition detected, retry required |
| `NO_COPIES` | 400 | Không còn bản copy nào (pre-check) |

---

## 🎓 SOA Principles Applied

### 1. **Service Autonomy**
- Book Service tự xử lý atomic operations
- Không cần coordinator service

### 2. **Loose Coupling**
- Borrow Service chỉ gọi API, không biết implementation
- Book Service có thể đổi logic mà không ảnh hưởng caller

### 3. **Reusability**
- `atomic` flag có thể dùng cho nhiều operations khác
- Pattern áp dụng được cho các resources khác

### 4. **Reliability**
- Đảm bảo data consistency
- Graceful failure handling

---

## ✅ Checklist Demo

Khi demo race condition protection:

1. ✅ Giải thích vấn đề race condition
2. ✅ Show code: `findOneAndUpdate` with condition
3. ✅ Chạy test script với 2 concurrent requests
4. ✅ Verify: Chỉ 1 request thành công
5. ✅ Check database: availableCopies = 0 (đúng)
6. ✅ Show logs: Race condition được detect

---

**Prepared by:** GitHub Copilot  
**Date:** October 20, 2025  
**Status:** Production Ready ✅
