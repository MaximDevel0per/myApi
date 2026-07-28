import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

/**
 * Sorgt dafuer, dass jeder Fehler dasselbe JSON-Format hat - auch unerwartete.
 * Interne Fehler werden geloggt, aber nach aussen auf eine generische
 * Meldung reduziert, damit keine Stacktraces oder SQL-Details leaken.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isHttp) {
      this.logger.error(
        `Unbehandelter Fehler bei ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      ...this.describe(exception, isHttp, status),
      path: request.url,
      timestamp: new Date().toISOString(),
    } satisfies ErrorBody);
  }

  private describe(
    exception: unknown,
    isHttp: boolean,
    status: number,
  ): { message: string | string[]; error: string } {
    if (!isHttp) {
      return {
        message: 'Interner Serverfehler',
        error: 'Internal Server Error',
      };
    }

    const payload = (exception as HttpException).getResponse();
    if (typeof payload === 'string') {
      return { message: payload, error: HttpStatus[status] ?? 'Error' };
    }

    const body = payload as { message?: string | string[]; error?: string };
    return {
      message: body.message ?? 'Unbekannter Fehler',
      error: body.error ?? HttpStatus[status] ?? 'Error',
    };
  }
}
