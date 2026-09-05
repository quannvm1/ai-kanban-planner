import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../presentation/controllers/auth.controller';
import { GoogleLoginUseCase } from '../application/use-cases/auth/google-login.use-case';
import { JwtStrategy } from '../infrastructure/auth/jwt.strategy';
import { GoogleStrategy } from '../infrastructure/auth/google.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-super-secret-jwt-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [GoogleLoginUseCase, JwtStrategy, GoogleStrategy],
  exports: [GoogleLoginUseCase, JwtModule, PassportModule],
})
export class AuthModule {}
