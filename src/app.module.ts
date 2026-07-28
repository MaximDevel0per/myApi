import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { WeatherModule } from './weather/weather.module';
import { HealthController } from './health/health.controller';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { User } from './users/entities/user.entity';
import { Note } from './notes/entities/note.entity';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: config.get<string>('DATABASE_PATH') ?? 'notes.db',
        entities: [User, Note],
        //Nur ausserhalb von Produktion: in Prod uebernehmen Migrationen das Schema
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    NotesModule,
    WeatherModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //'{*path}' statt '*': path-to-regexp v8 verlangt benannte Wildcards
    consumer.apply(LoggerMiddleware).forRoutes('{*path}');
  }
}
