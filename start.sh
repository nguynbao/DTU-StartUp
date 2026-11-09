#!/usr/bin/env bash

# ==============================================================================
# DTU Upcycled Fishing Net & 3D Ocean Craft Ecosystem — Quick Start Script
# Hệ sinh thái 2 Web Độc lập + Backend API:
#   - Backend API Server           : http://localhost:5000  (backend/)
#   - Web Store & 3D Studio        : http://localhost:3000  (frontend/ | web-store/)
#   - Web CMS & 3D Inspector       : http://localhost:3002  (web-cms/)
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
WEB_STORE_DIR="${ROOT_DIR}/web-store"
WEB_CMS_DIR="${ROOT_DIR}/web-cms"

BACKEND_PORT="${BACKEND_PORT:-5000}"
STORE_PORT="${STORE_PORT:-3000}"
CMS_PORT="${CMS_PORT:-3002}"

# ANSI Colors
CYAN='\033[0;36m'
TEAL='\033[1;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

BACKEND_PID=""
STORE_PID=""
CMS_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}⚡ Đang dừng toàn bộ 3 dịch vụ (Backend, Web Store, Web CMS)...${NC}"
  for pid in "${BACKEND_PID}" "${STORE_PID}" "${CMS_PID}"; do
    if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
      kill "${pid}" 2>/dev/null || true
    fi
  done
  echo -e "${GREEN}✔ Đã tắt toàn bộ dịch vụ an toàn.${NC}"
}

print_banner() {
  echo -e "${TEAL}================================================================================${NC}"
  echo -e "${BOLD}🌊 DTU UPCYCLED FISHING NET & 3D OCEAN CRAFT ECOSYSTEM${NC}"
  echo -e "   Kiến trúc 2 Web Độc Lập (Web Store:3000 • Web CMS:3002) + Backend API:5000"
  echo -e "${TEAL}================================================================================${NC}"
}

check_prerequisites() {
  if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}✖ Không tìm thấy Node.js. Vui lòng cài đặt Node.js >= 18.${NC}"
    exit 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}✖ Không tìm thấy npm. Vui lòng cài đặt npm.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✔ Node.js:${NC} $(node -v) | ${GREEN}npm:${NC} $(npm -v)"
}

ensure_env_files() {
  if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
    echo -e "${CYAN}⚙ Đang khởi tạo file cấu hình mặc định ${BACKEND_DIR}/.env...${NC}"
    cat <<EOF > "${BACKEND_DIR}/.env"
PORT=${BACKEND_PORT}
NODE_ENV=development
BACKEND_PUBLIC_URL=http://localhost:${BACKEND_PORT}
MONGODB_URI=mongodb://127.0.0.1:27017/dtu_upcycled_3d
JWT_SECRET=dtu-ocean-upcycled-3d-super-secret-jwt-key-2026
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:${STORE_PORT},http://localhost:${CMS_PORT},http://127.0.0.1:${STORE_PORT},http://127.0.0.1:${CMS_PORT}
VIETQR_BANK_ID=MB
VIETQR_BANK_NAME=MB - Ngân hàng Quân Đội (MB Bank)
VIETQR_ACCOUNT_NO=0905123456
VIETQR_TEMPLATE=compact2
VIETQR_ACCOUNT_NAME=CONG TY TAI CHE LUOI BIEN DTU
VIETQR_BASE_URL=https://img.vietqr.io/image
SEED_ADMIN_EMAIL=admin@dtu-upcycled.vn
SEED_STAFF_EMAIL=artisan@dtu-upcycled.vn
SEED_CUSTOMER_EMAIL=customer@dtu-upcycled.vn
SEED_DEFAULT_PASSWORD=Password123!
EOF
  fi

  local env_content
  env_content=$(cat <<EOF
NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT}/api
NEXT_PUBLIC_STORE_URL=http://localhost:${STORE_PORT}
NEXT_PUBLIC_CMS_URL=http://localhost:${CMS_PORT}
NEXT_PUBLIC_S3_BASE_URL=https://dtu-img-db-868017909899-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com
EOF
)

  if [[ ! -f "${FRONTEND_DIR}/.env.local" ]]; then
    echo "${env_content}" > "${FRONTEND_DIR}/.env.local"
  fi
  if [[ -d "${WEB_CMS_DIR}" ]] && [[ ! -f "${WEB_CMS_DIR}/.env.local" ]]; then
    echo "${env_content}" > "${WEB_CMS_DIR}/.env.local"
  fi
}

