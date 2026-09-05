import { Module } from '@nestjs/common';
import { BoardsController } from '../presentation/controllers/boards.controller';
import { GetUserBoardsUseCase } from '../application/use-cases/boards/get-user-boards.use-case';
import { CreateBoardUseCase } from '../application/use-cases/boards/create-board.use-case';

@Module({
  controllers: [BoardsController],
  providers: [GetUserBoardsUseCase, CreateBoardUseCase],
  exports: [GetUserBoardsUseCase, CreateBoardUseCase],
})
export class BoardsModule {}
