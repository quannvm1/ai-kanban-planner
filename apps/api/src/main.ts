import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './presentation/interceptors/transform.interceptor';
import { LoggingInterceptor } from './presentation/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './presentation/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';

  // Strict check on production secrets
  if (isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      logger.error('CRITICAL: JWT_SECRET must be set and at least 32 characters in production!');
      process.exit(1);
    }
    if (!process.env.ENCRYPTION_SECRET_KEY || process.env.ENCRYPTION_SECRET_KEY.length < 32) {
      logger.error('CRITICAL: ENCRYPTION_SECRET_KEY must be set and at least 32 characters in production!');
      process.exit(1);
    }
  }

  const app = await NestFactory.create(AppModule);

  // Security Headers (Helmet)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: isProduction ? undefined : false,
    }),
  );

  // Global Middlewares
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const frontendUrl = process.env.FRONTEND_URL;
      if (
        origin.includes('localhost') ||
        origin.endsWith('.vercel.app') ||
        (frontendUrl && origin === frontendUrl)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  });

  // Global Interceptors & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation
  if (!isProduction || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('AI Personal Kanban API')
      .setDescription('REST API for AI-Powered Personal Kanban & Daily Planner')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log(`📚 Swagger API Docs available at: /docs`);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 NestJS Backend running on: http://localhost:${port}`);
}
bootstrap();
