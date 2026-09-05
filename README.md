# AI-Powered Personal Kanban & Intelligent Daily Planner 🚀

> Hệ thống quản lý công việc cá nhân toàn diện, tích hợp Clean Architecture trên NestJS, giao diện Next.js App Router mượt mà, và Trợ lý AI đa nhà cung cấp (Gemini, OpenAI, Claude, DeepSeek) tự động tổng hợp hoạt động trong ngày & lên kế hoạch hành động chi tiết cho hôm sau.

---

## 🌟 Điểm nổi bật (Key Features)

- 📋 **Quản lý Task cá nhân chuyên sâu**: Kéo thả Kanban (@dnd-kit) mượt mà, hỗ trợ Checklist/Subtasks, WIP Limits, Tags, Độ ưu tiên, Due Date, Markdown notes.
- ⏱️ **Pomodoro & Time Tracking**: Đo đếm thời gian tập trung thực tế so với thời gian ước tính, tự động ghi nhận vào lịch sử hoạt động.
- 🔄 **Đa góc nhìn (Multi-view)**: Chuyển đổi linh hoạt giữa Kanban Board, Calendar View, List / Table View, và Analytics Dashboard.
- 🤖 **Daily Activity Collector & AI Standup**: Tự động gom log công việc hôm nay + ghi chú cá nhân (Journal) -> Gửi sang LLM phân tích đánh giá năng suất -> Nhận kế hoạch hành động ngày mai có cấu trúc -> **1-Click Import trực tiếp vào Kanban Board**.
- 🧩 **Clean Architecture & Multi-LLM Strategy**: Phân tách 4 tầng nghiêm ngặt (Domain, Application, Infrastructure, Presentation). Áp dụng Strategy & Factory Pattern hỗ trợ Google Gemini, OpenAI, Claude, DeepSeek.
- 🔐 **Bảo mật chuẩn AES-256-GCM**: Mã hóa toàn bộ User API Keys cá nhân lưu trong DB.
- ☁️ **Linh hoạt Cloud & Database**: Dễ dàng chuyển đổi giữa **Supabase Postgres** (Free) và **AWS RDS Postgres** (Study/Production). Frontend sẵn sàng cho Vercel, Backend chuẩn hóa qua Docker Container (Render/Fly.io/AWS ECS).

---

## 📚 Bộ Tài Liệu SDLC Hoàn Chỉnh

Toàn bộ tài liệu kỹ thuật chi tiết đã được xuất ra thư mục [`docs/`](./docs):

1. 📄 [**01_SRS_Requirement_Analysis.md**](./docs/01_SRS_Requirement_Analysis.md) - Đặc tả yêu cầu phần mềm & Use Cases
2. 🏗️ [**02_System_Architecture_Design.md**](./docs/02_System_Architecture_Design.md) - Thiết kế Clean Architecture & Design Patterns
3. 🗄️ [**03_Database_Design_ERD.md**](./docs/03_Database_Design_ERD.md) - Sơ đồ quan hệ thực thể ERD & Prisma Schema
4. 🔌 [**04_API_Specification.md**](./docs/04_API_Specification.md) - Đặc tả RESTful API chi tiết
5. 🧠 [**05_AI_Subsystem_Design.md**](./docs/05_AI_Subsystem_Design.md) - Thiết kế phân hệ AI đa nhà cung cấp & AES-256 Crypto
6. 🚀 [**06_DevOps_CI_CD_Deployment_Guide.md**](./docs/06_DevOps_CI_CD_Deployment_Guide.md) - Hướng dẫn Vercel, Docker, AWS RDS & CI/CD
7. 🧪 [**07_Testing_Strategy_SDLC.md**](./docs/07_Testing_Strategy_SDLC.md) - Kế hoạch kiểm thử Unit, Integration, E2E & QA

---

## 🛠️ Cấu trúc Thư mục Monorepo

```
ai-kanban-planner/
├── apps/
│   ├── api/                   # NestJS Backend (Clean Architecture)
│   │   ├── prisma/            # PostgreSQL Schema & Seed script
│   │   ├── src/
│   │   │   ├── domain/        # Entities, Repository Interfaces, Value Objects
│   │   │   ├── application/   # Use Cases (Boards, Tasks, Daily AI Planner, Auth)
│   │   │   ├── infrastructure/# Prisma Repos, AI Strategy & Factory, AES-256 Crypto
│   │   │   └── presentation/  # REST Controllers, Guards, Filters, Interceptors
│   │   └── Dockerfile
│   └── web/                   # Next.js Frontend (App Router, Tailwind, dnd-kit)
│       └── src/
│           ├── app/           # Pages (Dashboard, Login, Settings, Auth Callback)
│           ├── components/    # Kanban, Views, Pomodoro, AI Standup Modal
│           └── lib/           # Axios API Client & Zustand Auth Store
├── packages/
│   └── shared-types/          # Shared TypeScript DTOs, Enums, Interfaces
├── docs/                      # SDLC Documentation Suite
├── docker-compose.yml         # Local Database & Service containerization
└── turbo.json                 # Turborepo build pipeline
```

---

## 🚀 Hướng dẫn Chạy Dự án (Getting Started)

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Biến Môi trường
Tạo file `.env` trong `apps/api/`:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/kanban_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
ENCRYPTION_SECRET_KEY="32-bytes-secure-random-encryption-key-for-aes256"

# Google OAuth2 (Tùy chọn nếu dùng dev login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Provider System Fallback Key
DEFAULT_AI_PROVIDER="GEMINI"
GEMINI_API_KEY="AIzaSyYourGeminiApiKey"
```

### 3. Khởi tạo Database (Supabase / AWS RDS hoặc Local Docker)
```bash
# Bật database local (nếu dùng Docker)
docker-compose up postgres -d

# Sinh Prisma Client & Migrate
cd apps/api
npx prisma db push
npx ts-node prisma/seed.ts
```

### 4. Khởi động Toàn bộ Hệ thống (Dev Mode)
```bash
# Chạy đồng thời cả Frontend Next.js (port 3000) và Backend NestJS (port 4000)
npm run dev
```

- 🌐 **Frontend**: `http://localhost:3000`
- ⚙️ **Backend API**: `http://localhost:4000/api/v1`
- 📖 **Swagger API Docs**: `http://localhost:4000/docs`
