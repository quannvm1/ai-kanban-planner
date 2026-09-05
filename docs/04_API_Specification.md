# RESTful API Specification
## Project: AI-Powered Personal Kanban & Intelligent Daily Planner

---

## 1. Tiêu chuẩn API Chung

- **Base URL**: `/api/v1`
- **Format**: `application/json; charset=utf-8`
- **Authentication**: `Authorization: Bearer <access_token>` (trong HTTP Request Header)
- **Chuẩn định dạng phản hồi (Standard Response Envelope)**:

### Phản hồi thành công (Success Response):
```json
{
  "success": true,
  "data": { ... },
  "message": "Action completed successfully",
  "timestamp": "2026-09-04T10:00:00.000Z"
}
```

### Phản hồi lỗi (Error Response):
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["title must not be empty", "priority must be a valid enum value"],
  "timestamp": "2026-09-04T10:00:00.000Z",
  "path": "/api/v1/tasks"
}
```

---

## 2. Chi tiết các Endpoint

### 2.1. Authentication & User Profile

#### `GET /api/v1/auth/google`
- **Mục đích**: Bắt đầu chuyển hướng sang Google OAuth2 Consent Screen.
- **Quyền**: Public.

#### `GET /api/v1/auth/google/callback`
- **Mục đích**: Callback URL nhận mã code từ Google, đồng bộ/tạo user, cấp Tokens.
- **Response**: Trả về Access Token JWT và set Cookie `refresh_token` (HttpOnly).
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1f728c3-4d39-4d69-8732-c840f92b7eb1",
      "email": "user@example.com",
      "name": "Nguyen Van A",
      "avatarUrl": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

#### `POST /api/v1/auth/refresh`
- **Mục đích**: Cấp mới Access Token khi token cũ hết hạn.
- **Request**: Cookie `refresh_token` hoặc Body `{ "refreshToken": "..." }`.

#### `POST /api/v1/users/api-keys`
- **Mục đích**: Lưu / Cập nhật API Key cá nhân (Gemini, OpenAI, Claude...). Key sẽ được backend mã hóa bằng AES-256-GCM trước khi lưu vào DB.
- **Request Body**:
```json
{
  "provider": "GEMINI",
  "apiKey": "AIzaSyD-sample-gemini-key-12345"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "provider": "GEMINI",
    "maskedKey": "AIza****2345",
    "isActive": true,
    "updatedAt": "2026-09-04T10:30:00.000Z"
  }
}
```

---

### 2.2. Kanban Boards, Columns & Tasks

#### `GET /api/v1/boards`
- **Mục đích**: Lấy danh sách Boards của User hiện tại.
- **Response**: Array of Board summary items.

#### `GET /api/v1/boards/:id`
- **Mục đích**: Lấy chi tiết 1 Board kèm toàn bộ Columns, Tasks, Subtasks.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "b0811b7d-697b-402a-9e19-915f013d115e",
    "title": "Personal Daily Sprint",
    "columns": [
      {
        "id": "col-todo",
        "title": "To Do",
        "orderIndex": 0,
        "wipLimit": 10,
        "tasks": [
          {
            "id": "task-01",
            "title": "Nghiên cứu Next.js App Router Server Actions",
            "description": "Đọc docs và viết prototype",
            "priority": "HIGH",
            "orderIndex": 0,
            "estimatedMins": 60,
            "spentMins": 25,
            "tags": ["Study", "NextJS"],
            "subtasks": [
              { "id": "sub-1", "title": "Đọc docs", "isDone": true },
              { "id": "sub-2", "title": "Viết demo", "isDone": false }
            ]
          }
        ]
      }
    ]
  }
}
```

#### `POST /api/v1/tasks`
- **Mục đích**: Tạo một Task mới.
- **Request Body**:
```json
{
  "boardId": "b0811b7d-697b-402a-9e19-915f013d115e",
  "columnId": "col-todo",
  "title": "Hoàn thành tài liệu SDLC",
  "description": "# Nhiệm vụ\n- Viết đầy đủ các tài liệu SRS, Arch, DB",
  "priority": "HIGH",
  "dueDate": "2026-09-05T18:00:00.000Z",
  "estimatedMins": 120,
  "tags": ["Documentation", "Design"],
  "subtasks": [
    { "title": "SRS Doc" },
    { "title": "Architecture Doc" }
  ]
}
```

