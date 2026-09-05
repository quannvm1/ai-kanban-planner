import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IUserRepository, UserApiKeyRecord } from '../../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AIProviderType, Role } from '@ai-kanban/shared-types';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.avatarUrl,
      user.googleId,
      user.role as Role,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.avatarUrl,
      user.googleId,
      user.role as Role,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { googleId } });
    if (!user) return null;
    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.avatarUrl,
      user.googleId,
      user.role as Role,
      user.createdAt,
      user.updatedAt,
    );
  }

  async create(entity: UserEntity): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        id: entity.id,
        email: entity.email,
        name: entity.name,
        avatarUrl: entity.avatarUrl,
        googleId: entity.googleId,
        role: entity.role,
      },
    });
    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.avatarUrl,
      user.googleId,
      user.role as Role,
      user.createdAt,
      user.updatedAt,
    );
  }

  async update(entity: UserEntity): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        avatarUrl: entity.avatarUrl,
        role: entity.role,
      },
    });
    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.avatarUrl,
      user.googleId,
      user.role as Role,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findApiKey(userId: string, provider: AIProviderType): Promise<UserApiKeyRecord | null> {
    const record = await this.prisma.userApiKey.findUnique({
      where: {
        userId_provider: { userId, provider },
      },
    });
    if (!record) return null;
    return {
      id: record.id,
      userId: record.userId,
      provider: record.provider as AIProviderType,
      encryptedKey: record.encryptedKey,
      iv: record.iv,
      authTag: record.authTag,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async findAllApiKeys(userId: string): Promise<UserApiKeyRecord[]> {
    const records = await this.prisma.userApiKey.findMany({
      where: { userId },
    });
    return records.map((record) => ({
      id: record.id,
      userId: record.userId,
      provider: record.provider as AIProviderType,
      encryptedKey: record.encryptedKey,
      iv: record.iv,
      authTag: record.authTag,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));
  }

  async saveApiKey(data: {
    userId: string;
    provider: AIProviderType;
    encryptedKey: string;
    iv: string;
    authTag: string;
  }): Promise<UserApiKeyRecord> {
    const record = await this.prisma.userApiKey.upsert({
      where: {
        userId_provider: { userId: data.userId, provider: data.provider },
      },
      update: {
        encryptedKey: data.encryptedKey,
        iv: data.iv,
        authTag: data.authTag,
        isActive: true,
      },
      create: {
        userId: data.userId,
        provider: data.provider,
        encryptedKey: data.encryptedKey,
        iv: data.iv,
        authTag: data.authTag,
        isActive: true,
      },
    });
    return {
      id: record.id,
      userId: record.userId,
      provider: record.provider as AIProviderType,
      encryptedKey: record.encryptedKey,
      iv: record.iv,
      authTag: record.authTag,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async deleteApiKey(userId: string, provider: AIProviderType): Promise<void> {
    await this.prisma.userApiKey.deleteMany({
      where: { userId, provider },
    });
  }
}
