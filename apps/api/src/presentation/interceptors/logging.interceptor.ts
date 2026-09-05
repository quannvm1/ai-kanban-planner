import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { method, originalUrl, ip } = req;
    const userId = (req as any).user?.id || 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          const statusCode = res.statusCode;
          this.logger.log(
            `[${method}] ${originalUrl} ${statusCode} - ${duration}ms [User: ${userId}] [IP: ${ip}]`,
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = error.status || 500;
          this.logger.warn(
            `[${method}] ${originalUrl} ${statusCode} - ${duration}ms [User: ${userId}] [Error: ${error.message}]`,
          );
        },
      }),
    );
  }
}