#### `PATCH /api/v1/tasks/:id/move`
- **Mục đích**: Di chuyển Task sang cột mới hoặc đổi vị trí trong cột (kéo thả Kanban).
- **Request Body**:
```json
{
  "targetColumnId": "col-done",
  "newOrderIndex": 0
}
```
- **Ghi chú**: Tự động kích hoạt Domain Event để ghi nhận `ActivityLog` với action `TASK_MOVED` hoặc `TASK_COMPLETED`.

#### `POST /api/v1/tasks/:id/pomodoro`
- **Mục đích**: Ghi nhận hoàn thành 1 phiên tập trung Pomodoro cho task.
- **Request Body**: `{ "durationMins": 25 }`

---

### 2.3. AI Daily Collector & Next-Day Planner

#### `GET /api/v1/daily/today-summary`
- **Mục đích**: Lấy dữ liệu tổng hợp hoạt động trong ngày (các task đã hoàn thành, số phút Pomodoro, các task còn dở dang).
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "date": "2026-09-04",
    "completedTasksCount": 4,
    "totalSpentMins": 150,
    "completedTasks": [
      { "id": "t1", "title": "Setup Turborepo Monorepo", "spentMins": 45 },
      { "id": "t2", "title": "Design Prisma Schema", "spentMins": 50 }
    ],
    "inProgressTasks": [
      { "id": "t3", "title": "Triển khai Clean Architecture NestJS", "estimatedMins": 90, "spentMins": 30 }
    ],
    "todayJournal": "Hôm nay hoàn thành thiết kế kiến trúc tốt, nhưng còn vướng chỗ cấu hình CORS."
  }
}
```

#### `POST /api/v1/daily/generate-plan`
- **Mục đích**: Gửi dữ liệu ngày hôm nay sang LLM để nhận tóm tắt insight và kế hoạch gợi ý cho ngày mai.
- **Request Body**:
```json
{
  "date": "2026-09-04",
  "notes": "Cần tập trung giải quyết dứt điểm phần AI Strategy và chuẩn bị deploy Render.",
  "preferredProvider": "GEMINI"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "dailyPlanId": "dp-9876",
    "providerUsed": "GEMINI",
    "summaryInsights": "Bạn đã có một ngày làm việc hiệu quả với 150 phút tập trung cao độ và hoàn thành 4 task quan trọng. Cần lưu ý dành thời gian giải quyết task Clean Architecture NestJS đang dở dang đầu ngày mai.",
    "suggestedTasks": [
      {
        "id": "sug-1",
        "title": "Hoàn thiện AIServiceFactory & GeminiStrategy",
        "description": "Viết Strategy Pattern và Unit test cho việc gọi Gemini API",
        "priority": "HIGH",
        "estimatedMins": 60,
        "suggestedColumn": "To Do"
      },
      {
        "id": "sug-2",
        "title": "Kiểm thử kết nối Database Supabase và AWS RDS",
        "description": "Chạy migration và test connection pool",
        "priority": "MEDIUM",
        "estimatedMins": 45,
        "suggestedColumn": "To Do"
      }
    ]
  }
}
```

#### `POST /api/v1/daily/apply-plan`
- **Mục đích**: Người dùng sau khi duyệt/sửa danh sách gợi ý sẽ bấm Apply để hệ thống tự động tạo Task cards trên Kanban Board.
- **Request Body**:
```json
{
  "boardId": "b0811b7d-697b-402a-9e19-915f013d115e",
  "approvedTasks": [
    {
      "suggestedTaskId": "sug-1",
      "title": "Hoàn thiện AIServiceFactory & GeminiStrategy",
      "description": "Viết Strategy Pattern và Unit test",
      "priority": "HIGH",
      "estimatedMins": 60,
      "columnId": "col-todo"
    }
  ]
}
```
- **Response (201 Created)**: Trả về danh sách các Task mới đã được thêm thành công vào Kanban Board.
