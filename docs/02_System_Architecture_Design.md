# System Architecture & Clean Architecture Blueprint
## Project: AI-Powered Personal Kanban & Intelligent Daily Planner

---

## 1. Tổng quan Kiến trúc Tổng thể (High-Level Architecture)

Hệ thống được thiết kế theo mô hình **Monorepo** hiện đại, tách biệt hoàn toàn giữa ứng dụng Giao diện người dùng (**Next.js Frontend**) và Máy chủ xử lý nghiệp vụ (**NestJS Backend**), giao tiếp qua **RESTful API** bảo mật bằng **JWT Token**.

```mermaid
flowchart TB
    subgraph ClientLayer [Client Layer]
        BrowserUser["User Web Browser (Desktop / Mobile)"]
        NextFrontend["Next.js App Router (React, Tailwind/CSS, TanStack Query, dnd-kit)"]
    end

    subgraph CDN_Hosting [Edge / Hosting Layer]
        VercelCDN["Vercel Free Tier (Next.js Edge & Static Hosting)"]
        BackendHost["Render / Fly.io / AWS ECS (Docker Container)"]
    end

    subgraph BackendLayer [Backend Application - NestJS Clean Architecture]
        API_Gateway["NestJS REST Controllers & Guards"]
        UseCases["Application Layer (Use Cases & Business Workflows)"]
        DomainCore["Domain Layer (Entities, Value Objects & Interfaces)"]
        InfraAdapters["Infrastructure Layer (Prisma, AI Adapters, Auth, Crypto)"]
    end

    subgraph DataStorage [Data & External AI Services]
        PostgresDB[("PostgreSQL Database (Supabase / AWS RDS Postgres)")]
        GeminiAPI["Google Gemini API"]
        OpenAIAPI["OpenAI API"]
        ClaudeAPI["Anthropic Claude API"]
        GoogleOAuth["Google OAuth 2.0 Identity Server"]
    end

    BrowserUser <--> NextFrontend
    NextFrontend <--> VercelCDN
    NextFrontend -- "HTTPS / JSON REST API (JWT)" --> API_Gateway
    
    API_Gateway --> UseCases
    UseCases --> DomainCore
    InfraAdapters -. "Implements" .-> DomainCore
    UseCases --> InfraAdapters

    InfraAdapters <--> PostgresDB
    InfraAdapters <--> GeminiAPI
    InfraAdapters <--> OpenAIAPI
    InfraAdapters <--> ClaudeAPI
    API_Gateway <--> GoogleOAuth
```

---

## 2. Chi tiết 4 Tầng Clean Architecture (Backend NestJS)

Backend áp dụng nguyên lý **Dependency Inversion Principle (DIP)**: Tầng bên ngoài phụ thuộc vào tầng bên trong; Tầng bên trong (Domain) hoàn toàn không biết gì về cơ sở dữ liệu, framework hoặc dịch vụ bên ngoài.

```
apps/api/src/
├── domain/                      # [TẦNG 1: DOMAIN LAYER - CORE BUSINESS RULES]
│   ├── entities/                # Thực thể nghiệp vụ thuần TypeScript (không phụ thuộc Prisma)
│   │   ├── user.entity.ts
│   │   ├── board.entity.ts
│   │   ├── column.entity.ts
│   │   ├── task.entity.ts
│   │   ├── subtask.entity.ts
│   │   ├── activity-log.entity.ts
│   │   ├── daily-journal.entity.ts
│   │   └── daily-plan.entity.ts
│   ├── value-objects/           # Value Objects bất biến (Priority, TaskStatus, TimeRange)
│   ├── repositories/            # Repository Interfaces (Hợp đồng dữ liệu)
│   │   ├── user.repository.interface.ts
│   │   ├── board.repository.interface.ts
│   │   ├── task.repository.interface.ts
│   │   ├── activity-log.repository.interface.ts
│   │   └── daily-plan.repository.interface.ts
│   └── services/                # Domain Services & AI Provider Interfaces
│       └── ai-llm-strategy.interface.ts
│
├── application/                 # [TẦNG 2: APPLICATION LAYER - USE CASES]
│   ├── use-cases/               # Mỗi Use Case là 1 class đơn nhiệm (Single Responsibility)
│   │   ├── auth/                # LoginWithGoogleUseCase, RefreshTokenUseCase
│   │   ├── boards/              # CreateBoardUseCase, GetBoardDetailsUseCase, ReorderColumnsUseCase
│   │   ├── tasks/               # CreateTaskUseCase, UpdateTaskUseCase, MoveTaskUseCase, LogPomodoroUseCase
│   │   ├── daily/               # GetTodaySummaryUseCase, SaveDailyJournalUseCase
│   │   └── ai-planner/          # GenerateDailyPlanUseCase, ApplyDailyPlanUseCase
│   ├── dtos/                    # Input DTOs & Output DTOs cho các Use Cases
│   └── ports/                   # Interfaces cho các service phụ trợ (ICryptoService, ITokenService)
│
├── infrastructure/              # [TẦNG 3: INFRASTRUCTURE LAYER - ADAPTERS & DRIVERS]
│   ├── database/                # Prisma ORM Implementation
│   │   ├── prisma.service.ts
│   │   ├── repositories/        # PrismaTaskRepository implements ITaskRepository
│   │   └── mappers/             # Chuyển đổi qua lại giữa Prisma Model và Domain Entity
│   ├── ai/                      # AI Subsystem (Design Patterns)
│   │   ├── ai-service.factory.ts
│   │   ├── strategies/          # GeminiStrategy, OpenAIStrategy, ClaudeStrategy
│   │   └── adapters/            # PromptAdapter, ResponseParserAdapter
│   ├── security/                # CryptoService (Mã hóa AES-256-GCM cho User API Keys)
│   └── auth/                    # Passport Google Strategy, JwtTokenService
│
└── presentation/                # [TẦNG 4: PRESENTATION LAYER - HTTP REST API]
    ├── controllers/             # AuthController, BoardsController, TasksController, DailyController
    ├── guards/                  # JwtAuthGuard, ResourceOwnerGuard
    ├── interceptors/            # LoggingInterceptor, ResponseTransformInterceptor
    ├── filters/                 # GlobalExceptionFilter
    └── dtos/                    # Swagger / Validation Request DTOs (Class-Validator)
```

