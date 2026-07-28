import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser, RequestWithUser } from '../guards/jwt-auth.guard';

/**
 * Liest den vom JwtAuthGuard gesetzten User aus dem Request.
 * Nutzung: `getNotes(@CurrentUser() user: AuthenticatedUser)`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user!;
  },
);
