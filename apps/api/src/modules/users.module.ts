import { Module } from '@nestjs/common';
import { UsersController } from '../presentation/controllers/users.controller';
import { SaveUserApiKeyUseCase, GetUserApiKeysUseCase } from '../application/use-cases/users/save-user-api-key.use-case';

@Module({
  controllers: [UsersController],
  providers: [SaveUserApiKeyUseCase, GetUserApiKeysUseCase],
  exports: [SaveUserApiKeyUseCase, GetUserApiKeysUseCase],
})
export class UsersModule {}
