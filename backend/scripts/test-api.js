const axios = require('axios');

async function testRegister() {
  try {
    console.log('🧪 Testing Register API...');
    const response = await axios.post('http://localhost:5000/users/register', {
      username: 'testuser' + Date.now(),
      password: '123456',
      role: 'user'
    });
    console.log('✅ Register Success:', response.data);
  } catch (error) {
    console.error('❌ Register Error:');
    console.error('Message:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
  }
}

async function testLogin() {
  try {
    console.log('\n🧪 Testing Login API...');
    const response = await axios.post('http://localhost:5000/users/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Login Success:', response.data);
  } catch (error) {
    console.error('❌ Login Error:');
    console.error('Message:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
  }
}

async function runTests() {
  await testRegister();
  await testLogin();
}

runTests();
