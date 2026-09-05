import { Module } from '@nestjs/common';
import { TasksController } from '../presentation/controllers/tasks.controller';
import { CreateTaskUseCase } from '../application/use-cases/tasks/create-task.use-case';
import { UpdateTaskUseCase } from '../application/use-cases/tasks/update-task.use-case';
import { MoveTaskUseCase } from '../application/use-cases/tasks/move-task.use-case';
import { DeleteTaskUseCase, LogPomodoroUseCase } from '../application/use-cases/tasks/log-pomodoro.use-case';

@Module({
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    MoveTaskUseCase,
    DeleteTaskUseCase,
    LogPomodoroUseCase,
  ],
  exports: [
    CreateTaskUseCase,
    UpdateTaskUseCase,
    MoveTaskUseCase,
    DeleteTaskUseCase,
    LogPomodoroUseCase,
  ],
})
export class TasksModule {}
