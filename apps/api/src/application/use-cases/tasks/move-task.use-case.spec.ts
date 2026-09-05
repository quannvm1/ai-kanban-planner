import { MoveTaskUseCase } from './move-task.use-case';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { ColumnEntity } from '../../../domain/entities/column.entity';
import { BoardEntity } from '../../../domain/entities/board.entity';
import { Priority } from '@ai-kanban/shared-types';
import { ForbiddenException } from '@nestjs/common';

describe('MoveTaskUseCase', () => {
  let useCase: MoveTaskUseCase;
  let mockTaskRepo: any;
  let mockBoardRepo: any;
  let mockActivityRepo: any;

  beforeEach(() => {
    mockTaskRepo = {
      findById: jest.fn(),
      update: jest.fn((t) => Promise.resolve(t)),
    };
    mockBoardRepo = {
      findById: jest.fn(),
      findColumnById: jest.fn(),
    };
    mockActivityRepo = {
      create: jest.fn((a) => Promise.resolve(a)),
    };

    useCase = new MoveTaskUseCase(mockTaskRepo, mockBoardRepo, mockActivityRepo);
  });

  it('should mark task as completed when moved to Done column', async () => {
    const existingTask = TaskEntity.create({
      id: 'task-1',
      boardId: 'board-1',
      columnId: 'col-todo',
      title: 'Học NestJS Clean Architecture',
      priority: Priority.HIGH,
    });

    const mockBoard = BoardEntity.create({
      id: 'board-1',
      userId: 'user-1',
      title: 'Test Board',
    });

    const doneColumn = ColumnEntity.create({
      id: 'col-done',
      boardId: 'board-1',
      title: 'Done',
      orderIndex: 3,
    });

    mockTaskRepo.findById.mockResolvedValue(existingTask);
    mockBoardRepo.findById.mockResolvedValue(mockBoard);
    mockBoardRepo.findColumnById.mockResolvedValue(doneColumn);

    const result = await useCase.execute({
      userId: 'user-1',
      taskId: 'task-1',
      targetColumnId: 'col-done',
      newOrderIndex: 0,
    });

    expect(result.columnId).toBe('col-done');
    expect(result.isCompleted).toBe(true);
    expect(result.completedAt).toBeDefined();
    expect(mockActivityRepo.create).toHaveBeenCalled();
  });

  it('should throw ForbiddenException if user does not own the board', async () => {
    const existingTask = TaskEntity.create({
      id: 'task-1',
      boardId: 'board-1',
      columnId: 'col-todo',
      title: 'Học NestJS Clean Architecture',
      priority: Priority.HIGH,
    });

    const mockBoard = BoardEntity.create({
      id: 'board-1',
      userId: 'different-user',
      title: 'Other Board',
    });

    mockTaskRepo.findById.mockResolvedValue(existingTask);
    mockBoardRepo.findById.mockResolvedValue(mockBoard);

    await expect(
      useCase.execute({
        userId: 'attacker-user',
        taskId: 'task-1',
        targetColumnId: 'col-done',
        newOrderIndex: 0,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
