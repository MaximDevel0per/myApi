import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard, RequestWithUser } from './jwt-auth.guard';

function contextWith(authorization?: string): {
  context: ExecutionContext;
  request: RequestWithUser;
} {
  const request = {
    headers: authorization ? { authorization } : {},
  } as RequestWithUser;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
  return { context, request };
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<Pick<JwtService, 'verifyAsync'>>;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('haengt den User bei gueltigem Token an den Request', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      username: 'maxim',
    });
    const { context, request } = contextWith('Bearer gueltig.jwt');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1', username: 'maxim' });
  });

  it('lehnt einen fehlenden Header ab', async () => {
    const { context } = contextWith();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('akzeptiert nur das Schema "Bearer"', async () => {
    const { context } = contextWith('Basic abc123');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('lehnt ein abgelaufenes Token ab', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const { context } = contextWith('Bearer abgelaufen.jwt');

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Token ist ungueltig oder abgelaufen',
    );
  });
});
