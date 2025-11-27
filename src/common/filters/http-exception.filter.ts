// src/common/filters/http-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
// Filtro global de excepciones HTTP:
// - Atrapa cualquier error lanzado en el contexto HTTP
// - Normaliza la respuesta para el cliente
// - Loguea detalles en el servidor
export class HttpExceptionFilter implements ExceptionFilter {
  // Logger propio del filtro para centralizar los errores
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // Punto de entrada del filtro cuando ocurre una excepción
  catch(exception: unknown, host: ArgumentsHost) {
    // Adaptamos el contexto genérico al contexto HTTP (req/res)
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Valores por defecto para errores no controlados
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let code = 'InternalError';
    let details: any | undefined;

    // Caso 1: errores que extienden de HttpException (Nest)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      code = exception.name || code;

      if (typeof payload === 'string') {
        // HttpException creada solo con un mensaje string
        message = payload;
      } else if (payload && typeof payload === 'object') {
        // HttpException con objeto de respuesta (Nest / class-validator)
        const p: any = payload;
        message = p.message ?? message;

        // Mensajes de class-validator suelen venir como array en p.message
        details = Array.isArray(p.message) ? p.message : undefined;

        // p.error suele tener una etiqueta tipo "Bad Request", "Forbidden", etc.
        code = p.error ?? code;
      }

      // Caso 2: errores estándar de JS (Error) no tipados como HttpException
    } else if (exception instanceof Error) {
      message = exception.message || message;
      code = exception.name || code;
    }

    // Log de servidor (para debugging y monitoreo)
    this.logger.error(
      `[${req.method}] ${req.url} → ${status} ${code} :: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Respuesta “limpia” y consistente para el cliente
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
