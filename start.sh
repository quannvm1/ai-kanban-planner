#!/bin/bash
set -e

echo "========================================================"
echo "  🚀 Khởi động AI Kanban & Intelligent Daily Planner"
echo "========================================================"
echo ""

# Navigate to project root directory
cd "$(dirname "$0")"

echo "[1/4] Kiểm tra trạng thái Docker & PostgreSQL..."
if ! docker info > /dev/null 2>&1; then
    echo "[!] Docker Desktop chưa chạy hoặc chưa sẵn sàng."
    echo "    Vui lòng mở Docker Desktop và chạy lại lệnh này!"
    exit 1
fi

echo "[2/4] Đảm bảo PostgreSQL container đang chạy..."
docker compose up -d postgres || true

echo "[3/4] Build Shared Types và Đồng bộ Prisma Database..."
npm run build --workspace=@ai-kanban/shared-types
npm --workspace=apps/api run db:push

echo "[4/4] Khởi động Backend (Port 4000) & Frontend (Port 3000)..."
echo ""
echo "========================================================"
echo "  🌐 Web App:    http://localhost:3000"
echo "  🔌 API Server: http://localhost:4000/api/v1"
echo "========================================================"
echo ""

npm run dev
