import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { getLogger } from '../logger';
const httpLogger = getLogger('http');

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const httpCtx = context.switchToHttp();
        const req = httpCtx.getRequest();

        if (!req) {
            return next.handle();
        }

        const { method } = req;
        const url: string = req.originalUrl || req.url;
        const userId = req.user?.userId || '-';
        const requestId = req.headers?.['x-request-id'] || req.id || undefined;
        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const res = httpCtx.getResponse();
                const statusCode = res?.statusCode ?? 200;
                const duration = Date.now() - start;
                httpLogger.info('http_request', {
                    method,
                    url,
                    statusCode,
                    durationMs: duration,
                    userId,
                    requestId,
                });
            }),
            catchError((err) => {
                const res = httpCtx.getResponse();
                const statusCode = res?.statusCode || err?.status || 500;
                const duration = Date.now() - start;
                httpLogger.error('http_error', {
                    method,
                    url,
                    statusCode,
                    durationMs: duration,
                    userId,
                    requestId,
                    message: err?.message,
                });
                return throwError(() => err);
            }),
        );
    }
}