---

## 3. Design Patterns ứng dụng chi tiết

### 3.1. Strategy Pattern cho AI Subsystem
- **Mục đích**: Cho phép hệ thống tương tác với nhiều nhà cung cấp LLM khác nhau (Google Gemini, OpenAI GPT, Anthropic Claude, DeepSeek...) mà không làm thay đổi logic lập kế hoạch của tầng Application.
- **Cấu trúc**:
  - `IAILLMStrategy`: Interface định nghĩa phương thức `generateDailyPlan(context: DailySummaryContext, userApiKey?: string): Promise<DailyPlanProposal>`.
  - `GeminiStrategy`: Hiện thực gọi Google Generative AI SDK / REST API.
  - `OpenAIStrategy`: Hiện thực gọi OpenAI Chat Completions API (hỗ trợ Structured Outputs).
  - `ClaudeStrategy`: Hiện thực gọi Anthropic Messages API.

```mermaid
classDiagram
    class IAILLMStrategy {
        <<interface>>
        +generateDailyPlan(context: DailySummaryContext, apiKey?: string) Promise~DailyPlanProposal~
        +testConnection(apiKey: string) Promise~boolean~
        +getProviderName() AIProviderType
    }

    class GeminiStrategy {
        -client: GoogleGenAI
        +generateDailyPlan(context, apiKey) Promise~DailyPlanProposal~
        +testConnection(apiKey) Promise~boolean~
        +getProviderName() AIProviderType
    }

    class OpenAIStrategy {
        -client: OpenAI
        +generateDailyPlan(context, apiKey) Promise~DailyPlanProposal~
        +testConnection(apiKey) Promise~boolean~
        +getProviderName() AIProviderType
    }

    class ClaudeStrategy {
        -client: Anthropic
        +generateDailyPlan(context, apiKey) Promise~DailyPlanProposal~
        +testConnection(apiKey) Promise~boolean~
        +getProviderName() AIProviderType
    }

    class AIServiceFactory {
        -strategies: Map~AIProviderType, IAILLMStrategy~
        -cryptoService: ICryptoService
        -userApiKeyRepo: IUserApiKeyRepository
        +getStrategyForUser(userId: string, requestedProvider?: AIProviderType) Promise~ResolvedAIProvider~
    }

    IAILLMStrategy <|.. GeminiStrategy
    IAILLMStrategy <|.. OpenAIStrategy
    IAILLMStrategy <|.. ClaudeStrategy
    AIServiceFactory ..> IAILLMStrategy : Creates & Injects
```

### 3.2. Factory Pattern (AIServiceFactory)
- **Cơ chế hoạt động**:
  1. Use Case `GenerateDailyPlanUseCase` yêu cầu `AIServiceFactory` cung cấp provider cho `userId`.
  2. `AIServiceFactory` kiểm tra xem người dùng có cấu hình Custom API Key trong DB (đã giải mã qua `CryptoService`) hay không.
  3. Nếu có, sử dụng Strategy tương ứng với Custom Key.
  4. Nếu không, fallback về System Default API Key (đọc từ biến môi trường `GEMINI_API_KEY` hoặc `OPENAI_API_KEY`).

### 3.3. Adapter Pattern (Prompt & Response Parsing)
- Chuẩn hóa format prompt: Tổng hợp Activity Logs, Pomodoro Stats, Task trạng thái dở dang và Journal của người dùng thành Prompt đồng nhất.
- Parse và validate output JSON từ LLM thành Entity `DailyPlanProposal` để đảm bảo không bao giờ bị lỗi format khi lưu vào DB hoặc gửi về Frontend.

