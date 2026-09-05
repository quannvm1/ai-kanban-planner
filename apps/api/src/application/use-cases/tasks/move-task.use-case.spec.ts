import { MoveTaskUseCase } from './move-task.use-case';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { ColumnEntity } from '../../../domain/entities/column.entity';
import { Priority } from '@ai-kanban/shared-types';

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

    const doneColumn = ColumnEntity.create({
      id: 'col-done',
      boardId: 'board-1',
      title: 'Done',
      orderIndex: 3,
    });

    mockTaskRepo.findById.mockResolvedValue(existingTask);
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
});