ensure_symlinks() {
  # Đảm bảo symlink web-store -> frontend
  if [[ ! -e "${WEB_STORE_DIR}" ]]; then
    ln -s "frontend" "${WEB_STORE_DIR}"
  fi

  # Đảm bảo các symlink dùng chung cho web-cms (Zero-Duplication Architecture)
  if [[ -d "${WEB_CMS_DIR}" ]]; then
    if [[ ! -e "${WEB_CMS_DIR}/node_modules" ]] && [[ -d "${FRONTEND_DIR}/node_modules" ]]; then
      ln -s "../frontend/node_modules" "${WEB_CMS_DIR}/node_modules"
    fi
    mkdir -p "${WEB_CMS_DIR}/src"
    for shared_folder in components lib types context config i18n; do
      if [[ ! -e "${WEB_CMS_DIR}/src/${shared_folder}" ]] && [[ -d "${FRONTEND_DIR}/src/${shared_folder}" ]]; then
        ln -s "../../frontend/src/${shared_folder}" "${WEB_CMS_DIR}/src/${shared_folder}"
      fi
    done
  fi
}

ensure_dependencies() {
  local force_install="${1:-false}"

  if [[ "${force_install}" == "true" ]] || [[ ! -d "${BACKEND_DIR}/node_modules" ]]; then
    echo -e "${CYAN}📦 Đang cài đặt dependencies cho Backend (${BACKEND_DIR})...${NC}"
    (cd "${BACKEND_DIR}" && npm install)
  else
    echo -e "${GREEN}✔ Backend node_modules đã sẵn sàng.${NC}"
  fi

  if [[ "${force_install}" == "true" ]] || [[ ! -d "${FRONTEND_DIR}/node_modules" ]]; then
    echo -e "${CYAN}📦 Đang cài đặt dependencies cho Frontend Shared Core (${FRONTEND_DIR})...${NC}"
    (cd "${FRONTEND_DIR}" && npm install)
  else
    echo -e "${GREEN}✔ Frontend node_modules đã sẵn sàng.${NC}"
  fi

  ensure_symlinks
}

free_port_if_busy() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -ti tcp:"${port}" -sTCP:LISTEN 2>/dev/null || true)
    if [[ -n "${pids}" ]]; then
      for pid in ${pids}; do
        local comm
        comm=$(ps -p "${pid}" -o comm= 2>/dev/null || true)
        if echo "${comm}" | grep -qi "node"; then
          echo -e "${YELLOW}⚠ Cổng ${port} đang bận bởi tiến trình node cũ (PID: ${pid}). Đang giải phóng cổng...${NC}"
          kill -9 "${pid}" 2>/dev/null || true
          sleep 0.5
        fi
      done
    fi
  fi
}

