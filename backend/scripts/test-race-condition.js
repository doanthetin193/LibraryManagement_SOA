// Test Race Condition Protection
// Mô phỏng 2 người cùng mượn 1 quyển sách cuối cùng

const axios = require('axios');

const API_BASE = 'http://localhost:5000';

// Thông tin đăng nhập 2 users
const user1Credentials = { username: 'user1', password: 'password123' };
const user2Credentials = { username: 'user2', password: 'password123' };

let token1, token2, bookId;

// Màu sắc cho console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Bước 1: Đăng ký 2 users
async function registerUsers() {
  log('cyan', '\n========================================');
  log('cyan', '🔧 STEP 1: Đăng ký 2 users');
  log('cyan', '========================================\n');

  try {
    // Register user1
    await axios.post(`${API_BASE}/users/register`, {
      ...user1Credentials,
      email: 'user1@test.com'
    });
    log('green', '✅ User1 registered successfully');
  } catch (error) {
    if (error.response?.status === 400) {
      log('yellow', '⚠️  User1 already exists, skipping...');
    } else {
      throw error;
    }
  }

  try {
    // Register user2
    await axios.post(`${API_BASE}/users/register`, {
      ...user2Credentials,
      email: 'user2@test.com'
    });
    log('green', '✅ User2 registered successfully');
  } catch (error) {
    if (error.response?.status === 400) {
      log('yellow', '⚠️  User2 already exists, skipping...');
    } else {
      throw error;
    }
  }
}

// Bước 2: Login 2 users
async function loginUsers() {
  log('cyan', '\n========================================');
  log('cyan', '🔑 STEP 2: Login 2 users để lấy tokens');
  log('cyan', '========================================\n');

  const res1 = await axios.post(`${API_BASE}/users/login`, user1Credentials);
  token1 = res1.data.token;
  log('green', `✅ User1 logged in - Token: ${token1.substring(0, 20)}...`);

  const res2 = await axios.post(`${API_BASE}/users/login`, user2Credentials);
  token2 = res2.data.token;
  log('green', `✅ User2 logged in - Token: ${token2.substring(0, 20)}...`);
}

// Bước 3: Tạo sách với chỉ 1 bản (cần admin token)
async function createTestBook() {
  log('cyan', '\n========================================');
  log('cyan', '📚 STEP 3: Tạo sách test với availableCopies = 1');
  log('cyan', '========================================\n');

  try {
    // Login admin
    const adminRes = await axios.post(`${API_BASE}/users/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;

    // Tạo sách
    const bookRes = await axios.post(`${API_BASE}/books`, {
      title: 'Race Condition Test Book',
      author: 'Test Author',
      isbn: 'TEST-' + Date.now(),
      genre: 'Test',
      totalCopies: 1,
      availableCopies: 1
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    bookId = bookRes.data._id;
    log('green', `✅ Book created successfully`);
    log('blue', `   ID: ${bookId}`);
    log('blue', `   Title: ${bookRes.data.title}`);
    log('blue', `   Available Copies: ${bookRes.data.availableCopies}`);
  } catch (error) {
    log('red', `❌ Failed to create book: ${error.message}`);
    throw error;
  }
}

// Bước 4: 2 users cùng mượn sách đồng thời
async function testRaceCondition() {
  log('cyan', '\n========================================');
  log('cyan', '⚡ STEP 4: TEST RACE CONDITION');
  log('cyan', '========================================\n');
  
  log('yellow', '🏁 2 users đồng thời mượn cùng 1 quyển sách...\n');

  const borrowPromises = [
    axios.post(`${API_BASE}/borrows`, 
      { bookId },
      { headers: { Authorization: `Bearer ${token1}` } }
    ).then(res => ({ user: 'User1', success: true, data: res.data }))
      .catch(err => ({ user: 'User1', success: false, error: err.response?.data })),

    axios.post(`${API_BASE}/borrows`,
      { bookId },
      { headers: { Authorization: `Bearer ${token2}` } }
    ).then(res => ({ user: 'User2', success: true, data: res.data }))
      .catch(err => ({ user: 'User2', success: false, error: err.response?.data }))
  ];

  const results = await Promise.all(borrowPromises);

  log('cyan', '\n📊 KẾT QUẢ:\n');
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  results.forEach(result => {
    if (result.success) {
      log('green', `✅ ${result.user}: Mượn thành công`);
      log('blue', `   Borrow ID: ${result.data._id}`);
    } else {
      log('red', `❌ ${result.user}: Mượn thất bại`);
      log('yellow', `   Lý do: ${result.error?.message || 'Unknown error'}`);
      if (result.error?.code === 'RACE_CONDITION') {
        log('magenta', '   🔒 Race condition được xử lý đúng!');
      }
    }
  });

  log('cyan', '\n========================================');
  if (successCount === 1 && failCount === 1) {
    log('green', '✅ TEST PASSED: Chỉ 1 người mượn được sách!');
    log('green', '✅ Race condition protection hoạt động đúng!');
  } else if (successCount === 2) {
    log('red', '❌ TEST FAILED: Cả 2 người đều mượn được sách!');
    log('red', '❌ Race condition KHÔNG được xử lý!');
  } else {
    log('yellow', '⚠️  TEST INCONCLUSIVE: Không có ai mượn được sách');
  }
  log('cyan', '========================================\n');
}

// Bước 5: Kiểm tra số lượng sách còn lại
async function checkBookStatus() {
  log('cyan', '\n========================================');
  log('cyan', '🔍 STEP 5: Kiểm tra trạng thái sách');
  log('cyan', '========================================\n');

  try {
    const bookRes = await axios.get(`${API_BASE}/books/${bookId}`);
    log('blue', `📚 Book Status:`);
    log('blue', `   Title: ${bookRes.data.title}`);
    log('blue', `   Available Copies: ${bookRes.data.availableCopies}`);
    
    if (bookRes.data.availableCopies === 0) {
      log('green', '✅ Số lượng sách đúng: 0 (đã được mượn)');
    } else {
      log('red', `❌ Số lượng sách SAI: ${bookRes.data.availableCopies} (nên là 0)`);
    }
  } catch (error) {
    log('red', `❌ Failed to check book: ${error.message}`);
  }
}

// Main test function
async function runTest() {
  log('magenta', '\n╔════════════════════════════════════════╗');
  log('magenta', '║  RACE CONDITION PROTECTION TEST        ║');
  log('magenta', '║  Testing concurrent borrow operations  ║');
  log('magenta', '╚════════════════════════════════════════╝\n');

  try {
    await registerUsers();
    await loginUsers();
    await createTestBook();
    await testRaceCondition();
    await checkBookStatus();

    log('green', '\n✅ Test completed successfully!\n');
  } catch (error) {
    log('red', `\n❌ Test failed with error: ${error.message}\n`);
    if (error.response) {
      log('red', `Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

// Run the test
runTest();
