import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor(private configService: ConfigService) {
    const rawKey = this.configService.get<string>(
      'ENCRYPTION_SECRET_KEY',
      'default-super-secret-key-32-chars-long!',
    );
    this.secretKey = crypto.scryptSync(rawKey, 'ai-kanban-salt', 32);
  }

  encrypt(plainText: string): { encryptedKey: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(12); // 96-bit IV
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedKey: encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  decrypt(encryptedKey: string, ivHex: string, authTagHex: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  maskKey(key: string): string {
    if (!key || key.length < 8) return '****';
    const prefix = key.slice(0, 4);
    const suffix = key.slice(-4);
    return `${prefix}****${suffix}`;
  }
}
