import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database.module';
import { AuthModule } from './modules/auth.module';
import { BoardsModule } from './modules/boards.module';
import { TasksModule } from './modules/tasks.module';
import { DailyModule } from './modules/daily.module';
import { UsersModule } from './modules/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    BoardsModule,
    TasksModule,
    DailyModule,
    UsersModule,
  ],
})
export class AppModule {}
