# SRS - Software Requirements Specification
## Project: AI-Powered Personal Kanban & Intelligent Daily Planner

---

## 1. Giới thiệu (Introduction)
### 1.1. Mục đích tài liệu
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) này mô tả toàn diện các yêu cầu chức năng, yêu cầu phi chức năng, use cases và quy tắc nghiệp vụ cho hệ thống **AI Personal Kanban Board & Daily Planner**.

### 1.2. Phạm vi sản phẩm (Product Scope)
Hệ thống là một ứng dụng web quản lý công việc và thời gian cá nhân nâng cao kết hợp trợ lý trí tuệ nhân tạo (AI Assistant) nhằm:
1. Cho phép người dùng trực quan hóa và kiểm soát tiến độ công việc thông qua **Kanban Board** chi tiết (kéo thả, subtask, time tracking, pomodoro, đa góc nhìn).
2. Tự động thu thập dữ liệu hành vi & nhật ký làm việc trong ngày (**Daily Activity Collector**).
3. Sử dụng các mô hình ngôn ngữ lớn (**LLMs: Gemini, OpenAI, Claude, DeepSeek**) để tổng kết đánh giá năng suất và tự động gợi ý kế hoạch làm việc có cấu trúc cho ngày tiếp theo.
4. Cho phép người dùng dễ dàng chuyển đổi nhà cung cấp AI, cấu hình API key cá nhân được mã hóa bảo mật, đồng thời hỗ trợ triển khai linh hoạt trên các nền tảng đám mây (**Vercel, Render, Supabase, AWS RDS**).

---

## 2. Yêu cầu Chức năng (Functional Requirements - FR)

### FR-1: Quản lý Xác thực & Người dùng (Authentication & User Profile)
- **FR-1.1**: Đăng nhập nhanh và bảo mật thông qua Google OAuth2.
- **FR-1.2**: Quản lý phiên đăng nhập với cơ chế Dual Token (Access Token JWT ngắn hạn + Refresh Token HttpOnly Cookie / DB Session).
- **FR-1.3**: Quản lý hồ sơ người dùng cá nhân (Tên, Email, Avatar, Timezone, Cài đặt giao diện Dark/Light mode).
- **FR-1.4**: Cấu hình và quản lý các API Key của các dịch vụ AI (Google Gemini, OpenAI, Anthropic Claude, DeepSeek). Các API key này bắt buộc phải được mã hóa theo tiêu chuẩn **AES-256-GCM** trước khi lưu vào Database.

### FR-2: Quản lý Kanban Board & Công việc chi tiết (Detailed Task Management)
- **FR-2.1**: Cho phép tạo, sửa, xóa nhiều Board cho các mục đích khác nhau (Công việc, Học tập, Dự án cá nhân).
- **FR-2.2**: Quản lý các cột (Columns): Tạo cột mới, đổi tên, thay đổi thứ tự hiển thị, thiết lập giới hạn WIP (Work In Progress limit) và màu sắc nhận diện.
- **FR-2.3**: Quản lý thẻ công việc (Task Cards):
  - Tiêu đề (Title) & Nội dung mô tả chi tiết hỗ trợ định dạng Markdown (Rich Text).
  - Độ ưu tiên: `URGENT` (Khẩn cấp), `HIGH` (Cao), `MEDIUM` (Trung bình), `LOW` (Thấp).
  - Nhãn dán (Tags/Labels) có thể phân loại theo màu sắc.
  - Hạn chót (Due Date & Time).
  - Thời gian ước tính hoàn thành (Estimated Minutes) và thời gian thực tế đã bỏ ra (Spent Minutes).
  - Danh sách công việc con (Subtasks / Checklist) có thanh tiến độ (Progress bar).
- **FR-2.4**: Tương tác kéo thả (Drag-and-Drop) trực quan, mượt mà giữa các cột và sắp xếp thứ tự trong cột với cơ chế Optimistic UI.
- **FR-2.5**: Tích hợp đồng hồ Pomodoro Timer trên từng Task để ghi nhận thời gian tập trung thực tế.

### FR-3: Đa chế độ hiển thị (Multi-View System)
- **FR-3.1 (Kanban Board View)**: Hiển thị dạng bảng cột truyền thống, hỗ trợ filter theo Tag, Priority, Search text.
- **FR-3.2 (Calendar View)**: Hiển thị task trên lịch theo Due Date (Day, Week, Month view).
- **FR-3.3 (List / Table View)**: Hiển thị dạng danh sách gọn gàng cho phép sửa nhanh hàng loạt.
- **FR-3.4 (Daily Timeline View)**: Trực quan hóa tiến trình công việc trong ngày theo các khung giờ.
- **FR-3.5 (Productivity Analytics Dashboard)**: Biểu đồ thống kê số task hoàn thành theo tuần/tháng, biểu đồ thời gian Pomodoro, tỷ lệ hoàn thành đúng hạn.

