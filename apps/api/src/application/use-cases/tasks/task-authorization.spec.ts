import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateTaskUseCase } from './create-task.use-case';
import { UpdateTaskUseCase } from './update-task.use-case';
import { DeleteTaskUseCase, LogPomodoroUseCase } from './log-pomodoro.use-case';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { BoardEntity } from '../../../domain/entities/board.entity';
import { ColumnEntity } from '../../../domain/entities/column.entity';
import { Priority } from '@ai-kanban/shared-types';

describe('Task Authorization Security Tests (BOLA/IDOR Prevention)', () => {
  let mockTaskRepo: any;
  let mockBoardRepo: any;
  let mockActivityRepo: any;
  let mockPrismaService: any;

  beforeEach(() => {
    mockTaskRepo = {
      findById: jest.fn(),
      create: jest.fn((t) => Promise.resolve(t)),
      update: jest.fn((t) => Promise.resolve(t)),
      delete: jest.fn(() => Promise.resolve()),
    };
    mockBoardRepo = {
      findById: jest.fn(),
      findColumnById: jest.fn(),
    };
    mockActivityRepo = {
      create: jest.fn((a) => Promise.resolve(a)),
    };
    mockPrismaService = {
      pomodoroSession: {
        create: jest.fn().mockResolvedValue({ id: 'pomo-1' }),
      },
    };
  });

  describe('CreateTaskUseCase', () => {
    it('should throw ForbiddenException if user does not own the target board', async () => {
      const useCase = new CreateTaskUseCase(mockTaskRepo, mockBoardRepo, mockActivityRepo);
      mockBoardRepo.findById.mockResolvedValue(
        BoardEntity.create({ id: 'board-1', userId: 'owner-user', title: 'Private Board' }),
      );

      await expect(
        useCase.execute({
          userId: 'attacker-user',
          boardId: 'board-1',
          columnId: 'col-1',
          title: 'Hacked Task',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('UpdateTaskUseCase', () => {
    it('should throw ForbiddenException when updating another user\'s task', async () => {
      const useCase = new UpdateTaskUseCase(mockTaskRepo, mockBoardRepo);
      const victimTask = TaskEntity.create({
        id: 'task-99',
        boardId: 'board-victim',
        columnId: 'col-1',
        title: 'Confidential Task',
        priority: Priority.HIGH,
      });

      mockTaskRepo.findById.mockResolvedValue(victimTask);
      mockBoardRepo.findById.mockResolvedValue(
        BoardEntity.create({ id: 'board-victim', userId: 'victim-user', title: 'Victim Board' }),
      );

      await expect(
        useCase.execute({
          userId: 'attacker-user',
          taskId: 'task-99',
          title: 'Defaced Task Title',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DeleteTaskUseCase', () => {
    it('should throw ForbiddenException when deleting another user\'s task', async () => {
      const useCase = new DeleteTaskUseCase(mockTaskRepo, mockBoardRepo);
      const victimTask = TaskEntity.create({
        id: 'task-99',
        boardId: 'board-victim',
        columnId: 'col-1',
        title: 'Confidential Task',
        priority: Priority.HIGH,
      });

      mockTaskRepo.findById.mockResolvedValue(victimTask);
      mockBoardRepo.findById.mockResolvedValue(
        BoardEntity.create({ id: 'board-victim', userId: 'victim-user', title: 'Victim Board' }),
      );

      await expect(useCase.execute('attacker-user', 'task-99')).rejects.toThrow(ForbiddenException);
      expect(mockTaskRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('LogPomodoroUseCase', () => {
    it('should throw ForbiddenException when logging pomodoro on another user\'s task', async () => {
      const useCase = new LogPomodoroUseCase(mockTaskRepo, mockBoardRepo, mockPrismaService);
      const victimTask = TaskEntity.create({
        id: 'task-99',
        boardId: 'board-victim',
        columnId: 'col-1',
        title: 'Confidential Task',
        priority: Priority.HIGH,
      });

      mockTaskRepo.findById.mockResolvedValue(victimTask);
      mockBoardRepo.findById.mockResolvedValue(
        BoardEntity.create({ id: 'board-victim', userId: 'victim-user', title: 'Victim Board' }),
      );

      await expect(useCase.execute('attacker-user', 'task-99', 25)).rejects.toThrow(ForbiddenException);
    });
  });
});
