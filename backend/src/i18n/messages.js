/**
 * Centralized Multi-language (vi / en) Message Catalog for Backend API
 * Complies with Zero-Hardcoding Governance (.agents/skills/nodejs-express-mongoose-architecture/SKILL.md)
 */

const MESSAGES = {
  vi: {
    // General & Health
    SUCCESS: 'Thành công',
    ERROR_DEFAULT: 'Đã xảy ra lỗi',
    INTERNAL_SERVER_ERROR: 'Lỗi máy chủ nội bộ',
    HEALTH_OK: 'DTU Upcycled Fishing Net & 3D Ocean Craft API đang hoạt động ổn định',
    ROUTE_NOT_FOUND: 'Không tìm thấy đường dẫn API: {url}',
    INVALID_ID: 'Định dạng ID không hợp lệ cho trường {path}: {value}',
    DUPLICATE_KEY: "Giá trị của '{field}' đã tồn tại trong hệ thống",
    TOO_MANY_REQUESTS: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau ít phút.',
    AUTH_RATE_LIMIT: 'Quá nhiều lần thử đăng nhập/đăng ký, vui lòng thử lại sau.',

    // Auth & RBAC
    AUTH_REQUIRED: 'Vui lòng đăng nhập để thực hiện thao tác này',
    USER_INACTIVE: 'Tài khoản không tồn tại hoặc đã bị khóa',
    USER_LOCKED: 'Tài khoản đã bị khóa',
    FORBIDDEN_ROLE: 'Bạn không có quyền truy cập chức năng này (Yêu cầu quyền: {roles})',
    INVALID_TOKEN: 'Token xác thực không hợp lệ',
    TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
    REGISTER_MISSING_FIELDS: 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu',
    EMAIL_EXISTS: 'Email này đã được đăng ký',
    REGISTER_SUCCESS: 'Đăng ký tài khoản thành công',
    LOGIN_MISSING_FIELDS: 'Vui lòng nhập Email và Mật khẩu',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    GET_ME_SUCCESS: 'Lấy thông tin tài khoản thành công',

    // Landing Content
    GET_LANDING_SUCCESS: 'Lấy dữ liệu LandingPage thành công',
    UPDATE_LANDING_SUCCESS: 'Cập nhật nội dung LandingPage thành công',

    // Products
    GET_PRODUCTS_SUCCESS: 'Lấy danh sách sản phẩm thành công',
    GET_PRODUCT_DETAIL_SUCCESS: 'Lấy chi tiết sản phẩm thành công',
    PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
    PRODUCT_MISSING_NAME: 'Tên sản phẩm không được để trống',
    CREATE_PRODUCT_SUCCESS: 'Tạo sản phẩm mới thành công',
    UPDATE_PRODUCT_SUCCESS: 'Cập nhật sản phẩm thành công',
    DELETE_PRODUCT_SUCCESS: 'Đã xóa sản phẩm thành công',

    // Custom Materials
    GET_MATERIALS_SUCCESS: 'Lấy danh sách nguyên liệu vỏ sò/ốc/charm thành công',
    MATERIAL_NOT_FOUND: 'Không tìm thấy nguyên liệu',
    CREATE_MATERIAL_SUCCESS: 'Thêm nguyên liệu Custom thành công',
    UPDATE_MATERIAL_SUCCESS: 'Cập nhật nguyên liệu thành công',
    DELETE_MATERIAL_SUCCESS: 'Đã xóa nguyên liệu thành công',

    // 3D Customizer & Pricing (BR-01, BR-02, BR-03)
    CALCULATE_PRICE_SUCCESS: 'Tính giá BOM thời gian thực thành công (BR-01)',
    SAVE_DESIGN_SUCCESS: 'Lưu bản thiết kế 3D thành công',
    GET_DESIGN_SUCCESS: 'Lấy bản thiết kế 3D thành công',
    DESIGN_NOT_FOUND: 'Không tìm thấy bản thiết kế 3D',
    INVALID_PLACEMENTS_ARRAY: 'Danh sách phụ kiện (placements) phải là một mảng',
    MAX_PLACEMENTS_EXCEEDED:
      'Vượt quá giới hạn cho phép: Tối đa 50 phụ kiện trên 1 sản phẩm (hiện tại: {count}) (BR-02)',
    PLACEMENT_MISSING_MATERIAL: 'Phụ kiện thứ #{index} thiếu materialId',
    INVALID_POSITION: 'Phụ kiện thứ #{index} có tọa độ position [x, y, z] không hợp lệ (BR-03)',
    INVALID_NORMAL: 'Phụ kiện thứ #{index} có vector pháp tuyến normal [nx, ny, nz] không hợp lệ (BR-03)',
    INVALID_SCALE:
      'Phụ kiện thứ #{index} có tỉ lệ thu phóng (scale = {scale}) ngoài phạm vi cho phép [0.4 - 2.5] (BR-03)',
    MISSING_PRODUCT_ID: 'Vui lòng cung cấp productId',
    MATERIAL_INACTIVE: 'Nguyên liệu "{name}" hiện đang ngừng cung cấp',
    PRODUCT_NOT_CUSTOMIZABLE: 'Sản phẩm "{name}" không hỗ trợ chế độ Custom 3D',

    // Orders & Inventory (BR-04..BR-10)
    PLACE_ORDER_SUCCESS: 'Đặt hàng thành công! Xưởng đã ghi nhận phiếu chế tác của bạn.',
    LOOKUP_ORDER_SUCCESS: 'Tra cứu đơn hàng thành công',
    CANCEL_ORDER_SUCCESS: 'Đã hủy đơn hàng và hoàn trả nguyên liệu vào kho thành công (BR-06)',
    GET_ORDERS_SUCCESS: 'Lấy danh sách đơn hàng thành công',
    GET_ORDER_DETAIL_SUCCESS: 'Lấy chi tiết đơn hàng thành công',
    UPDATE_ORDER_STATUS_SUCCESS: 'Đã cập nhật trạng thái đơn hàng sang "{status}"',
    UPDATE_ORDER_PAYMENT_SUCCESS: 'Đã cập nhật trạng thái thanh toán sang "{paymentStatus}"',
    ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
    INVALID_CUSTOMER_INFO: 'Vui lòng cung cấp đầy đủ thông tin người nhận (Họ tên, Số điện thoại, Địa chỉ)',
    EMPTY_ORDER_ITEMS: 'Giỏ hàng trống, vui lòng chọn ít nhất 1 sản phẩm',
    INVALID_QUANTITY: 'Số lượng đặt của sản phẩm thứ #{index} phải >= 1',
    PRODUCT_UNAVAILABLE: 'Sản phẩm "{name}" không tồn tại hoặc đã ngừng kinh doanh',
    INSUFFICIENT_PRODUCT_STOCK:
      'Sản phẩm "{name}" không đủ tồn kho (Cần: {required}, Tồn kho hiện tại: {available}) (BR-04)',
    MATERIAL_UNAVAILABLE: 'Nguyên liệu "{name}" không còn hoạt động trong kho (BR-04)',
    INSUFFICIENT_MATERIAL_STOCK:
      'Nguyên liệu "{name}" ({code}) không đủ tồn kho (Cần: {required}, Tồn kho còn: {available}) (BR-04)',
    CONCURRENT_PRODUCT_OUT_OF_STOCK: 'Sản phẩm "{name}" vừa hết hàng trong lúc xử lý đơn (Cần: {required})',
    CONCURRENT_MATERIAL_OUT_OF_STOCK: 'Nguyên liệu "{name}" vừa hết tồn kho trong lúc xử lý đơn (Cần: {required})',
    PHONE_MISMATCH: 'Số điện thoại xác nhận không khớp với đơn hàng',
    CANNOT_CANCEL_IN_CRAFTING:
      'Không thể hủy đơn hàng khi đang ở trạng thái "{status}" (Xưởng đã bắt đầu chế tác hoặc giao hàng - BR-05)',
    ALREADY_CANCELLED: 'Đơn hàng này đã được hủy trước đó',
    INVALID_STATUS_TRANSITION:
      'Chuyển trạng thái không hợp lệ từ "{current}" sang "{next}" (Cho phép: {allowed}) (BR-05)',
    MISSING_STATUS: 'Vui lòng cung cấp trạng thái mới (status)',
    INVALID_PAYMENT_STATUS: 'Trạng thái thanh toán không hợp lệ (unpaid | paid | refunded)',

    // Admin Dashboard
    GET_DASHBOARD_SUCCESS: 'Lấy dữ liệu thống kê CMS Dashboard thành công',

    // AWS S3 & Hybrid Media Upload
    MEDIA_STATUS_SUCCESS: 'Lấy trạng thái lưu trữ Media S3 thành công',
    MEDIA_PRESIGNED_SUCCESS: 'Tạo đường dẫn Presigned URL tải ảnh thành công',
    MEDIA_UPLOAD_SUCCESS: 'Tải lên hình ảnh thành công',
    MEDIA_DELETE_SUCCESS: 'Đã xóa tệp hình ảnh thành công',
    MEDIA_MISSING_FILE: 'Vui lòng chọn tệp hình ảnh để tải lên',
    MEDIA_INVALID_FOLDER: 'Thư mục lưu trữ "{folder}" không hợp lệ (Cho phép: {allowed})',
    MEDIA_INVALID_MIME: 'Định dạng tệp "{mimeType}" không được phép. Chỉ chấp nhận ảnh JPEG, PNG, WEBP, GIF, AVIF.',
    MEDIA_FILE_TOO_LARGE: 'Kích thước tệp vượt quá giới hạn cho phép ({maxSizeMb}MB)',
    MEDIA_MISSING_KEY: 'Vui lòng cung cấp key hoặc url của tệp cần xóa',
  },
  en: {
    // General & Health
    SUCCESS: 'Success',
    ERROR_DEFAULT: 'An error occurred',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    HEALTH_OK: 'DTU Upcycled Fishing Net & 3D Ocean Craft API is healthy',
    ROUTE_NOT_FOUND: 'API route not found: {url}',
    INVALID_ID: 'Invalid ID format for field {path}: {value}',
    DUPLICATE_KEY: "Value for '{field}' already exists",
    TOO_MANY_REQUESTS: 'Too many requests from this IP, please try again later.',
    AUTH_RATE_LIMIT: 'Too many login/register attempts, please try again later.',

    // Auth & RBAC
    AUTH_REQUIRED: 'Please log in to perform this action',
    USER_INACTIVE: 'Account does not exist or has been deactivated',
    USER_LOCKED: 'Account has been locked',
    FORBIDDEN_ROLE: 'You do not have permission to access this resource (Required role: {roles})',
    INVALID_TOKEN: 'Invalid authentication token',
    TOKEN_EXPIRED: 'Session expired, please log in again',
    REGISTER_MISSING_FIELDS: 'Please provide full name, email, and password',
    EMAIL_EXISTS: 'This email is already registered',
    REGISTER_SUCCESS: 'Account registered successfully',
    LOGIN_MISSING_FIELDS: 'Please provide email and password',
    INVALID_CREDENTIALS: 'Invalid email or password',
    LOGIN_SUCCESS: 'Logged in successfully',
    GET_ME_SUCCESS: 'Fetched user profile successfully',

    // Landing Content
    GET_LANDING_SUCCESS: 'Fetched LandingPage content successfully',
    UPDATE_LANDING_SUCCESS: 'Updated LandingPage content successfully',

    // Products
    GET_PRODUCTS_SUCCESS: 'Fetched product list successfully',
    GET_PRODUCT_DETAIL_SUCCESS: 'Fetched product details successfully',
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCT_MISSING_NAME: 'Product name is required',
    CREATE_PRODUCT_SUCCESS: 'Created product successfully',
    UPDATE_PRODUCT_SUCCESS: 'Updated product successfully',
    DELETE_PRODUCT_SUCCESS: 'Deleted product successfully',

    // Custom Materials
    GET_MATERIALS_SUCCESS: 'Fetched custom materials successfully',
    MATERIAL_NOT_FOUND: 'Custom material not found',
    CREATE_MATERIAL_SUCCESS: 'Created custom material successfully',
    UPDATE_MATERIAL_SUCCESS: 'Updated custom material successfully',
    DELETE_MATERIAL_SUCCESS: 'Deleted custom material successfully',

    // 3D Customizer & Pricing
    CALCULATE_PRICE_SUCCESS: 'Calculated real-time BOM pricing successfully (BR-01)',
    SAVE_DESIGN_SUCCESS: 'Saved 3D custom design successfully',
    GET_DESIGN_SUCCESS: 'Fetched 3D custom design successfully',
    DESIGN_NOT_FOUND: '3D custom design not found',
    INVALID_PLACEMENTS_ARRAY: 'Placements must be an array',
    MAX_PLACEMENTS_EXCEEDED: 'Maximum 50 accessories allowed per product (current: {count}) (BR-02)',
    PLACEMENT_MISSING_MATERIAL: 'Accessory #{index} is missing materialId',
    INVALID_POSITION: 'Accessory #{index} has invalid 3D position [x, y, z] (BR-03)',
    INVALID_NORMAL: 'Accessory #{index} has invalid surface normal vector [nx, ny, nz] (BR-03)',
    INVALID_SCALE: 'Accessory #{index} has scale ({scale}) outside allowed range [0.4 - 2.5] (BR-03)',
    MISSING_PRODUCT_ID: 'Please provide productId',
    MATERIAL_INACTIVE: 'Material "{name}" is currently inactive',
    PRODUCT_NOT_CUSTOMIZABLE: 'Product "{name}" does not support 3D customization',

    // Orders & Inventory
    PLACE_ORDER_SUCCESS: 'Order placed successfully! Our artisan workshop has received your ticket.',
    LOOKUP_ORDER_SUCCESS: 'Order lookup successful',
    CANCEL_ORDER_SUCCESS: 'Order cancelled and inventory rolled back successfully (BR-06)',
    GET_ORDERS_SUCCESS: 'Fetched order list successfully',
    GET_ORDER_DETAIL_SUCCESS: 'Fetched order details successfully',
    UPDATE_ORDER_STATUS_SUCCESS: 'Updated order status to "{status}"',
    UPDATE_ORDER_PAYMENT_SUCCESS: 'Updated payment status to "{paymentStatus}"',
    ORDER_NOT_FOUND: 'Order not found',
    INVALID_CUSTOMER_INFO: 'Please provide full recipient info (Full Name, Phone, Address)',
    EMPTY_ORDER_ITEMS: 'Order items cannot be empty',
    INVALID_QUANTITY: 'Quantity for item #{index} must be >= 1',
    PRODUCT_UNAVAILABLE: 'Product "{name}" is unavailable or discontinued',
    INSUFFICIENT_PRODUCT_STOCK:
      'Product "{name}" has insufficient stock (Required: {required}, Available: {available}) (BR-04)',
    MATERIAL_UNAVAILABLE: 'Material "{name}" is no longer active in inventory (BR-04)',
    INSUFFICIENT_MATERIAL_STOCK:
      'Material "{name}" ({code}) has insufficient stock (Required: {required}, Available: {available}) (BR-04)',
    CONCURRENT_PRODUCT_OUT_OF_STOCK: 'Product "{name}" went out of stock during checkout (Required: {required})',
    CONCURRENT_MATERIAL_OUT_OF_STOCK: 'Material "{name}" went out of stock during checkout (Required: {required})',
    PHONE_MISMATCH: 'Confirmation phone number does not match order record',
    CANNOT_CANCEL_IN_CRAFTING:
      'Cannot cancel order in status "{status}" (Workshop crafting or shipping already started - BR-05)',
    ALREADY_CANCELLED: 'This order has already been cancelled',
    INVALID_STATUS_TRANSITION: 'Invalid status transition from "{current}" to "{next}" (Allowed: {allowed}) (BR-05)',
    MISSING_STATUS: 'Please provide new status',
    INVALID_PAYMENT_STATUS: 'Invalid payment status (unpaid | paid | refunded)',

    // Admin Dashboard
    GET_DASHBOARD_SUCCESS: 'Fetched CMS Dashboard statistics successfully',

    // AWS S3 & Hybrid Media Upload
    MEDIA_STATUS_SUCCESS: 'Fetched S3 Media storage status successfully',
    MEDIA_PRESIGNED_SUCCESS: 'Generated S3 Presigned Upload URL successfully',
    MEDIA_UPLOAD_SUCCESS: 'Uploaded image successfully',
    MEDIA_DELETE_SUCCESS: 'Deleted media file successfully',
    MEDIA_MISSING_FILE: 'Please provide an image file to upload',
    MEDIA_INVALID_FOLDER: 'Invalid storage folder "{folder}" (Allowed: {allowed})',
    MEDIA_INVALID_MIME: 'Invalid file MIME type "{mimeType}". Only JPEG, PNG, WEBP, GIF, AVIF images are allowed.',
    MEDIA_FILE_TOO_LARGE: 'File size exceeds maximum limit ({maxSizeMb}MB)',
    MEDIA_MISSING_KEY: 'Please provide file key or url to delete',
  },
};

const resolveLang = (reqOrLang = 'vi') => {
  if (!reqOrLang) return 'vi';
  if (typeof reqOrLang === 'string') {
    return reqOrLang.toLowerCase().startsWith('en') ? 'en' : 'vi';
  }
  const queryLang = reqOrLang.query?.lang;
  if (queryLang && String(queryLang).toLowerCase().startsWith('en')) return 'en';
  const headerLang = reqOrLang.headers?.['accept-language'];
  if (headerLang && String(headerLang).toLowerCase().startsWith('en')) return 'en';
  return 'vi';
};

const getMessage = (key, params = {}, reqOrLang = 'vi') => {
  const lang = resolveLang(reqOrLang);
  const dict = MESSAGES[lang] || MESSAGES.vi;
  let template = dict[key] || MESSAGES.vi[key] || key;

  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return template;
};

module.exports = {
  MESSAGES,
  resolveLang,
  getMessage,
};
