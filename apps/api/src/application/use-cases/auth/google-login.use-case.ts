import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../domain/entities/user.entity';
import { IBoardRepository, BOARD_REPOSITORY } from '../../../domain/repositories/board.repository.interface';
import { BoardEntity } from '../../../domain/entities/board.entity';
import { ColumnEntity } from '../../../domain/entities/column.entity';

export interface GoogleAuthUserDto {
  googleId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private userRepo: IUserRepository,
    @Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository,
    private jwtService: JwtService,
  ) {}

  async execute(dto: GoogleAuthUserDto) {
    let user = await this.userRepo.findByEmail(dto.email);

    if (!user) {
      user = UserEntity.create({
        email: dto.email,
        name: dto.name,
        avatarUrl: dto.avatarUrl,
        googleId: dto.googleId,
      });
      user = await this.userRepo.create(user);

      // Create default starter board for new user
      const defaultBoard = BoardEntity.create({
        userId: user.id,
        title: 'Bảng Công Việc Cá Nhân',
        description: 'Bảng quản lý công việc và kế hoạch hàng ngày của bạn',
      });
      const savedBoard = await this.boardRepo.create(defaultBoard);

      // Create default Kanban columns
      const defaultColumns = [
        { title: 'Backlog', orderIndex: 0, colorHex: '#64748b' },
        { title: 'To Do', orderIndex: 1, colorHex: '#3b82f6' },
        { title: 'In Progress', orderIndex: 2, wipLimit: 3, colorHex: '#f59e0b' },
        { title: 'In Review', orderIndex: 3, wipLimit: 2, colorHex: '#8b5cf6' },
        { title: 'Done', orderIndex: 4, colorHex: '#10b981' },
      ];

      for (const col of defaultColumns) {
        await this.boardRepo.createColumn(
          ColumnEntity.create({
            boardId: savedBoard.id,
            title: col.title,
            orderIndex: col.orderIndex,
            wipLimit: col.wipLimit,
            colorHex: col.colorHex,
          }),
        );
      }
    } else if (!user.googleId && dto.googleId) {
      // Link googleId if signed up previously
      user = new UserEntity(
        user.id,
        user.email,
        dto.name || user.name,
        dto.avatarUrl || user.avatarUrl,
        dto.googleId,
        user.role,
        user.createdAt,
        new Date(),
      );
      user = await this.userRepo.update(user);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }
}
