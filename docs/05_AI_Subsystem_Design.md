# AI Subsystem Architecture & Multi-LLM Strategy
## Project: AI-Powered Personal Kanban & Intelligent Daily Planner

---

## 1. Tổng quan Phân hệ AI (AI Subsystem Overview)

Phân hệ AI được thiết kế theo nguyên lý **Open-Closed Principle (OCP)** và **Interface Segregation Principle (ISP)** nhằm:
1. Cho phép cắm rút và chuyển đổi linh hoạt giữa nhiều dịch vụ LLM (**Google Gemini, OpenAI GPT, Anthropic Claude, DeepSeek, Ollama**).
2. Hỗ trợ 2 chế độ cung cấp API Key: **System Default Key** (đọc từ biến môi trường của server) và **User Custom API Key** (mã hóa đối xứng AES-256-GCM lưu trong Database).
3. Đảm bảo dữ liệu phản hồi từ AI luôn tuân thủ cấu trúc JSON nghiêm ngặt (**Structured Outputs / JSON Schema validation**) thông qua Zod schema validation.

---

## 2. Kiến trúc Design Patterns chi tiết

### 2.1. Strategy Pattern (`IAILLMStrategy`)

```typescript
// apps/api/src/domain/services/ai-llm-strategy.interface.ts
export interface DailySummaryContext {
  date: string;
  completedTasks: Array<{ title: string; spentMins: number; tags: string[] }>;
  inProgressTasks: Array<{ title: string; estimatedMins: number; spentMins: number }>;
  userReflection?: string;
  totalFocusMins: number;
}

export interface SuggestedTaskProposal {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMins: number;
  suggestedColumn: string;
  subtasks?: string[];
}

export interface DailyPlanProposal {
  summaryInsights: string;
  suggestedTasks: SuggestedTaskProposal[];
}

export interface IAILLMStrategy {
  getProviderType(): 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'DEEPSEEK';
  generateDailyPlan(context: DailySummaryContext, apiKey: string): Promise<DailyPlanProposal>;
  testConnection(apiKey: string): Promise<boolean>;
}
```

### 2.2. Hiện thực Concrete Strategies

1. **`GeminiStrategy` (`@google/genai` hoặc `@google/generative-ai`)**:
   - Sử dụng model `gemini-2.0-flash` hoặc `gemini-1.5-flash` cho tốc độ xử lý tức thì và chi phí tối ưu.
   - Kích hoạt `responseMimeType: "application/json"` và truyền JSON Schema.
2. **`OpenAIStrategy` (`openai` SDK)**:
   - Sử dụng model `gpt-4o-mini` hoặc `gpt-4o`.
   - Sử dụng tính năng `response_format: { type: "json_object" }` hoặc Structured Outputs `response_format: { type: "json_schema", ... }`.
3. **`ClaudeStrategy` (`@anthropic-ai/sdk`)**:
   - Sử dụng model `claude-3-5-sonnet` hoặc `claude-3-haiku`.
   - System prompt ép buộc trả về format JSON và strip markdown tags qua regex parser.

### 2.3. Factory Pattern (`AIServiceFactory`)

```typescript
// apps/api/src/infrastructure/ai/ai-service.factory.ts
@Injectable()
export class AIServiceFactory {
  private strategies = new Map<string, IAILLMStrategy>();

  constructor(
    private geminiStrategy: GeminiStrategy,
    private openAIStrategy: OpenAIStrategy,
    private claudeStrategy: ClaudeStrategy,
    private cryptoService: CryptoService,
    private userApiKeyRepo: UserApiKeyRepository,
    private configService: ConfigService,
  ) {
    this.strategies.set('GEMINI', this.geminiStrategy);
    this.strategies.set('OPENAI', this.openAIStrategy);
    this.strategies.set('CLAUDE', this.claudeStrategy);
  }

  async resolveProvider(userId: string, requestedProvider?: string): Promise<{ strategy: IAILLMStrategy; apiKey: string }> {
    const provider = requestedProvider || this.configService.get('DEFAULT_AI_PROVIDER', 'GEMINI');
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new BadRequestException(`AI Provider ${provider} is not supported`);
    }

    // 1. Kiểm tra xem user có lưu custom key trong DB hay không
    const userKeyRecord = await this.userApiKeyRepo.findByUserAndProvider(userId, provider);
    if (userKeyRecord && userKeyRecord.isActive) {
      const decryptedKey = this.cryptoService.decrypt(
        userKeyRecord.encryptedKey,
        userKeyRecord.iv,
        userKeyRecord.authTag,
      );
      return { strategy, apiKey: decryptedKey };
    }

    // 2. Fallback về System Default Key (.env)
    const systemKey = this.configService.get(`${provider}_API_KEY`);
    if (!systemKey) {
      throw new BadRequestException(`No valid API key found for provider ${provider}. Please configure your API key in Settings.`);
    }

    return { strategy, apiKey: systemKey };
  }
}
```

---

## 3. Bảo mật API Key với Chuẩn AES-256-GCM

API Key của người dùng không bao giờ được lưu dưới dạng Plaintext. Hệ thống sử dụng thuật toán mã hóa đối xứng **AES-256-GCM** (Galois/Counter Mode) cung cấp cả tính bảo mật (Confidentiality) và tính xác thực toàn vẹn (Authenticity):

```typescript
// apps/api/src/infrastructure/security/crypto.service.ts
@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor(private configService: ConfigService) {
    const keyString = this.configService.get<string>('ENCRYPTION_SECRET_KEY');
    this.secretKey = crypto.scryptSync(keyString, 'salt-kanban', 32);
  }

  encrypt(plainText: string): { encryptedText: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(12); // 96-bit IV chuẩn cho GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return {
      encryptedText: encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  decrypt(encryptedText: string, ivHex: string, authTagHex: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

---

## 4. System Prompt Engineering & JSON Schema Output

### 4.1. Structured System Prompt

```markdown
You are an expert productivity coach and executive personal assistant specialized in Agile Kanban workflows.
Your job is to analyze the user's daily performance, reflections, and in-progress tasks, then provide:
1. A concise, encouraging, and actionable performance review (summaryInsights).
2. A structured, realistic, prioritized task plan for tomorrow (suggestedTasks).

RULES:
- Ensure tasks for tomorrow are realistic (total estimated time should not exceed 360-480 minutes / 6-8 hours).
- Break large tasks down with clear titles and estimated minutes.
- Assign appropriate priorities: URGENT, HIGH, MEDIUM, LOW.
- Always output valid JSON strictly adhering to the specified schema.
```

### 4.2. JSON Response Output Schema
```json
{
  "summaryInsights": "Hôm nay bạn đã hoàn thành xuất sắc 3 task cốt lõi...",
  "suggestedTasks": [
    {
      "title": "Viết Unit Tests cho AIServiceFactory",
      "description": "Mock các strategy và kiểm thử fallback mechanism",
      "priority": "HIGH",
      "estimatedMins": 60,
      "suggestedColumn": "To Do",
      "subtasks": ["Mock Gemini", "Mock OpenAI", "Test AES decrypt"]
    }
  ]
}
```
