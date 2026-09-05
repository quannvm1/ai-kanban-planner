import { CryptoService } from './crypto.service';
import { ConfigService } from '@nestjs/config';

describe('CryptoService (AES-256-GCM Encryption)', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret-key-32-chars-long-12345'),
    } as unknown as ConfigService;

    cryptoService = new CryptoService(mockConfigService);
  });

  it('should encrypt and successfully decrypt API key back to original text', () => {
    const rawApiKey = 'AIzaSyD-sample-gemini-api-key-987654321';
    const encrypted = cryptoService.encrypt(rawApiKey);

    expect(encrypted.encryptedKey).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();

    const decrypted = cryptoService.decrypt(
      encrypted.encryptedKey,
      encrypted.iv,
      encrypted.authTag,
    );

    expect(decrypted).toBe(rawApiKey);
  });

  it('should mask API key correctly for safe UI display', () => {
    const key = 'sk-proj-1234567890abcdef';
    const masked = cryptoService.maskKey(key);
    expect(masked).toBe('sk-p****cdef');
  });
});
