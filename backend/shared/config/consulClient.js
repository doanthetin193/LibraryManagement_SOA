// backend/shared/config/consulClient.js
/**
 * 🔌 CONSUL SERVICE DISCOVERY CLIENT
 * 
 * File này là "cầu nối" giữa các services và Consul server.
 * 
 * ❓ TẠI SAO CẦN FILE NÀY?
 * - Consul chỉ là server độc lập (localhost:8500)
 * - Services phải TỰ ĐĂNG KÝ với Consul qua HTTP API
 * - File này cung cấp helper functions để đăng ký/tìm kiếm services dễ dàng
 * 
 * 🎯 CÁCH SỬ DỤNG:
 * - Mỗi service (user, book, borrow...) import file này
 * - Gọi registerService() khi khởi động
 * - API Gateway gọi getServiceUrl() để tìm services
 */

const Consul = require('consul');

/**
 * 🔧 KHỞI TẠO CONSUL CLIENT
 * 
 * Tạo kết nối tới Consul server để gửi/nhận dữ liệu
 * 
 * @param host - Địa chỉ Consul server (mặc định: localhost)
 * @param port - Port Consul server (mặc định: 8500)
 * @param promisify - Chuyển callback thành async/await (dễ dùng hơn)
 */
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500,
  promisify: true  // Cho phép dùng await thay vì callback
});

/**
 * 📝 METHOD 1: ĐĂNG KÝ SERVICE VỚI CONSUL
 * 
 * 🎯 MỤC ĐÍCH:
 * - Báo cho Consul biết: "Tôi là service X, đang chạy ở địa chỉ Y"
 * - Cung cấp endpoint /health để Consul kiểm tra định kỳ
 * 
 * 🔄 KHI NÀO GỌI:
 * - Khi service khởi động (trong server.js của mỗi service)
 * - VD: user-service khởi động → gọi registerService()
 * 
 * 📥 INPUT:
 * @param {Object} config - Thông tin service cần đăng ký
 * @param {string} config.id - ID duy nhất (vd: "user-service-5001")
 *                             Phải unique vì có thể chạy nhiều instances cùng service
 * @param {string} config.name - Tên service (vd: "user-service")
 *                               Dùng để tìm kiếm sau này
 * @param {string} config.address - Địa chỉ IP/domain (vd: "localhost")
 * @param {number} config.port - Port service đang chạy (vd: 5001)
 * @param {Array} config.tags - Metadata/nhãn (vd: ["user", "authentication"])
 *                              Dùng để filter hoặc search
 * @param {Object} config.check - Cấu hình health check
 * @param {string} config.check.http - URL để Consul ping (vd: "http://localhost:5001/health")
 * @param {string} config.check.interval - Tần suất check (vd: "10s" = mỗi 10 giây)
 * @param {string} config.check.timeout - Timeout nếu không phản hồi (vd: "5s")
 * 
 * 📤 OUTPUT:
 * @returns {Object} { success: true, serviceId: "user-service-5001" }
 * 
 * 💡 VÍ DỤ SỬ DỤNG:
 * ```javascript
 * // Trong user-service/server.js
 * await registerService({
 *   id: 'user-service-5001',
 *   name: 'user-service',
 *   address: 'localhost',
 *   port: 5001,
 *   tags: ['user', 'authentication'],
 *   check: {
 *     http: 'http://localhost:5001/health',
 *     interval: '10s',
 *     timeout: '5s'
 *   }
 * });
 * // → Consul lưu service vào registry
 * // → Consul bắt đầu ping /health mỗi 10 giây
 * ```
 * 
 * ⚠️ LƯU Ý:
 * - Service PHẢI có endpoint /health trả về status 200
 * - Nếu /health không phản hồi → Consul đánh dấu "critical" (màu đỏ)
 * - ID phải unique, nếu trùng sẽ ghi đè service cũ
 */
