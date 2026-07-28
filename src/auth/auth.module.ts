import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      //getOrThrow: lieber beim Start abstuerzen als mit einem leeren Secret signieren
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          //jsonwebtoken typisiert expiresIn als Template-Literal ('1h', '7d', ...),
          //aus der Umgebung kommt aber immer ein einfacher string
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '1h') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  //JwtModule mit exportieren, damit der JwtAuthGuard in anderen Modulen aufloesbar ist
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
