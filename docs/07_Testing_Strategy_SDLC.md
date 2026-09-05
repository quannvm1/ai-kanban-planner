# Testing Strategy & Quality Assurance Plan
## Project: AI-Powered Personal Kanban & Intelligent Daily Planner

---

## 1. Kim tự tháp Kiểm thử (Testing Pyramid)

Hệ thống áp dụng chiến lược kiểm thử đa tầng:

```
           / \
          /   \
         / E2E \       <-- Playwright / Cypress: Test luồng UI kéo thả & Login
        /-------\
       /  Integ  \     <-- Supertest + Testcontainers / SQLite: Test REST API & DB
      /-----------\
     /  Unit Test  \   <-- Jest: Test Domain Entities, Use Cases, Crypto, AI Strategies
    /---------------\
```

---

## 2. Kế hoạch Kiểm thử theo từng Tầng

### 2.1. Unit Testing (Jest)
- **Domain Layer**:
  - Test validation logic trên các Domain Entities (ví dụ: không thể tạo task không có title, wip_limit validation).
  - Test Value Objects (Priority conversion, Time estimation calculations).
- **Application Layer (Use Cases)**:
  - Test từng Use Case với Mock Repositories (`jest-mock-extended`).
  - Kiểm thử Use Case `MoveTaskUseCase`: Đảm bảo khi task chuyển sang cột "Done", cờ `isCompleted = true` và `completedAt` được gán chính xác.
- **Infrastructure Security**:
  - Test `CryptoService`: Đảm bảo plaintext được mã hóa thành công với IV và AuthTag, và khi decrypt trả về đúng 100% chuỗi ban đầu.
- **AI Subsystem**:
  - Mock `AIServiceFactory`: Test cơ chế fallback khi user chưa nhập custom key thì hệ thống tự động lấy System Key.
  - Test `PromptAdapter` và Zod validation khi LLM trả về chuỗi JSON lỗi / thiếu trường.

### 2.2. Integration Testing (NestJS Testing Module + Supertest)
- Test toàn bộ luồng REST API với test database:
  - `POST /api/v1/auth/google/callback` -> Cấp token JWT hợp lệ.
  - `POST /api/v1/tasks` -> Tạo task thành công và lưu vào PostgreSQL.
  - `PATCH /api/v1/tasks/:id/move` -> Kéo task và xác nhận `activity_logs` được tạo tự động.
  - `POST /api/v1/daily/apply-plan` -> Import danh sách task đề xuất vào đúng board.

### 2.3. End-to-End Testing (Playwright)
- Test trên môi trường trình duyệt thật:
  1. Đăng nhập qua Google (Mocked Auth Token).
  2. Tạo một Board mới "Sprint 1".
  3. Kéo thả Task Card từ cột "To Do" sang cột "In Progress".
  4. Chạy Pomodoro Timer và ghi nhận hoàn thành.
  5. Mở tab "Daily Planner", viết vài dòng journal, bấm "Generate Plan" và xác nhận xuất hiện gợi ý.
  6. Bấm "Apply to Board" và kiểm tra board cập nhật các task mới.

---

## 3. Checklist An toàn Thông tin & Bảo mật (Security Checklist)

- [x] **Không lưu Plaintext API Key**: Mã hóa 100% bằng AES-256-GCM.
- [x] **Rate Limiting (Throttler)**: Bảo vệ API chống spam / DDoS (tối đa 100 requests/phút).
- [x] **CORS Configuration**: Chỉ cho phép domain của Next.js Frontend truy cập.
- [x] **Input Validation & Sanitization**: Sử dụng `class-validator` và `class-transformer` với `whitelist: true` và `forbidNonWhitelisted: true`.
- [x] **Database SQL Injection Protection**: Prisma ORM sử dụng Prepared Statements tự động ngăn chặn hoàn toàn SQL Injection.
