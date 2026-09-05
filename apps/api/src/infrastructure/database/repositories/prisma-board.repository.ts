import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IBoardRepository } from '../../../domain/repositories/board.repository.interface';
import { BoardEntity } from '../../../domain/entities/board.entity';
import { ColumnEntity } from '../../../domain/entities/column.entity';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { SubtaskEntity } from '../../../domain/entities/subtask.entity';
import { Priority } from '@ai-kanban/shared-types';

@Injectable()
export class PrismaBoardRepository implements IBoardRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<BoardEntity | null> {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { orderIndex: 'asc' },
          include: {
            tasks: {
              orderBy: { orderIndex: 'asc' },
              include: {
                subtasks: { orderBy: { orderIndex: 'asc' } },
              },
            },
          },
        },
      },
    });
    if (!board) return null;

    const columnEntities = board.columns.map((c) => {
      return new ColumnEntity(
        c.id,
        c.boardId,
        c.title,
        c.orderIndex,
        c.wipLimit,
        c.colorHex,
        c.createdAt,
        c.updatedAt,
      );
    });

    const taskEntities = board.columns.flatMap((col) =>
      col.tasks.map(
        (t) =>
          new TaskEntity(
            t.id,
            t.boardId,
            t.columnId,
            t.title,
            t.description,
            t.priority as Priority,
            t.orderIndex,
            t.dueDate,
            t.estimatedMins || 0,
            t.spentMins || 0,
            t.isCompleted,
            t.completedAt,
            t.tags,
            t.isMandatory || false,
            t.subtasks.map(
              (s) => new SubtaskEntity(s.id, s.taskId, s.title, s.isDone, s.orderIndex, s.createdAt, s.updatedAt),
            ),
            t.createdAt,
            t.updatedAt,
          ),
      ),
    );

    return new BoardEntity(
      board.id,
      board.userId,
      board.title,
      board.description,
      columnEntities,
      taskEntities,
      board.createdAt,
      board.updatedAt,
    );
  }

  async findByUserId(userId: string): Promise<BoardEntity[]> {
    const boards = await this.prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        columns: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return boards.map(
      (b) =>
        new BoardEntity(
          b.id,
          b.userId,
          b.title,
          b.description,
          b.columns.map(
            (c) => new ColumnEntity(c.id, c.boardId, c.title, c.orderIndex, c.wipLimit, c.colorHex, c.createdAt, c.updatedAt),
          ),
          [],
          b.createdAt,
          b.updatedAt,
        ),
    );
  }

  async create(entity: BoardEntity): Promise<BoardEntity> {
    const board = await this.prisma.board.create({
      data: {
        id: entity.id,
        userId: entity.userId,
        title: entity.title,
        description: entity.description,
      },
    });
    return new BoardEntity(board.id, board.userId, board.title, board.description, [], [], board.createdAt, board.updatedAt);
  }

  async update(entity: BoardEntity): Promise<BoardEntity> {
    const board = await this.prisma.board.update({
      where: { id: entity.id },
      data: {
        title: entity.title,
        description: entity.description,
      },
    });
    return new BoardEntity(board.id, board.userId, board.title, board.description, [], [], board.createdAt, board.updatedAt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.board.delete({ where: { id } });
  }

  async createColumn(column: ColumnEntity): Promise<ColumnEntity> {
    const c = await this.prisma.column.create({
      data: {
        id: column.id,
        boardId: column.boardId,
        title: column.title,
        orderIndex: column.orderIndex,
        wipLimit: column.wipLimit,
        colorHex: column.colorHex,
      },
    });
    return new ColumnEntity(c.id, c.boardId, c.title, c.orderIndex, c.wipLimit, c.colorHex, c.createdAt, c.updatedAt);
  }

  async updateColumn(column: ColumnEntity): Promise<ColumnEntity> {
    const c = await this.prisma.column.update({
      where: { id: column.id },
      data: {
        title: column.title,
        orderIndex: column.orderIndex,
        wipLimit: column.wipLimit,
        colorHex: column.colorHex,
      },
    });
    return new ColumnEntity(c.id, c.boardId, c.title, c.orderIndex, c.wipLimit, c.colorHex, c.createdAt, c.updatedAt);
  }

  async deleteColumn(id: string): Promise<void> {
    await this.prisma.column.delete({ where: { id } });
  }

  async findColumnById(id: string): Promise<ColumnEntity | null> {
    const c = await this.prisma.column.findUnique({ where: { id } });
    if (!c) return null;
    return new ColumnEntity(c.id, c.boardId, c.title, c.orderIndex, c.wipLimit, c.colorHex, c.createdAt, c.updatedAt);
  }
}
