import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { UserEntity } from '../../domain/entities/user.entity';
import { GetUserBoardsUseCase } from '../../application/use-cases/boards/get-user-boards.use-case';
import { CreateBoardUseCase } from '../../application/use-cases/boards/create-board.use-case';

@Controller('api/v1/boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(
    private getUserBoardsUseCase: GetUserBoardsUseCase,
    private createBoardUseCase: CreateBoardUseCase,
  ) {}

  @Get()
  async getBoards(@CurrentUser() user: UserEntity) {
    return this.getUserBoardsUseCase.execute(user.id);
  }

  @Get(':id')
  async getBoardDetails(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    return this.getUserBoardsUseCase.getDetails(user.id, id);
  }

  @Post()
  async createBoard(
    @CurrentUser() user: UserEntity,
    @Body() body: { title: string; description?: string; columns?: Array<{ title: string; orderIndex: number; colorHex?: string }> },
  ) {
    return this.createBoardUseCase.execute({
      userId: user.id,
      title: body.title,
      description: body.description,
      columns: body.columns,
    });
  }
}
