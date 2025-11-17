# Chứng minh: Logging Service KHÔNG vi phạm SOA

## 🎯 Câu hỏi

**Tại sao Logging Service không vi phạm nguyên tắc SOA mặc dù được sử dụng bởi tất cả các services khác?**

---

## ✅ Câu trả lời: 5 Lý do chính

### 1️⃣ **Logging Service là Infrastructure Service (Cross-Cutting Concern)**

**Phân loại services trong SOA:**

```
┌─────────────────────────────────────────┐
│      Business Services Layer            │
│  (Domain Logic - Core Functions)        │
│                                         │
│  User Service  │  Book Service          │
│  Borrow Service                         │
└─────────────────────────────────────────┘
                ↓ ↓ ↓
        (Calls infrastructure)
                ↓ ↓ ↓
┌─────────────────────────────────────────┐
│   Infrastructure Services Layer         │
│  (Cross-Cutting Concerns)               │
│                                         │
│  Logging Service  │  Auth Service       │
│  Monitoring Service                     │
└─────────────────────────────────────────┘
```

**Logging Service thuộc tầng Infrastructure vì:**

- ✅ Không chứa business logic
- ✅ Phục vụ tất cả business services
- ✅ Xử lý cross-cutting concern (logging/audit)

---

### 2️⃣ **Loose Coupling - Không làm Business Services phụ thuộc**

**Code minh chứng:**

```javascript
// backend/shared/utils/logger.js
const sendLog = async (service, action, user, details, level) => {
  try {
    await axios.post(LOGGING_ENDPOINT, logData, {
      timeout: 3000,
    });
  } catch (error) {
    // ✅ SILENTLY FAIL - Logging fail KHÔNG crash service
    console.warn(`Logging failed: ${error.message}`);
    // Business service VẪN tiếp tục hoạt động bình thường
  }
};
```

**Kết quả:**

- Logging Service DOWN → Business services vẫn chạy ✅
- User vẫn register thành công ✅
- Book vẫn create thành công ✅
- Borrow vẫn thực hiện được ✅
- **Chỉ mất log** (acceptable trade-off)

---

### 3️⃣ **Tuân thủ 8 Nguyên tắc SOA**

| Nguyên tắc SOA           | Logging Service                                      | Đạt? |
| ------------------------ | ---------------------------------------------------- | ---- |
| 1. Standardized Contract | REST API: `POST /logs` với JSON format               | ✅   |
| 2. Loose Coupling        | Async + try-catch + silently fail                    | ✅   |
| 3. Abstraction           | Services chỉ biết API endpoint, không biết DB schema | ✅   |
| 4. Reusability           | Dùng bởi User, Book, Borrow, Error Handler           | ✅   |
| 5. Autonomy              | Port 5004 riêng, deploy độc lập                      | ✅   |
| 6. Stateless             | Mỗi log request độc lập                              | ✅   |
| 7. Discoverability       | Đăng ký Consul với tags `["logging", "audit"]`       | ✅   |
| 8. Composability         | Có thể kết hợp với Monitoring/Alert services         | ✅   |

**→ Đạt 8/8 nguyên tắc SOA!**

---

### 4️⃣ **Pattern: Shared Service (Hợp lệ) vs Dependent Service**

**So sánh:**

```javascript
// ❌ DEPENDENT SERVICE (Cần cẩn thận)
// Borrow Service PHỤ THUỘC User Service
const borrowBook = async (userId, bookId) => {
  const user = await getUserById(userId);
  // ↑ Nếu User Service down → Borrow FAIL (business logic phụ thuộc)

  if (!user) throw new Error("User not found");
  // ... create borrow
};

// ✅ SHARED SERVICE (Hoàn toàn hợp lệ)
// Borrow Service GỌI Logging nhưng KHÔNG phụ thuộc
const borrowBook = async (userId, bookId) => {
  // ... business logic ...
  const borrow = await Borrow.create({ user: userId, book: bookId });

  await sendLog("Borrow Service", "BORROW_BOOK", user, { bookId });
  // ↑ Nếu Logging down → Chỉ mất log, business logic VẪN CHẠY ✅

  return borrow;
};
```

