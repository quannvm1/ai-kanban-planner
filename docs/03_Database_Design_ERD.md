# Database Design & ERD Specification
## Project: AI-Powered Personal Kanban & Intelligent Daily Planner

---

## 1. Tổng quan Thiết kế Cơ sở Dữ liệu

Hệ thống sử dụng **PostgreSQL** làm cơ sở dữ liệu quan hệ chính (RDBMS) kết hợp với **Prisma ORM**.
Kiến trúc schema được thiết kế với các tiêu chí:
- **Tính di động (Cloud Portability)**: Tương thích 100% khi chạy trên **Supabase PostgreSQL** (với Connection Pooling qua PgBouncer/Supavisor), **AWS RDS PostgreSQL** (Multi-AZ hoặc Single-AZ), hoặc **Local Docker PostgreSQL**.
- **Chuẩn hóa dữ liệu (Normalization 3NF)**: Tránh dư thừa dữ liệu, đảm bảo tính toàn vẹn quan hệ (Referential Integrity) với các ràng buộc khóa ngoại (Foreign Keys) và cơ chế `ON DELETE CASCADE`.
- **Hiệu năng truy vấn (Indexing Strategy)**: Tối ưu index trên các cột thường xuyên lọc (`userId`, `recordedAt`, `date`, `columnId`, `orderIndex`).
- **Bảo mật dữ liệu (Data Security)**: Lưu trữ API Keys đã mã hóa đối xứng AES-256-GCM (gồm ciphertext, initialization vector `iv` và authentication tag `authTag`).

---

## 2. Sơ đồ Thực thể Quan hệ (Entity Relationship Diagram - ERD)

```mermaid
erDiagram
    USERS ||--o{ BOARDS : "owns"
    USERS ||--o{ USER_API_KEYS : "configures"
    USERS ||--o{ ACTIVITY_LOGS : "generates"
    USERS ||--o{ DAILY_JOURNALS : "writes"
    USERS ||--o{ POMODORO_SESSIONS : "records"

    BOARDS ||--|{ COLUMNS : "contains"
    BOARDS ||--o{ TASKS : "groups"
    COLUMNS ||--o{ TASKS : "organizes"

    TASKS ||--o{ SUBTASKS : "breaks_down"
    TASKS ||--o{ ACTIVITY_LOGS : "tracks"
    TASKS ||--o{ POMODORO_SESSIONS : "associates"

    DAILY_JOURNALS ||--o| DAILY_AI_PLANS : "analyzed_into"
    DAILY_AI_PLANS ||--o{ SUGGESTED_TASKS : "recommends"

    USERS {
        uuid id PK
        string email UK
        string name
        string avatar_url
        string google_id UK
        enum role
        datetime created_at
        datetime updated_at
    }

    USER_API_KEYS {
        uuid id PK
        uuid user_id FK
        enum provider UK
        string encrypted_key
        string iv
        string auth_tag
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    BOARDS {
        uuid id PK
        uuid user_id FK
        string title
        string description
        datetime created_at
        datetime updated_at
    }

    COLUMNS {
        uuid id PK
        uuid board_id FK
        string title
        int order_index
        int wip_limit
        string color_hex
        datetime created_at
        datetime updated_at
    }

    TASKS {
        uuid id PK
        uuid board_id FK
        uuid column_id FK
        string title
        text description
        enum priority
        int order_index
        datetime due_date
        int estimated_mins
        int spent_mins
        boolean is_completed
        datetime completed_at
        string_array tags
        datetime created_at
        datetime updated_at
    }

    SUBTASKS {
        uuid id PK
        uuid task_id FK
        string title
        boolean is_done
        int order_index
        datetime created_at
        datetime updated_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        uuid user_id FK
        uuid task_id FK
        string action
        jsonb details
        datetime recorded_at
    }

    DAILY_JOURNALS {
        uuid id PK
        uuid user_id FK
        date date UK
        text notes
        datetime created_at
        datetime updated_at
    }

    DAILY_AI_PLANS {
        uuid id PK
        uuid daily_journal_id FK_UK
        enum provider_used
        text summary_insights
        jsonb raw_response
        datetime created_at
    }

    SUGGESTED_TASKS {
        uuid id PK
        uuid daily_ai_plan_id FK
        string title
        text description
        enum priority
        int estimated_mins
        string suggested_column
        boolean is_applied
        uuid created_task_id
    }

    POMODORO_SESSIONS {
        uuid id PK
        uuid user_id FK
        uuid task_id FK
        int duration_mins
        datetime completed_at
    }
```