async function registerService(config) {
  try {
    const serviceConfig = {
      id: config.id,
      name: config.name,
      address: config.address || 'localhost',
      port: parseInt(config.port),
      tags: config.tags || [],
      check: {
        http: config.check?.http || `http://${config.address || 'localhost'}:${config.port}/health`,
        interval: config.check?.interval || '10s',
        timeout: config.check?.timeout || '5s'
      }
    };

    // 🌐 GỌI CONSUL API: PUT /v1/agent/service/register
    // Gửi HTTP PUT request tới Consul server để lưu service
    await consul.agent.service.register(serviceConfig);
    
    console.log(`✅ [Consul] Service registered: ${config.name} (${config.id}) at ${config.address}:${config.port}`);
    console.log(`   Health check: ${serviceConfig.check.http} every ${serviceConfig.check.interval}`);
    
    return { success: true, serviceId: config.id };
  } catch (error) {
    console.error(`❌ [Consul] Failed to register service ${config.name}:`, error.message);
    console.error(`   Debug - Config sent:`, JSON.stringify(serviceConfig, null, 2));
    throw error;
  }
}

/**
 * 🗑️ METHOD 2: HỦY ĐĂNG KÝ SERVICE
 * 
 * 🎯 MỤC ĐÍCH:
 * - Xóa service khỏi Consul registry
 * - Báo cho Consul: "Tôi đã tắt, đừng route request tới tôi nữa"
 * 
 * 🔄 KHI NÀO GỌI:
 * - Khi service tắt (Ctrl+C hoặc process.exit())
 * - Trong setupGracefulShutdown() tự động gọi
 * 
 * 📥 INPUT:
 * @param {string} serviceId - ID service đã đăng ký (vd: "user-service-5001")
 * 
 * 📤 OUTPUT:
 * @returns {Object} { success: true }
 * 
 * 💡 VÍ DỤ:
 * ```javascript
 * // Khi tắt user-service
 * await deregisterService('user-service-5001');
 * // → Consul xóa service khỏi registry
 * // → API Gateway không còn route tới service này
 * ```
 * 
 * ⚠️ LƯU Ý:
 * - Nếu không deregister, Consul vẫn ping /health
 * - Sau 3-5 lần timeout, Consul tự đánh dấu "critical"
 * - Tốt nhất nên deregister rõ ràng để tránh delay
 */
async function deregisterService(serviceId) {
  try {
    // 🌐 GỌI CONSUL API: PUT /v1/agent/service/deregister/:id
    await consul.agent.service.deregister(serviceId);
    console.log(`✅ [Consul] Service deregistered: ${serviceId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Consul] Failed to deregister service ${serviceId}:`, error.message);
    throw error;
  }
}

/**
 * 🔍 METHOD 3: TÌM INSTANCES CỦA MỘT SERVICE
 * 
 * 🎯 MỤC ĐÍCH:
 * - Lấy danh sách tất cả instances của một service
 * - Lọc chỉ lấy instances đang khỏe mạnh (passing health check)
 * 
 * 🔄 KHI NÀO GỌI:
 * - Khi cần thông tin chi tiết về service
 * - Khi implement load balancing (chọn instance nào để gửi request)
 * 
 * 📥 INPUT:
 * @param {string} serviceName - Tên service (vd: "user-service")
 * @param {boolean} onlyHealthy - Chỉ lấy instances khỏe mạnh? (mặc định: true)
 *                                true = chỉ lấy "passing"
 *                                false = lấy cả "critical", "warning"
 * 
 * 📤 OUTPUT:
 * @returns {Array} Danh sách instances:
 * [
 *   {
 *     id: "user-service-5001",
 *     name: "user-service",
 *     address: "localhost",
 *     port: 5001,
 *     tags: ["user", "authentication"],
 *     status: "healthy" hoặc "unhealthy"
 *   }
 * ]
 * 
 * 💡 VÍ DỤ:
 * ```javascript
 * // Tìm tất cả user-service đang chạy
 * const instances = await getService('user-service', true);
 * console.log(instances);
 * // [
 * //   { id: 'user-service-5001', address: 'localhost', port: 5001, status: 'healthy' }
 * // ]
 * 
 * // Nếu chạy 2 instances:
 * // [
 * //   { id: 'user-service-5001', port: 5001, status: 'healthy' },
 * //   { id: 'user-service-5002', port: 5002, status: 'healthy' }
 * // ]
 * ```
 * 
 * ⚠️ LƯU Ý:
 * - Nếu không có instance nào → trả về [] (mảng rỗng)
 * - Status "healthy" = tất cả health checks đều "passing"
 */
