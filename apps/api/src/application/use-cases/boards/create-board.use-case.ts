import { Inject, Injectable } from '@nestjs/common';
import { IBoardRepository, BOARD_REPOSITORY } from '../../../domain/repositories/board.repository.interface';
import { BoardEntity } from '../../../domain/entities/board.entity';
import { ColumnEntity } from '../../../domain/entities/column.entity';

export interface CreateBoardInput {
  userId: string;
  title: string;
  description?: string;
  columns?: Array<{ title: string; orderIndex: number; colorHex?: string }>;
}

@Injectable()
export class CreateBoardUseCase {
  constructor(@Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository) {}

  async execute(input: CreateBoardInput) {
    const board = BoardEntity.create({
      userId: input.userId,
      title: input.title,
      description: input.description,
    });
    const saved = await this.boardRepo.create(board);

    const defaultCols = input.columns || [
      { title: 'To Do', orderIndex: 0, colorHex: '#3b82f6' },
      { title: 'In Progress', orderIndex: 1, colorHex: '#f59e0b' },
      { title: 'Done', orderIndex: 2, colorHex: '#10b981' },
    ];

    for (const col of defaultCols) {
      await this.boardRepo.createColumn(
        ColumnEntity.create({
          boardId: saved.id,
          title: col.title,
          orderIndex: col.orderIndex,
          colorHex: col.colorHex,
        }),
      );
    }

    return this.boardRepo.findById(saved.id);
  }
}
