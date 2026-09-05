import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IBoardRepository, BOARD_REPOSITORY } from '../../../domain/repositories/board.repository.interface';
import { BoardDto } from '@ai-kanban/shared-types';

@Injectable()
export class GetUserBoardsUseCase {
  constructor(@Inject(BOARD_REPOSITORY) private boardRepo: IBoardRepository) {}

  async execute(userId: string): Promise<BoardDto[]> {
    const boards = await this.boardRepo.findByUserId(userId);
    return boards.map((b) => ({
      id: b.id,
      userId: b.userId,
      title: b.title,
      description: b.description,
      columns: b.columns.map((c) => ({
        id: c.id,
        boardId: c.boardId,
        title: c.title,
        orderIndex: c.orderIndex,
        wipLimit: c.wipLimit,
        colorHex: c.colorHex,
        tasks: [],
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  }

  async getDetails(userId: string, boardId: string): Promise<BoardDto> {
    const board = await this.boardRepo.findById(boardId);
    if (!board || board.userId !== userId) {
      throw new NotFoundException('Board không tồn tại hoặc bạn không có quyền truy cập.');
    }

    return {
      id: board.id,
      userId: board.userId,
      title: board.title,
      description: board.description,
      columns: board.columns.map((c) => ({
        id: c.id,
        boardId: c.boardId,
        title: c.title,
        orderIndex: c.orderIndex,
        wipLimit: c.wipLimit,
        colorHex: c.colorHex,
        tasks: board.tasks
          .filter((t) => t.columnId === c.id)
          .map((t) => ({
            id: t.id,
            boardId: t.boardId,
            columnId: t.columnId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            orderIndex: t.orderIndex,
            dueDate: t.dueDate ? t.dueDate.toISOString() : null,
            estimatedMins: t.estimatedMins,
            spentMins: t.spentMins,
            isCompleted: t.isCompleted,
            completedAt: t.completedAt ? t.completedAt.toISOString() : null,
            tags: t.tags,
            subtasks: t.subtasks.map((s) => ({
              id: s.id,
              title: s.title,
              isDone: s.isDone,
              orderIndex: s.orderIndex,
            })),
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          })),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }
}
