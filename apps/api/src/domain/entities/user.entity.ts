import { Role } from '@ai-kanban/shared-types';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null,
    public readonly avatarUrl: string | null,
    public readonly googleId: string | null,
    public readonly role: Role = Role.USER,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: {
    id?: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
    googleId?: string | null;
    role?: Role;
  }): UserEntity {
    return new UserEntity(
      data.id || crypto.randomUUID(),
      data.email,
      data.name || null,
      data.avatarUrl || null,
      data.googleId || null,
      data.role || Role.USER,
      new Date(),
      new Date(),
    );
  }
}