---

## 3. Chi tiết các Bảng Dữ liệu (Data Dictionary)

### 3.1. Bảng `users`
Lưu trữ thông tin tài khoản người dùng đăng nhập bằng Google OAuth.
- `id` (UUID, PK): Định danh duy nhất.
- `email` (VARCHAR, UNIQUE, NOT NULL): Email Google.
- `name` (VARCHAR): Tên hiển thị người dùng.
- `avatar_url` (VARCHAR): Ảnh đại diện từ Google.
- `google_id` (VARCHAR, UNIQUE): ID người dùng phía Google OAuth.
- `role` (ENUM: `USER`, `ADMIN`): Vai trò.
- `created_at` / `updated_at` (TIMESTAMPTZ): Thời gian tạo/cập nhật.

### 3.2. Bảng `user_api_keys`
Lưu trữ API Keys các mô hình AI do người dùng tự cấu hình.
- `id` (UUID, PK): Định danh.
- `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE): ID người dùng.
- `provider` (ENUM: `GEMINI`, `OPENAI`, `CLAUDE`, `DEEPSEEK`): Nhà cung cấp AI.
- `encrypted_key` (TEXT, NOT NULL): Chuỗi khóa đã mã hóa AES-256-GCM.
- `iv` (VARCHAR, NOT NULL): Initialization Vector 12 bytes hex/base64.
- `auth_tag` (VARCHAR, NOT NULL): Authentication Tag 16 bytes hex/base64.
- `is_active` (BOOLEAN, DEFAULT true): Trạng thái kích hoạt.
- *Constraint*: `UNIQUE(user_id, provider)`.

### 3.3. Bảng `boards` & `columns`
- `boards`: Lưu các bảng Kanban.
- `columns`: Lưu các cột trạng thái (`Backlog`, `To Do`, `In Progress`, `Review`, `Done`), hỗ trợ `wip_limit` để giới hạn số lượng task đang làm cùng lúc (tránh quá tải).

### 3.4. Bảng `tasks` & `subtasks`
- `tasks`: Thẻ công việc chi tiết.
  - `priority`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`.
  - `tags`: Mảng chuỗi (`text[]`) lưu các nhãn (ví dụ: `["Backend", "Study", "Bug"]`).
  - `estimated_mins` & `spent_mins`: Quản lý thời gian dự kiến vs thực tế.
- `subtasks`: Danh sách checklist công việc con thuộc task.

### 3.5. Bảng `activity_logs`
Ghi lại mọi hoạt động trong ngày phục vụ tính năng Daily AI Summarizer:
- `action`: `'TASK_CREATED'` | `'TASK_MOVED'` | `'TASK_COMPLETED'` | `'POMODORO_COMPLETED'`.
- `details` (JSONB): Thông tin chi tiết sự kiện (ví dụ: `{ "fromColumn": "To Do", "toColumn": "Done", "duration": 25 }`).
- Index: `INDEX idx_activity_user_time (user_id, recorded_at DESC)`.

### 3.6. Bảng `daily_journals`, `daily_ai_plans` & `suggested_tasks`
- `daily_journals`: Lưu ghi chú cuối ngày của user theo ngày (`UNIQUE(user_id, date)`).
- `daily_ai_plans`: Lưu bản tổng kết và đánh giá của LLM.
- `suggested_tasks`: Lưu danh sách các task do LLM đề xuất cho ngày hôm sau; khi người dùng bấm "Apply", `is_applied = true` và liên kết với `created_task_id`.

---

## 4. Hướng dẫn Chuyển đổi giữa Supabase và AWS RDS

Nhờ Prisma ORM, việc chuyển đổi giữa các Cloud Provider hoàn toàn trong suốt với code:

### Cấu hình Supabase PostgreSQL
```env
# .env cho Supabase (Hỗ trợ Connection Pooling)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### Cấu hình AWS RDS PostgreSQL
```env
# .env cho AWS RDS
DATABASE_URL="postgresql://dbadmin:[PASSWORD]@[RDS_ENDPOINT].rds.amazonaws.com:5432/kanban_db?schema=public&connection_limit=20"
DIRECT_URL="postgresql://dbadmin:[PASSWORD]@[RDS_ENDPOINT].rds.amazonaws.com:5432/kanban_db?schema=public"
```

### Lệnh chạy Migration
```bash
# Chạy migration tạo bảng tự động
npx prisma migrate dev --name init_db

# Tạo Prisma Client
npx prisma generate
```