print_usage() {
  cat <<EOF
Cách sử dụng: ./start.sh [TÙY CHỌN]

Các tùy chọn:
  (không tham số)   Khởi chạy đồng thời cả 3 dịch vụ:
                      1. Backend API Server           (http://localhost:${BACKEND_PORT})
                      2. Web Store & 3D Studio        (http://localhost:${STORE_PORT})
                      3. Web CMS & 3D Inspector       (http://localhost:${CMS_PORT})
  --seed            Nạp mới lại toàn bộ dữ liệu mẫu (8 sản phẩm gốc, 12 nguyên liệu vỏ sò/ốc, đơn mẫu 3D)
  --test            Chạy bộ kiểm thử tự động Backend API (Gherkin) và kiểm tra build cả 2 ứng dụng Web
  --install         Buộc cài đặt lại node_modules và đồng bộ symlinks cho toàn bộ hệ thống
  --help, -h        Hiển thị hướng dẫn sử dụng này
EOF
}

print_access_guide() {
  echo ""
  echo -e "${TEAL}================================================================================${NC}"
  echo -e "${GREEN}${BOLD}🚀 HỆ THỐNG WEB STORE, WEB CMS & BACKEND API ĐÃ KHỞI CHẠY THÀNH CÔNG!${NC}"
  echo -e "${TEAL}--------------------------------------------------------------------------------${NC}"
  echo -e "${BOLD}📌 1. Hai Ứng Dụng Web Độc Lập:${NC}"
  echo -e "   • ${CYAN}[Port ${STORE_PORT}] Web Store & 3D Customizer Studio:${NC} http://localhost:${STORE_PORT}"
  echo -e "     ├─ Cửa hàng sản phẩm tái chế : http://localhost:${STORE_PORT}/shop"
  echo -e "     ├─ Phòng 3D Studio (2 Mode)  : http://localhost:${STORE_PORT}/customizer"
  echo -e "     └─ Tra cứu tiến độ đơn hàng  : http://localhost:${STORE_PORT}/orders"
  echo -e "   • ${CYAN}[Port ${CMS_PORT}] Web CMS & Xưởng Chế Tác 3D:${NC}      http://localhost:${CMS_PORT}"
  echo ""
  echo -e "${BOLD}📌 2. Đường dẫn Server API (Backend Node.js + Express + MongoDB):${NC}"
  echo -e "   • ${CYAN}[Port ${BACKEND_PORT}] API Base URL:${NC}                 http://localhost:${BACKEND_PORT}/api"
  echo -e "   • ${CYAN}[Port ${BACKEND_PORT}] API Health Check:${NC}             http://localhost:${BACKEND_PORT}/api/health"
  echo ""
  echo -e "${BOLD}📌 3. Tài khoản & Mã đơn hàng mẫu (Đã nạp sẵn):${NC}"
  echo -e "   • ${YELLOW}Admin CMS:${NC}      admin@dtu-upcycled.vn    | Mật khẩu: ${BOLD}Password123!${NC}"
  echo -e "   • ${YELLOW}Artisan/Staff:${NC}  artisan@dtu-upcycled.vn  | Mật khẩu: ${BOLD}Password123!${NC}"
  echo -e "   • ${YELLOW}Customer:${NC}       customer@dtu-upcycled.vn | Mật khẩu: ${BOLD}Password123!${NC}"
  echo -e "   • ${YELLOW}Mã đơn mẫu 1:${NC}   DTU-20261108-OCN1 (SĐT: 0905888999 — Đang chế tác 3D)"
  echo -e "   • ${YELLOW}Mã đơn mẫu 2:${NC}   DTU-20261108-OCN2 (SĐT: 0912345678 — Chờ xác nhận)"
  echo -e "${TEAL}================================================================================${NC}"
  echo -e "${YELLOW}💡 Nhấn Ctrl+C để dừng đồng thời cả 3 dịch vụ.${NC}"
  echo ""
}

# ==============================================================================
# Main Execution Flow
# ==============================================================================
MODE="${1:-run}"

case "${MODE}" in
  --help|-h)
    print_banner
    print_usage
    exit 0
    ;;
  --install)
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "true"
    echo -e "${GREEN}✔ Đã cài đặt hoàn tất toàn bộ dependencies & symlinks!${NC}"
    exit 0
    ;;
  --seed)
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "false"
    echo -e "${CYAN}🌱 Đang nạp lại dữ liệu mẫu vào MongoDB...${NC}"
    (cd "${BACKEND_DIR}" && npm run seed)
    echo -e "${GREEN}✔ Hoàn tất nạp dữ liệu mẫu!${NC}"
    exit 0
    ;;
  --test)
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "false"
    echo -e "${CYAN}🧪 1/3: Chạy bộ kiểm thử tự động Backend API & Business Rules...${NC}"
    (cd "${BACKEND_DIR}" && npm test && npm run seed)
    echo -e "${CYAN}🏗 2/3: Kiểm tra Production Build của Web Store & 3D Studio (${FRONTEND_DIR})...${NC}"
    (cd "${FRONTEND_DIR}" && npm run build)
    if [[ -d "${WEB_CMS_DIR}" ]]; then
      echo -e "${CYAN}🏗 3/3: Kiểm tra Production Build của Web CMS (${WEB_CMS_DIR})...${NC}"
      (cd "${WEB_CMS_DIR}" && npm run build)
    fi
    echo -e "${GREEN}✔ Toàn bộ kiểm thử Backend và bản build của Web Store + Web CMS đều PASS 100%!${NC}"
    exit 0
    ;;
  run|"")
    print_banner
    check_prerequisites
    ensure_env_files
    ensure_dependencies "false"

    trap cleanup INT TERM EXIT

    free_port_if_busy "${BACKEND_PORT}"
    free_port_if_busy "${STORE_PORT}"
    free_port_if_busy "${CMS_PORT}"

    echo -e "${CYAN}🚀 [1/3] Đang khởi động Backend API Server tại cổng ${BACKEND_PORT}...${NC}"
    (cd "${BACKEND_DIR}" && PORT="${BACKEND_PORT}" npm start) &
    BACKEND_PID=$!

    # Đợi Backend sẵn sàng
    for i in {1..20}; do
      if curl -s "http://localhost:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✔ Backend API Server đã sẵn sàng tại http://localhost:${BACKEND_PORT}${NC}"
        break
      fi
      sleep 1
    done

    echo -e "${CYAN}🚀 [2/3] Đang khởi động Web Store & 3D Studio tại cổng ${STORE_PORT}...${NC}"
    (cd "${FRONTEND_DIR}" && npx next dev -p "${STORE_PORT}") &
    STORE_PID=$!

    if [[ -d "${WEB_CMS_DIR}" ]]; then
      echo -e "${CYAN}🚀 [3/3] Đang khởi động Web CMS & Xưởng 3D tại cổng ${CMS_PORT}...${NC}"
      (cd "${WEB_CMS_DIR}" && npx next dev -p "${CMS_PORT}") &
      CMS_PID=$!
    fi

    sleep 2
    print_access_guide

    wait
    ;;
  *)
    print_banner
    echo -e "${RED}✖ Tham số không hợp lệ: ${MODE}${NC}"
    print_usage
    exit 1
    ;;
esac
