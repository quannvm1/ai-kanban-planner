@echo off
@setlocal EnableDelayedExpansion
chcp 65001 >nul

echo ========================================================
echo   AI Kanban and Intelligent Daily Planner
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking PostgreSQL container...
docker compose up -d postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Docker compose returned status code %errorlevel%. Continuing with existing services...
)

echo [2/4] Building Shared Types...
call npm.cmd run build --workspace=@ai-kanban/shared-types

echo [3/4] Syncing Prisma Database Schema...
call npm.cmd --workspace=apps/api run db:push

echo [4/4] Starting Web (Port 3000) and API Server (Port 4000)...
echo.
echo ========================================================
echo   Web App:    http://localhost:3000
echo   API Server: http://localhost:4000/api/v1
echo   Swagger:    http://localhost:4000/docs
echo ========================================================
echo.

start http://localhost:3000
call npm.cmd run dev
