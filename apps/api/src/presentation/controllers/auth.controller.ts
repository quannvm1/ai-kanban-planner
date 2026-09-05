import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { GoogleLoginUseCase } from '../../application/use-cases/auth/google-login.use-case';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { UserEntity } from '../../domain/entities/user.entity';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private googleLoginUseCase: GoogleLoginUseCase,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.googleLoginUseCase.execute(user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    // Redirect back to frontend with token
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  // Direct mock/dev login for testing without Google Credentials
  @Post('dev-login')
  async devLogin(@Body() body: { email?: string; name?: string }) {
    const email = body.email || 'developer@example.com';
    const name = body.name || 'Pro Developer';
    return this.googleLoginUseCase.execute({
      googleId: `dev-${email}`,
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }
}