async function getService(serviceName, onlyHealthy = true) {
  try {
    // 🌐 GỌI CONSUL API: GET /v1/health/service/:name?passing=true
    // passing=true → chỉ lấy instances có health check "passing"
    const services = await consul.health.service({
      service: serviceName,
      passing: onlyHealthy  // true = chỉ lấy khỏe mạnh, false = lấy tất cả
    });

    if (!services || services.length === 0) {
      console.warn(`⚠️  [Consul] No ${onlyHealthy ? 'healthy ' : ''}instances found for service: ${serviceName}`);
      return [];
    }

    // 📦 Chuyển đổi format Consul thành format đơn giản hơn
    const instances = services.map(s => ({
      id: s.Service.ID,
      name: s.Service.Service,
      address: s.Service.Address,
      port: s.Service.Port,
      tags: s.Service.Tags,
      // Kiểm tra tất cả checks có "passing" không
      status: s.Checks.every(check => check.Status === 'passing') ? 'healthy' : 'unhealthy'
    }));

    return instances;
  } catch (error) {
    console.error(`❌ [Consul] Failed to get service ${serviceName}:`, error.message);
    throw error;
  }
}

/**
 * 📋 METHOD 4: LẤY TẤT CẢ SERVICES ĐANG ĐĂNG KÝ
 * 
 * 🎯 MỤC ĐÍCH:
 * - Xem tổng quan tất cả services trong hệ thống
 * - Dùng cho dashboard/monitoring
 * 
 * 🔄 KHI NÀO GỌI:
 * - Trong endpoint /health của Gateway
 * - Khi cần kiểm tra xem có service nào đang chạy
 * 
 * 📥 INPUT: Không có
 * 
 * 📤 OUTPUT:
 * @returns {Object} Object với service names làm keys:
 * {
 *   "consul": [],                    // Consul tự đăng ký
 *   "user-service": [],               // Service của bạn
 *   "book-service": [],
 *   "api-gateway": []
 * }
 * 
 * 💡 VÍ DỤ:
 * ```javascript
 * const services = await getAllServices();
 * console.log(Object.keys(services));
 * // ['consul', 'user-service', 'book-service', 'borrow-service', ...]
 * 
 * // Đếm số services
 * const count = Object.keys(services).length;
 * console.log(`Total services: ${count}`);
 * ```
 * 
 * ⚠️ LƯU Ý:
 * - Chỉ trả về TÊN services, không có thông tin chi tiết
 * - Muốn chi tiết → dùng getService() cho từng service
 */
async function getAllServices() {
  try {
    // 🌐 GỌI CONSUL API: GET /v1/catalog/services
    const services = await consul.catalog.services();
    console.log(`📋 [Consul] Found ${Object.keys(services).length} registered services`);
    return services;
  } catch (error) {
    console.error(`❌ [Consul] Failed to get all services:`, error.message);
    throw error;
  }
}

