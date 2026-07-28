import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Loggt jede Anfrage samt Statuscode und Dauer.
 * Nutzt den Nest-Logger statt console.log, damit Format und Log-Level
 * zur restlichen Anwendung passen.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    //'finish' statt sofort: erst dann stehen Status und Dauer fest
    res.on('finish', () => {
      const duration = Date.now() - startedAt;
      const line = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
      if (res.statusCode >= 500) {
        this.logger.error(line);
      } else if (res.statusCode >= 400) {
        this.logger.warn(line);
      } else {
        this.logger.log(line);
      }
    });

    next();
  }
}
