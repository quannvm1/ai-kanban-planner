import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { UserEntity } from '../../domain/entities/user.entity';
import { SaveUserApiKeyUseCase, GetUserApiKeysUseCase } from '../../application/use-cases/users/save-user-api-key.use-case';
import { AIProviderType } from '@ai-kanban/shared-types';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private saveUserApiKeyUseCase: SaveUserApiKeyUseCase,
    private getUserApiKeysUseCase: GetUserApiKeysUseCase,
  ) {}

  @Get('api-keys')
  async getApiKeys(@CurrentUser() user: UserEntity) {
    return this.getUserApiKeysUseCase.execute(user.id);
  }

  @Post('api-keys')
  async saveApiKey(
    @CurrentUser() user: UserEntity,
    @Body() body: { provider: AIProviderType; apiKey: string },
  ) {
    return this.saveUserApiKeyUseCase.execute(user.id, body.provider, body.apiKey);
  }

  @Delete('api-keys/:provider')
  async deleteApiKey(
    @CurrentUser() user: UserEntity,
    @Param('provider') provider: AIProviderType,
  ) {
    await this.saveUserApiKeyUseCase.delete(user.id, provider);
    return { deleted: true };
  }
}
