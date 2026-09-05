import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { SubtaskEntity } from '../../../domain/entities/subtask.entity';
import { Priority } from '@ai-kanban/shared-types';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaService) {}

  private mapToDomain(t: any): TaskEntity {
    return new TaskEntity(
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
      t.tags || [],
      t.isMandatory || false,
      (t.subtasks || []).map(
        (s: any) => new SubtaskEntity(s.id, s.taskId, s.title, s.isDone, s.orderIndex, s.createdAt, s.updatedAt),
      ),
      t.createdAt,
      t.updatedAt,
    );
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { subtasks: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!t) return null;
    return this.mapToDomain(t);
  }

  async findByBoardId(boardId: string): Promise<TaskEntity[]> {
    const tasks = await this.prisma.task.findMany({
      where: { boardId },
      include: { subtasks: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });
    return tasks.map((t) => this.mapToDomain(t));
  }

  async findByColumnId(columnId: string): Promise<TaskEntity[]> {
    const tasks = await this.prisma.task.findMany({
      where: { columnId },
      include: { subtasks: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });
    return tasks.map((t) => this.mapToDomain(t));
  }

  async findCompletedToday(userId: string, date: Date): Promise<TaskEntity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.task.findMany({
      where: {
        board: { userId },
        isCompleted: true,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { subtasks: true },
    });
    return tasks.map((t) => this.mapToDomain(t));
  }

  async findInProgress(userId: string): Promise<TaskEntity[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        board: { userId },
        isCompleted: false,
      },
      include: { subtasks: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    return tasks.map((t) => this.mapToDomain(t));
  }

  async create(entity: TaskEntity): Promise<TaskEntity> {
    const created = await this.prisma.task.create({
      data: {
        id: entity.id,
        boardId: entity.boardId,
        columnId: entity.columnId,
        title: entity.title,
        description: entity.description,
        priority: entity.priority,
        orderIndex: entity.orderIndex,
        dueDate: entity.dueDate,
        estimatedMins: entity.estimatedMins,
        spentMins: entity.spentMins,
        isCompleted: entity.isCompleted,
        tags: entity.tags,
        isMandatory: entity.isMandatory,
        subtasks: {
          create: entity.subtasks.map((s) => ({
            id: s.id,
            title: s.title,
            isDone: s.isDone,
            orderIndex: s.orderIndex,
          })),
        },
      },
      include: { subtasks: true },
    });
    return this.mapToDomain(created);
  }

  async update(entity: TaskEntity): Promise<TaskEntity> {
    const updated = await this.prisma.task.update({
      where: { id: entity.id },
      data: {
        columnId: entity.columnId,
        title: entity.title,
        description: entity.description,
        priority: entity.priority,
        orderIndex: entity.orderIndex,
        dueDate: entity.dueDate,
        estimatedMins: entity.estimatedMins,
        spentMins: entity.spentMins,
        isCompleted: entity.isCompleted,
        completedAt: entity.completedAt,
        tags: entity.tags,
        isMandatory: entity.isMandatory,
      },
      include: { subtasks: true },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async createSubtask(subtask: SubtaskEntity): Promise<SubtaskEntity> {
    const s = await this.prisma.subtask.create({
      data: {
        id: subtask.id,
        taskId: subtask.taskId,
        title: subtask.title,
        isDone: subtask.isDone,
        orderIndex: subtask.orderIndex,
      },
    });
    return new SubtaskEntity(s.id, s.taskId, s.title, s.isDone, s.orderIndex, s.createdAt, s.updatedAt);
  }

  async updateSubtask(subtask: SubtaskEntity): Promise<SubtaskEntity> {
    const s = await this.prisma.subtask.update({
      where: { id: subtask.id },
      data: {
        title: subtask.title,
        isDone: subtask.isDone,
        orderIndex: subtask.orderIndex,
      },
    });
    return new SubtaskEntity(s.id, s.taskId, s.title, s.isDone, s.orderIndex, s.createdAt, s.updatedAt);
  }

  async deleteSubtask(id: string): Promise<void> {
    await this.prisma.subtask.delete({ where: { id } });
  }
}
