# PowerShell Startup Script for AI Kanban & Intelligent Daily Planner
$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🚀 Khởi động AI Kanban & Intelligent Daily Planner" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[1/4] Kiểm tra trạng thái Docker..." -ForegroundColor Yellow
try {
    docker info 2>&1 | Out-Null
    Write-Host "  ✓ Docker Desktop đang hoạt động." -ForegroundColor Green
} catch {
    Write-Host "  [!] Docker Desktop chưa chạy. Vui lòng mở Docker Desktop và thử lại!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Đảm bảo PostgreSQL container đang chạy..." -ForegroundColor Yellow
try {
    docker compose up -d postgres 2>&1 | Out-Null
    Write-Host "  ✓ PostgreSQL container đã sẵn sàng." -ForegroundColor Green
} catch {
    Write-Host "  [*] Đang dùng database container hiện có." -ForegroundColor Gray
}

Write-Host "[3/4] Build Shared Types và Đồng bộ Prisma Database..." -ForegroundColor Yellow
cmd /c "npm.cmd run build --workspace=@ai-kanban/shared-types"
cmd /c "npm.cmd --workspace=apps/api run db:push"

Write-Host "[4/4] Khởi động Dev Server (Frontend 3000 + Backend 4000)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  🌐 Web App:    http://localhost:3000" -ForegroundColor Green
Write-Host "  🔌 API Server: http://localhost:4000/api/v1" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Start-Process "http://localhost:3000"
cmd /c "npm.cmd run dev"
