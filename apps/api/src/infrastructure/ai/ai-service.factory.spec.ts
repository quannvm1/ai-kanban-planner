import { AIServiceFactory } from './ai-service.factory';
import { AIProviderType } from '@ai-kanban/shared-types';

describe('AIServiceFactory (Strategy & Factory Pattern)', () => {
  let factory: AIServiceFactory;
  let mockGeminiStrategy: any;
  let mockOpenAIStrategy: any;
  let mockClaudeStrategy: any;
  let mockCryptoService: any;
  let mockConfigService: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockGeminiStrategy = { getProviderType: () => AIProviderType.GEMINI };
    mockOpenAIStrategy = { getProviderType: () => AIProviderType.OPENAI };
    mockClaudeStrategy = { getProviderType: () => AIProviderType.CLAUDE };
    mockCryptoService = {
      decrypt: jest.fn().mockReturnValue('user-decrypted-custom-key'),
    };
    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'GEMINI_API_KEY') return 'system-env-gemini-key';
        return 'GEMINI';
      }),
    };
    mockUserRepo = {
      findApiKey: jest.fn(),
    };

    factory = new AIServiceFactory(
      mockGeminiStrategy,
      mockOpenAIStrategy,
      mockClaudeStrategy,
      mockCryptoService,
      mockConfigService,
      mockUserRepo,
    );
  });

  it('should resolve system key when user has no custom API key saved', async () => {
    mockUserRepo.findApiKey.mockResolvedValue(null);

    const resolved = await factory.resolveProviderForUser('user-1', AIProviderType.GEMINI);

    expect(resolved.provider).toBe(AIProviderType.GEMINI);
    expect(resolved.apiKey).toBe('system-env-gemini-key');
    expect(resolved.isCustomUserKey).toBe(false);
  });

  it('should decrypt and use custom user API key when available in DB', async () => {
    mockUserRepo.findApiKey.mockResolvedValue({
      provider: AIProviderType.GEMINI,
      encryptedKey: 'encrypted-hex',
      iv: 'iv-hex',
      authTag: 'auth-tag-hex',
      isActive: true,
    });

    const resolved = await factory.resolveProviderForUser('user-1', AIProviderType.GEMINI);

    expect(resolved.apiKey).toBe('user-decrypted-custom-key');
    expect(resolved.isCustomUserKey).toBe(true);
    expect(mockCryptoService.decrypt).toHaveBeenCalledWith('encrypted-hex', 'iv-hex', 'auth-tag-hex');
  });
});
