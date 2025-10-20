# 🔒 Race Condition Protection - Quick Reference

## ❓ Vấn đề là gì?

Khi có **1 quyển sách cuối cùng** và **2 người cùng lúc** nhấn "Mượn sách":

```
❌ TRƯỚC KHI FIX:
- User A check: availableCopies = 1 ✅
- User B check: availableCopies = 1 ✅
- User A mượn → availableCopies = 0
- User B mượn → availableCopies = -1 🐛
- Cả 2 đều mượn được!
```

## ✅ Giải pháp

**MongoDB Atomic Operation:**
```javascript
const book = await Book.findOneAndUpdate(
  { 
    _id: bookId,
    availableCopies: { $gt: 0 }  // ⚡ Chỉ update nếu > 0
  },
  { $inc: { availableCopies: -1 } },
  { new: true }
);

if (!book) {
  return "Sách vừa được mượn bởi người khác";
}
```

## 🧪 Test

```bash
cd backend
node scripts/test-race-condition.js
```

**Kết quả mong đợi:**
```
✅ User1: Mượn thành công
❌ User2: Mượn thất bại (Race condition được xử lý đúng!)
```

## 📁 Files Changed

1. `book-service/controllers/bookController.js`
   - Thêm `atomic` flag trong `updateBookCopies`
   - Sử dụng `findOneAndUpdate` với condition

2. `borrow-service/helpers/serviceClient.js`
   - Hỗ trợ `atomic` parameter
   - Handle 409 Conflict response

3. `borrow-service/controllers/borrowController.js`
   - Gọi `updateBookCopies` với `atomic=true`
   - Check result trước khi tạo borrow record

## 🎯 Demo Points

1. ⚡ **Atomic Operation** - MongoDB đảm bảo no race condition
2. 🔒 **Data Consistency** - Số lượng sách không bao giờ bị âm
3. ✅ **Graceful Failure** - User nhận thông báo rõ ràng
4. 🧪 **Tested** - Test script verify correctness

---

**Chi tiết đầy đủ:** Xem `RACE_CONDITION_PROTECTION.md`
