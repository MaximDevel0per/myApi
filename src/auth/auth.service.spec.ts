import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  const existingUser = {
    id: 'user-1',
    username: 'maxim',
    passwordHash: '$2b$10$hash',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByUsername: jest.fn(),
            findByUsernameWithHash: jest.fn(),
            verifyPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('signed.jwt') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  describe('register', () => {
    it('legt einen User an und liefert ein Token zurueck', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue(existingUser);

      const result = await service.register('maxim', 'super-geheim-123');

      expect(usersService.create).toHaveBeenCalledWith(
        'maxim',
        'super-geheim-123',
      );
      expect(result).toEqual({
        id: 'user-1',
        username: 'maxim',
        accessToken: 'signed.jwt',
      });
    });

    it('lehnt einen bereits vergebenen Benutzernamen ab', async () => {
      usersService.findByUsername.mockResolvedValue(existingUser);

      await expect(
        service.register('maxim', 'super-geheim-123'),
      ).rejects.toThrow(ConflictException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('liefert bei korrekten Daten ein Token', async () => {
      usersService.findByUsernameWithHash.mockResolvedValue(existingUser);
      usersService.verifyPassword.mockResolvedValue(true);

      const result = await service.login('maxim', 'super-geheim-123');

      expect(result.accessToken).toBe('signed.jwt');
    });

    it('wirft bei falschem Passwort 401', async () => {
      usersService.findByUsernameWithHash.mockResolvedValue(existingUser);
      usersService.verifyPassword.mockResolvedValue(false);

      await expect(service.login('maxim', 'falsch')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('nennt bei unbekanntem User dieselbe Meldung wie bei falschem Passwort', async () => {
      usersService.findByUsernameWithHash.mockResolvedValue(null);

      //Verhindert User-Enumeration ueber unterschiedliche Fehlertexte
      await expect(service.login('gibtsnicht', 'egal')).rejects.toThrow(
        'Benutzername oder Passwort ist falsch',
      );
    });
  });
});