---

### 5️⃣ **SOA Best Practice: Centralized Cross-Cutting Concerns**

**Các supporting services hợp lệ trong SOA:**

| Service Type               | Ví dụ                          | Được dùng bởi tất cả services? | Vi phạm SOA? |
| -------------------------- | ------------------------------ | ------------------------------ | ------------ |
| **Logging Service**        | Audit trail, activity logs     | ✅ YES                         | ❌ NO        |
| **Authentication Service** | JWT issuer, token validation   | ✅ YES                         | ❌ NO        |
| **Notification Service**   | Email, SMS, push notifications | ✅ YES                         | ❌ NO        |
| **File Storage Service**   | Upload, CDN, asset management  | ✅ YES                         | ❌ NO        |
| **Monitoring Service**     | Metrics, health checks         | ✅ YES                         | ❌ NO        |

**Nguyên tắc:**

> **Supporting Services được KHUYẾN KHÍCH trong SOA để tránh code duplication và tập trung hóa cross-cutting concerns.**

**Điều kiện:**

- ✅ Loose coupling (async, non-blocking)
- ✅ Error tolerant (silently fail)
- ✅ Không làm business logic phụ thuộc

---

## 📊 Evidence từ Code

### **Logging được sử dụng ở đâu:**

```javascript
// User Service (3 chỗ)
await sendLog("User Service", "REGISTER", user, {}, "info");
await sendLog("User Service", "LOGIN_SUCCESS", user, {}, "info");
await sendLog("User Service", "LOGIN_FAILED", {}, { username }, "warn");

// Book Service (4 chỗ)
await sendLog("Book Service", "CREATE_BOOK", user, { bookId }, "info");
await sendLog("Book Service", "UPDATE_BOOK", user, { bookId }, "info");
await sendLog("Book Service", "DELETE_BOOK", user, { bookId }, "info");
await sendLog("Book Service", "UPDATE_BOOK_COPIES", system, { bookId }, "info");

// Borrow Service (2 chỗ)
await sendLog("Borrow Service", "BORROW_BOOK", user, { bookId }, "info");
await sendLog("Borrow Service", "RETURN_BOOK", user, { bookId }, "info");

// Error Handler (1 chỗ - dùng bởi TẤT CẢ services)
await sendLog(serviceName, "ERROR", user, { error, path }, "error");
```

**→ Tổng cộng: 10+ nơi sử dụng sendLog() trong 4 services**

### **Loose Coupling Implementation:**

```javascript
// backend/shared/utils/logger.js
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:5000";
const LOGGING_ENDPOINT = `${GATEWAY_URL}/logs`; // ✅ Qua Gateway

const sendLog = async (...) => {
  try {
    await axios.post(LOGGING_ENDPOINT, logData, {
      timeout: 3000 // ✅ Timeout để tránh treo
    });
  } catch (error) {
    // ✅ KHÔNG throw error → service chính không bị ảnh hưởng
    console.warn(`Logging failed: ${error.message}`);
  }
};
```

---

## ✅ Kết luận

**Logging Service KHÔNG vi phạm SOA vì:**

1. ✅ **Infrastructure Service** - Không phải business logic
2. ✅ **Cross-Cutting Concern** - Mối quan tâm xuyên suốt hợp lệ
3. ✅ **Loose Coupling** - Async + error tolerant + silently fail
4. ✅ **Non-blocking** - Không làm crash business services
5. ✅ **Tuân thủ 8 nguyên tắc SOA** - Đạt 8/8 tiêu chí
6. ✅ **Best Practice** - Centralized logging được khuyến khích trong SOA

**Nguyên tắc vàng:**

> **"Việc tất cả services gọi Logging Service là ĐÚNG và là Best Practice trong SOA. Điều quan trọng là phải đảm bảo loose coupling và error tolerance."**

---

## 📚 Tham khảo

- SOA Principles: Service Reusability & Service Composability
- Cross-Cutting Concerns Pattern
- Supporting Services vs Business Services
- Centralized Logging Pattern in Microservices/SOA

---

**Tác giả:** LibraryManagement_SOA Project  
**Ngày:** November 18, 2025