### FR-4: Thu thập hoạt động trong ngày (Daily Activity Collector)
- **FR-4.1 (Automated Logging)**: Tự động ghi lại các sự kiện: Task được tạo, Task được chuyển cột, Task hoàn thành, số phiên Pomodoro hoàn thành.
- **FR-4.2 (Daily Journal / Standup Notes)**: Cho phép người dùng ghi chú cảm nghĩ cuối ngày, những khó khăn/vướng mắc (blockers), và ghi chú cá nhân.
- **FR-4.3 (Daily Context Aggregator)**: Đóng gói toàn bộ dữ liệu ngày hôm nay thành một đối tượng ngữ cảnh chuẩn hóa (`DailySummaryContext`) sẵn sàng gửi cho LLM.

### FR-5: Trợ lý AI Lập kế hoạch ngày mới (AI Daily Planner & Assistant)
- **FR-5.1**: Gửi `DailySummaryContext` tới LLM đã được người dùng chọn (Gemini / OpenAI / Claude...) cùng System Prompt tối ưu.
- **FR-5.2**: LLM trả về kết quả gồm 2 phần:
  1. **Daily Insight**: Tóm tắt đánh giá năng suất, chỉ ra các điểm nghẽn và lời khuyên tối ưu hóa thời gian.
  2. **Next-Day Action Plan**: Danh sách các Task đề xuất có cấu trúc (Title, Priority, Estimated Mins, Subtasks, Cột đề xuất).
- **FR-5.3 (Interactive Review & 1-Click Apply)**:
  - Hiển thị bảng kế hoạch gợi ý trong giao diện tương tác.
  - Người dùng có quyền chọn lọc, chỉnh sửa tiêu đề, ước tính thời gian hoặc xóa bỏ các task không mong muốn.
  - Nút **"1-Click Apply to Kanban"**: Tự động chuyển đổi tất cả task đã duyệt thành các Task Card chính thức trên Kanban Board của ngày tiếp theo.

---

## 3. Yêu cầu Phi chức năng (Non-Functional Requirements - NFR)

### NFR-1: Hiệu năng (Performance)
- Thời gian phản hồi API trung bình dưới 150ms cho các tác vụ CRUD thông thường.
- Thao tác kéo thả trên Kanban Board phải phản hồi tức thì (< 16ms, 60fps) thông qua Optimistic UI updates.
- Hỗ trợ Serverless Connection Pooling (thông qua Prisma Accelerate hoặc Supabase Connection Pooler / AWS RDS Proxy).

### NFR-2: Tính mở rộng & Kiến trúc (Scalability & Extensibility)
- Backend áp dụng **Clean Architecture** để dễ dàng bổ sung tính năng mới (ví dụ: Tích hợp Google Calendar, Slack Notifications, Team Workspace) mà không làm ảnh hưởng core business logic.
- Áp dụng **Strategy & Factory Pattern** cho AI Module để việc thêm một LLM Provider mới chỉ cần tạo một file Strategy độc lập và đăng ký vào Factory.

### NFR-3: Bảo mật & Riêng tư (Security & Privacy)
- Toàn bộ kết nối sử dụng HTTPS / TLS 1.3.
- User API Key được mã hóa đối xứng mức độ quân sự **AES-256-GCM** với IV ngẫu nhiên và Authentication Tag.
- Xác thực JWT với chữ ký mã hóa an toàn và kiểm tra quyền sở hữu tài nguyên (User Authorization Guard).

### NFR-4: Khả năng chuyển dịch Cloud (Portability & Cloud Independence)
- Database schema viết bằng Prisma tương thích hoàn toàn 100% giữa **PostgreSQL trên Supabase** và **AWS RDS PostgreSQL**.
- Backend được container hóa bằng **Dockerfile** chuẩn, có thể deploy trên Render, Railway, Fly.io, AWS ECS, hoặc AWS App Runner.
- Frontend Next.js tương thích chuẩn Vercel Edge / Serverless deployment.

---

## 4. Bảng Ma trận Phân quyền & Use Case (Traceability Matrix)

| Mã Use Case | Tên Use Case | Tác nhân (Actor) | Mô tả ngắn |
| :--- | :--- | :--- | :--- |
| **UC-01** | Đăng nhập Google | Khách / User | Đăng nhập qua OAuth2, cấp JWT token |
| **UC-02** | Cấu hình API Key AI | User | Thêm/Sửa Gemini/OpenAI API Key (mã hóa DB) |
| **UC-03** | Quản lý Board & Column | User | Tạo board, đổi thứ tự column, đặt WIP limit |
| **UC-04** | Kéo thả & Cập nhật Task | User | Kéo thả card giữa các cột, ghi nhận activity log |
| **UC-05** | Chạy Pomodoro Tracker | User | Bấm start/stop timer, lưu số phút vào task |
| **UC-06** | Xem Đa góc nhìn (Multi-view) | User | Chuyển đổi giữa Kanban, Calendar, List, Timeline |
| **UC-07** | Xem Thống kê Năng suất | User | Xem dashboard biểu đồ vận tốc và thời gian |
| **UC-08** | Ghi Daily Journal | User | Viết ghi chú tổng kết cuối ngày |
| **UC-09** | Gọi AI Lập Kế Hoạch | User | Gửi context ngày hôm nay tới LLM |
| **UC-10** | 1-Click Import Plan | User | Duyệt task gợi ý và tự động tạo card vào Kanban |
