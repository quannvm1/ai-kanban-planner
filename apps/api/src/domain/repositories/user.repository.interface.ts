import { UserEntity } from '../entities/user.entity';
import { AIProviderType } from '@ai-kanban/shared-types';

export interface UserApiKeyRecord {
  id: string;
  userId: string;
  provider: AIProviderType;
  encryptedKey: string;
  iv: string;
  authTag: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  
  // User API Keys for LLMs
  findApiKey(userId: string, provider: AIProviderType): Promise<UserApiKeyRecord | null>;
  findAllApiKeys(userId: string): Promise<UserApiKeyRecord[]>;
  saveApiKey(data: {
    userId: string;
    provider: AIProviderType;
    encryptedKey: string;
    iv: string;
    authTag: string;
  }): Promise<UserApiKeyRecord>;
  deleteApiKey(userId: string, provider: AIProviderType): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