/**
 * 🌐 METHOD 5: LẤY URL ĐỂ GỌI SERVICE (QUAN TRỌNG NHẤT!)
 * 
 * 🎯 MỤC ĐÍCH:
 * - Lấy địa chỉ đầy đủ (URL) của service để gửi request
 * - API Gateway dùng để route động (dynamic routing)
 * 
 * 🔄 KHI NÀO GỌI:
 * - Trong API Gateway mỗi khi có request tới
 * - VD: Client gọi GET /users/me
 *       → Gateway gọi getServiceUrl('user-service')
 *       → Nhận http://localhost:5001
 *       → Proxy tới http://localhost:5001/me
 * 
 * 📥 INPUT:
 * @param {string} serviceName - Tên service cần tìm (vd: "user-service")
 * 
 * 📤 OUTPUT:
 * @returns {string} URL đầy đủ của service (vd: "http://localhost:5001")
 * 
 * 💡 VÍ DỤ:
 * ```javascript
 * // API Gateway nhận request: GET /users/me
 * 
 * // Gateway hỏi Consul: "user-service ở đâu?"
 * const url = await getServiceUrl('user-service');
 * // → 'http://localhost:5001'
 * 
 * // Gateway proxy request tới:
 * // http://localhost:5001/me
 * ```
 * 
 * 🔧 CÁCH HOẠT ĐỘNG:
 * 1. Gọi getService() để lấy danh sách instances khỏe mạnh
 * 2. Chọn instance đầu tiên (có thể mở rộng thành load balancing)
 * 3. Ghép thành URL: http://address:port
 * 
 * ⚠️ LƯU Ý:
 * - Nếu không có instance khỏe mạnh → throw error
 * - Hiện tại chọn instance đầu tiên (round-robin có thể thêm sau)
 * - Đây là METHOD QUAN TRỌNG NHẤT cho Service Discovery!
 */
async function getServiceUrl(serviceName) {
  try {
    // Bước 1: Lấy danh sách instances khỏe mạnh
    const instances = await getService(serviceName, true);
    
    // Bước 2: Kiểm tra có instance nào không
    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }

    // Bước 3: Chọn instance (hiện tại lấy đầu tiên)
    // TODO: Có thể implement load balancing ở đây:
    // - Round Robin: lần lượt chọn từng instance
    // - Random: chọn ngẫu nhiên
    // - Least Connections: chọn instance ít request nhất
    const instance = instances[0];
    
    // Bước 4: Ghép thành URL
    const url = `http://${instance.address}:${instance.port}`;
    
    return url;
  } catch (error) {
    console.error(`❌ [Consul] Failed to get URL for service ${serviceName}:`, error.message);
    throw error;
  }
}

/**
 * 🛡️ METHOD 6: GRACEFUL SHUTDOWN - TẮT SERVICE AN TOÀN
 * 
 * 🎯 MỤC ĐÍCH:
 * - Tự động deregister service khi tắt (Ctrl+C, crash, kill process)
 * - Đảm bảo Consul không còn route request tới service đã tắt
 * 
 * 🔄 KHI NÀO GỌI:
 * - Ngay sau khi registerService() thành công
 * - Chạy 1 lần khi service khởi động
 * 
 * 📥 INPUT:
 * @param {string} serviceId - ID service đã đăng ký (vd: "user-service-5001")
 * 
 * 💡 VÍ DỤ:
 * ```javascript
 * // Trong user-service/server.js
 * 
 * app.listen(5001, async () => {
 *   // Đăng ký service
 *   await registerService({
 *     id: 'user-service-5001',
 *     name: 'user-service',
 *     port: 5001
 *   });
 *   
 *   // Setup graceful shutdown
 *   setupGracefulShutdown('user-service-5001');
 *   
 *   // → Khi nhấn Ctrl+C:
 *   // 1. Bắt signal SIGINT
 *   // 2. Gọi deregisterService('user-service-5001')
 *   // 3. Tắt process
 * });
 * ```
 * 
 * 🎯 CÁC SIGNAL XỬ LÝ:
 * - SIGTERM: Tắt bởi hệ thống (systemd, docker, pm2)
 * - SIGINT: Nhấn Ctrl+C trong terminal
 * - uncaughtException: Lỗi không được catch → crash
 * 
 * ⚠️ LƯU Ý:
 * - Chỉ gọi 1 lần, nếu gọi nhiều lần → duplicate handlers
 * - Không deregister → Consul vẫn nghĩ service đang sống 10-30 giây
 */
