import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAILLMStrategy } from '../../domain/services/ai-llm-strategy.interface';
import { AIProviderType } from '@ai-kanban/shared-types';
import { GeminiStrategy } from './strategies/gemini.strategy';
import { OpenAIStrategy } from './strategies/openai.strategy';
import { ClaudeStrategy } from './strategies/claude.strategy';
import { CryptoService } from '../security/crypto.service';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

export interface ResolvedAIProvider {
  strategy: IAILLMStrategy;
  apiKey: string;
  provider: AIProviderType;
  isCustomUserKey: boolean;
}

@Injectable()
export class AIServiceFactory {
  private readonly logger = new Logger(AIServiceFactory.name);
  private strategies = new Map<AIProviderType, IAILLMStrategy>();

  constructor(
    private geminiStrategy: GeminiStrategy,
    private openAIStrategy: OpenAIStrategy,
    private claudeStrategy: ClaudeStrategy,
    private cryptoService: CryptoService,
    private configService: ConfigService,
    @Inject(USER_REPOSITORY) private userRepo: IUserRepository,
  ) {
    this.strategies.set(AIProviderType.GEMINI, this.geminiStrategy);
    this.strategies.set(AIProviderType.OPENAI, this.openAIStrategy);
    this.strategies.set(AIProviderType.CLAUDE, this.claudeStrategy);
  }

  async resolveProviderForUser(
    userId: string,
    requestedProvider?: AIProviderType,
  ): Promise<ResolvedAIProvider> {
    const provider =
      requestedProvider ||
      (this.configService.get<string>('DEFAULT_AI_PROVIDER', 'GEMINI') as AIProviderType);

    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new BadRequestException(`Nhà cung cấp AI '${provider}' chưa được hỗ trợ.`);
    }

    // 1. Check if user configured custom API key in Database
    const userKeyRecord = await this.userRepo.findApiKey(userId, provider);
    if (userKeyRecord && userKeyRecord.isActive) {
      try {
        const decryptedKey = this.cryptoService.decrypt(
          userKeyRecord.encryptedKey,
          userKeyRecord.iv,
          userKeyRecord.authTag,
        );
        return {
          strategy,
          apiKey: decryptedKey,
          provider,
          isCustomUserKey: true,
        };
      } catch (err) {
        this.logger.warn(`Could not decrypt user custom key for provider ${provider}. Falling back to system key.`);
      }
    }

    // 2. Fallback to System Environment Key
    let systemKey = '';
    if (provider === AIProviderType.GEMINI) {
      systemKey = this.configService.get<string>('GEMINI_API_KEY', '');
    } else if (provider === AIProviderType.OPENAI) {
      systemKey = this.configService.get<string>('OPENAI_API_KEY', '');
    } else if (provider === AIProviderType.CLAUDE) {
      systemKey = this.configService.get<string>('ANTHROPIC_API_KEY', '');
    }

    if (!systemKey) {
      throw new BadRequestException(
        `Chưa tìm thấy API Key cho dịch vụ ${provider}. Vui lòng nhập API Key của bạn trong phần Cài đặt (Settings).`,
      );
    }

    return {
      strategy,
      apiKey: systemKey,
      provider,
      isCustomUserKey: false,
    };
  }
}