### 3.4. Repository Pattern & Mapper Pattern
- Tách biệt hoàn toàn `TaskEntity` (Domain) và `Task` (Prisma Database Model).
- `TaskMapper.toDomain(prismaTask)` và `TaskMapper.toPersistence(taskEntity)` đảm bảo tính toàn vẹn và bất biến của Domain Entity.

---

## 4. Sequence Diagrams (Luồng xử lý cốt lõi)

### 4.1. Luồng Kéo thả Task & Ghi nhận Activity Log (Move Task Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Next.js Kanban UI (dnd-kit)
    participant Ctrl as TasksController
    participant UC as MoveTaskUseCase
    participant Repo as PrismaTaskRepository
    participant DB as PostgreSQL (Supabase/AWS)

    User->>UI: Kéo Task card từ Cột "In Progress" sang "Done"
    UI->>UI: Cập nhật giao diện ngay lập tức (Optimistic UI)
    UI->>Ctrl: PATCH /api/v1/tasks/:id/move (newColumnId, newOrderIndex)
    Ctrl->>UC: execute(userId, taskId, dto)
    UC->>Repo: findById(taskId)
    Repo->>DB: SELECT task by ID
    DB-->>Repo: task data
    Repo-->>UC: TaskEntity
    
    UC->>UC: TaskEntity.changeColumn(newColumnId, newOrderIndex)
    Note over UC: Tự động tạo ActivityLog 'TASK_MOVED' & 'TASK_COMPLETED' nếu sang cột Done
    
    UC->>Repo: updateWithActivityLog(taskEntity, activityLogEntity)
    Repo->>DB: TRANSACTION [UPDATE tasks, INSERT INTO activity_logs]
    DB-->>Repo: Transaction Success
    Repo-->>UC: Updated TaskEntity
    UC-->>Ctrl: TaskResponseDTO
    Ctrl-->>UI: 200 OK (Sync confirmed)
```

### 4.2. Luồng AI Thu thập dữ liệu & Lập kế hoạch ngày mai (AI Daily Plan Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant UI as Next.js Daily Planner UI
    participant Ctrl as DailyController
    participant UC as GenerateDailyPlanUseCase
    participant Factory as AIServiceFactory
    participant Strat as GeminiStrategy (hoặc OpenAI/Claude)
    participant LLM as Google Gemini 2.0 Flash API
    participant DB as PostgreSQL

    User->>UI: Nhập ghi chú cuối ngày (Journal) & Bấm "Generate Plan"
    UI->>Ctrl: POST /api/v1/daily/generate-plan { date, notes, preferredProvider }
    Ctrl->>UC: execute(userId, dto)
    
    UC->>DB: Lấy Activity Logs hôm nay (tasks completed, pomodoros, moves)
    DB-->>UC: List of ActivityLogs & Pending Tasks
    
    UC->>Factory: getStrategyForUser(userId, preferredProvider)
    Factory->>DB: Kiểm tra User API Key (mã hóa) trong DB
    DB-->>Factory: Encrypted Key (nếu có)
    Factory-->>UC: { strategy: GeminiStrategy, resolvedApiKey }
    
    UC->>Strat: generateDailyPlan(summaryContext, resolvedApiKey)
    Strat->>Strat: Build structured system & user prompt
    Strat->>LLM: Call Generative API (JSON Schema mode)
    LLM-->>Strat: JSON { summaryInsights, suggestedTasks: [...] }
    Strat->>Strat: Parse & Validate with Zod Schema
    Strat-->>UC: DailyPlanProposal
    
    UC->>DB: Lưu DailyJournal & DailyAIPlan vào Database
    DB-->>UC: Saved
    UC-->>Ctrl: DailyPlanResponseDTO
    Ctrl-->>UI: 200 OK { summaryInsights, suggestedTasks }
    UI-->>User: Hiển thị bảng Review & Kế hoạch đề xuất
```

---

## 5. Khả năng Mở rộng trong Tương lai (Future Extensibility)

Nhờ tuân thủ **Clean Architecture** và các **Design Patterns**, hệ thống có thể mở rộng dễ dàng:
1. **Thêm LLM Provider mới (ví dụ DeepSeek R1, Mistral, Ollama)**:
   - Chỉ cần tạo file `src/infrastructure/ai/strategies/deepseek.strategy.ts` implement `IAILLMStrategy` và thêm enum `DEEPSEEK` vào `AIProviderType`. Toàn bộ Use Cases và UI không cần thay đổi cấu trúc!
2. **Tích hợp Notification / Webhooks (Slack, Telegram, Discord)**:
   - Thêm `INotificationPort` trong Application Layer và triển khai `TelegramNotifierAdapter` trong Infrastructure Layer.
3. **Chuyển đổi Database (Supabase -> AWS Aurora / Neon / Local Postgres)**:
   - Chỉ cần cập nhật biến môi trường `DATABASE_URL` trong file `.env`, không cần sửa bất kỳ dòng code logic nào.