function setupGracefulShutdown(serviceId) {
  // Handler chung cho việc shutdown
  const shutdown = async (signal) => {
    console.log(`\n🛑 [${signal}] Shutting down gracefully...`);
    try {
      // Deregister khỏi Consul
      await deregisterService(serviceId);
      console.log(`✅ Service ${serviceId} deregistered from Consul`);
      process.exit(0);  // Tắt process thành công
    } catch (error) {
      console.error(`❌ Error during shutdown:`, error.message);
      process.exit(1);  // Tắt process với error code
    }
  };

  // 🎯 XỬ LÝ CÁC SIGNAL KHÁC NHAU:
  
  // SIGTERM: Tắt bởi hệ thống (systemd stop, docker stop, pm2 stop)
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  
  // SIGINT: Nhấn Ctrl+C trong terminal
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // uncaughtException: Code bị lỗi không được try/catch
  // VD: undefined.something() → crash
  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught Exception:', error);
    try {
      await deregisterService(serviceId);
    } catch (e) {
      console.error('Failed to deregister during uncaught exception');
    }
    process.exit(1);
  });
}

/**
 * ✅ METHOD 7: KIỂM TRA CONSUL CÓ ĐANG CHẠY KHÔNG
 * 
 * 🎯 MỤC ĐÍCH:
 * - Kiểm tra Consul server có available không trước khi đăng ký
 * - Tránh crash nếu Consul chưa khởi động
 * 
 * 🔄 KHI NÀO GỌI:
 * - Trước khi gọi registerService()
 * - Để quyết định có dùng Consul hay chạy standalone
 * 
 * 📥 INPUT: Không có
 * 
 * 📤 OUTPUT:
 * @returns {boolean} 
 *   - true: Consul đang chạy, có thể đăng ký
 *   - false: Consul không chạy, service sẽ chạy standalone
 * 
 * 💡 VÍ DỤ:
 * ```javascript
 * // Trong user-service/server.js
 * 
 * app.listen(5001, async () => {
 *   const consulAvailable = await isConsulAvailable();
 *   
 *   if (consulAvailable) {
 *     // Consul đang chạy → đăng ký
 *     await registerService({ ... });
 *     console.log('✅ Registered with Consul');
 *   } else {
 *     // Consul không chạy → chạy standalone
 *     console.warn('⚠️ Consul not available - running standalone');
 *   }
 * });
 * ```
 * 
 * 🔧 CÁCH HOẠT ĐỘNG:
 * - Gọi Consul API: GET /v1/agent/self
 * - Nếu response thành công → Consul sống
 * - Nếu lỗi (ECONNREFUSED) → Consul chết
 * 
 * ⚠️ LƯU Ý:
 * - Không throw error, chỉ return false
 * - Service vẫn chạy được dù Consul down (degraded mode)
 */
async function isConsulAvailable() {
  try {
    // 🌐 GỌI CONSUL API: GET /v1/agent/self
    // API này trả về thông tin về Consul agent
    await consul.agent.self();
    return true;  // Consul đang chạy
  } catch (error) {
    console.error('❌ [Consul] Consul is not available:', error.message);
    return false;  // Consul không chạy
  }
}

/**
 * 📦 EXPORT TẤT CẢ METHODS
 * 
 * Các services import file này để dùng các methods:
 * 
 * ```javascript
 * const { registerService, getServiceUrl } = require('./consulClient');
 * ```
 */
module.exports = {
  consul,                    // Consul client instance (để dùng advanced features)
  registerService,           // Đăng ký service mới
  deregisterService,         // Hủy đăng ký service
  getService,                // Lấy danh sách instances của service
  getAllServices,            // Lấy tất cả services
  getServiceUrl,             // Lấy URL của service (QUAN TRỌNG cho Gateway)
  setupGracefulShutdown,     // Tự động deregister khi tắt
  isConsulAvailable          // Kiểm tra Consul có sẵn không
};

