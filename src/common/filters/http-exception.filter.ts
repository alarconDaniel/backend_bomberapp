import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let code = 'InternalError';
    let details: any | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      code = exception.name || code;

      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const p: any = payload;
        message = p.message ?? message;
        // Mensajes de class-validator vienen como array en p.message
        details = Array.isArray(p.message) ? p.message : undefined;
        code = p.error ?? code;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
      code = exception.name || code;
    }

    // Log de servidor (para ti)
    this.logger.error(
      `[${req.method}] ${req.url} → ${status} ${code} :: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Respuesta “limpia” para el cliente
    res.status(status).json({
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...(details ? { details } : {}),
    });
  }
}
