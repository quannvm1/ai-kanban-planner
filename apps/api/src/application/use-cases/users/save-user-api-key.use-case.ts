import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { CryptoService } from '../../../infrastructure/security/crypto.service';
import { AIProviderType, UserApiKeyMasked } from '@ai-kanban/shared-types';

@Injectable()
export class SaveUserApiKeyUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepo: IUserRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(userId: string, provider: AIProviderType, apiKey: string): Promise<UserApiKeyMasked> {
    if (!apiKey || apiKey.trim().length < 8) {
      throw new BadRequestException('API Key không hợp lệ hoặc quá ngắn.');
    }

    const encrypted = this.cryptoService.encrypt(apiKey.trim());

    const saved = await this.userRepo.saveApiKey({
      userId,
      provider,
      encryptedKey: encrypted.encryptedKey,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    });

    return {
      provider: saved.provider,
      maskedKey: this.cryptoService.maskKey(apiKey.trim()),
      isActive: saved.isActive,
      updatedAt: saved.updatedAt.toISOString(),
    };
  }

  async delete(userId: string, provider: AIProviderType): Promise<void> {
    await this.userRepo.deleteApiKey(userId, provider);
  }
}

@Injectable()
export class GetUserApiKeysUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepo: IUserRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(userId: string): Promise<UserApiKeyMasked[]> {
    const keys = await this.userRepo.findAllApiKeys(userId);
    return keys.map((k) => {
      let masked = '****';
      try {
        const decrypted = this.cryptoService.decrypt(k.encryptedKey, k.iv, k.authTag);
        masked = this.cryptoService.maskKey(decrypted);
      } catch (e) {
        masked = '****';
      }

      return {
        provider: k.provider,
        maskedKey: masked,
        isActive: k.isActive,
        updatedAt: k.updatedAt.toISOString(),
      };
    });
  }
}
