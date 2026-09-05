# Bộ Tài Liệu SDLC & Kiến Trúc Kỹ Thuật (System Design & SDLC Suite)
## Dự án: AI-Powered Personal Kanban & Intelligent Daily Planner

Bộ tài liệu hoàn chỉnh được xây dựng theo chuẩn quy trình phát triển phần mềm (Software Development Life Cycle - SDLC), phục vụ việc phát triển, kiểm thử, vận hành và mở rộng hệ thống.

---

## 📑 Danh mục Tài liệu Kỹ thuật

| STT | Tài liệu | Mô tả nội dung |
| :---: | :--- | :--- |
| **01** | [**01_SRS_Requirement_Analysis.md**](./01_SRS_Requirement_Analysis.md) | Đặc tả yêu cầu phần mềm: Yêu cầu chức năng (FR), phi chức năng (NFR), Use Case và ma trận phân quyền. |
| **02** | [**02_System_Architecture_Design.md**](./02_System_Architecture_Design.md) | Thiết kế kiến trúc tổng thể, Clean Architecture 4 tầng cho NestJS, sơ đồ tuần tự (Sequence Diagram), các Design Patterns (Strategy, Factory, Adapter, Repository). |
| **03** | [**03_Database_Design_ERD.md**](./03_Database_Design_ERD.md) | Sơ đồ quan hệ thực thể (ERD), Data Dictionary, Prisma Schema và hướng dẫn chuyển đổi linh hoạt giữa Supabase và AWS RDS. |
| **04** | [**04_API_Specification.md**](./04_API_Specification.md) | Đặc tả RESTful API chi tiết: Endpoints, Request/Response payload, HTTP status codes, Data Transfer Objects (DTOs). |
| **05** | [**05_AI_Subsystem_Design.md**](./05_AI_Subsystem_Design.md) | Thiết kế phân hệ AI đa nhà cung cấp (Gemini, OpenAI, Claude), bảo mật mã hóa AES-256-GCM cho API Key và Structured Outputs. |
| **06** | [**06_DevOps_CI_CD_Deployment_Guide.md**](./06_DevOps_CI_CD_Deployment_Guide.md) | Hướng dẫn triển khai Docker, Vercel Free, Render/AWS, GitHub Actions CI/CD và bảng biến môi trường. |
| **07** | [**07_Testing_Strategy_SDLC.md**](./07_Testing_Strategy_SDLC.md) | Chiến lược kiểm thử đa tầng (Unit, Integration, E2E), Mocking AI và Checklist an toàn thông tin. |

---

## 🚀 Công nghệ Cốt lõi (Tech Stack)

- **Frontend**: Next.js 14+ (App Router), React 18, Tailwind CSS / Modern Glassmorphism CSS, `@tanstack/react-query`, `@dnd-kit`, `zustand`, `lucide-react`.
- **Backend**: NestJS 10+ (Clean Architecture: Domain, Application, Infrastructure, Presentation), Passport Google OAuth2, JWT, `class-validator`, AES-256-GCM Crypto.
- **AI Integration**: Google Generative AI (Gemini 2.0/1.5 Flash), OpenAI API, Anthropic Claude API (Strategy & Factory Pattern).
- **Database & ORM**: PostgreSQL (Supabase / AWS RDS), Prisma ORM v5+.
- **DevOps & CI/CD**: Docker (Multi-stage build), GitHub Actions, Vercel (Frontend), Render / Railway / AWS ECS (Backend).
