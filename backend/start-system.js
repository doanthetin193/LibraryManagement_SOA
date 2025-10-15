const { spawn } = require('child_process');
const axios = require('axios');

console.log('🚀 Starting SOA System...\n');

// Khởi động tất cả services
const services = [
  { name: 'Gateway', script: 'api-gateway/server.js', port: 5000, color: '\x1b[36m' },
  { name: 'User Service', script: 'services/user-service/server.js', port: 5001, color: '\x1b[32m' },
  { name: 'Book Service', script: 'services/book-service/server.js', port: 5002, color: '\x1b[33m' },
  { name: 'Borrow Service', script: 'services/borrow-service/server.js', port: 5003, color: '\x1b[35m' },
  { name: 'Logging Service', script: 'services/logging-service/server.js', port: 5004, color: '\x1b[34m' }
];

const processes = [];

// Khởi động từng service
services.forEach(service => {
  const proc = spawn('node', [service.script], {
    cwd: __dirname,
    stdio: 'pipe'
  });

  proc.stdout.on('data', (data) => {
    console.log(`${service.color}[${service.name}]${'\x1b[0m'} ${data.toString().trim()}`);
  });

  proc.stderr.on('data', (data) => {
    console.error(`${service.color}[${service.name} ERROR]${'\x1b[0m'} ${data.toString().trim()}`);
  });

  proc.on('close', (code) => {
    console.log(`${service.color}[${service.name}]${'\x1b[0m'} exited with code ${code}`);
  });

  processes.push({ ...service, proc });
});

// Đợi 5 giây để services khởi động
setTimeout(async () => {
  console.log('\n\n🔍 Checking services health...\n');
  
  for (const service of services) {
    try {
      const response = await axios.get(`http://localhost:${service.port}/health`, { timeout: 3000 });
      console.log(`✅ ${service.name} (port ${service.port}): ${response.data.status}`);
    } catch (error) {
      console.log(`❌ ${service.name} (port ${service.port}): Failed`);
    }
  }

  console.log('\n\n📝 Testing API...\n');
  
  // Test Register
  try {
    const registerRes = await axios.post('http://localhost:5000/users/register', {
      username: 'testuser' + Date.now(),
      password: '123456',
      role: 'user'
    });
    console.log('✅ Register API: SUCCESS');
    console.log('   User:', registerRes.data.username);
    console.log('   Token:', registerRes.data.token.substring(0, 20) + '...');
  } catch (error) {
    console.log('❌ Register API: FAILED');
    console.log('   Error:', error.response?.data || error.message);
  }

  console.log('\n\n✅ System is running! Press Ctrl+C to stop.\n');
  
}, 5000);

// Cleanup khi tắt
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping all services...\n');
  processes.forEach(({ name, proc }) => {
    console.log(`Stopping ${name}...`);
    proc.kill();
  });
  process.exit(0);
});
