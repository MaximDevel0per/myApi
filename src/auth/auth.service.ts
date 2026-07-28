import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';

export interface JwtPayload {
  sub: string; //User-Id
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      throw new ConflictException('Benutzername ist bereits vergeben');
    }

    const user = await this.usersService.create(username, password);
    return this.buildResponse(user.id, user.username);
  }

  async login(username: string, password: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findByUsernameWithHash(username);

    //Bewusst dieselbe Meldung fuer "User existiert nicht" und "Passwort falsch":
    //sonst laesst sich ueber die Fehlermeldung herausfinden, welche Namen vergeben sind
    if (!user) {
      throw new UnauthorizedException('Benutzername oder Passwort ist falsch');
    }

    const passwordMatches = await this.usersService.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Benutzername oder Passwort ist falsch');
    }

    return this.buildResponse(user.id, user.username);
  }

  private async buildResponse(
    id: string,
    username: string,
  ): Promise<AuthResponseDto> {
    const payload: JwtPayload = { sub: id, username };
    return {
      id,
      username,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
