import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controller/app.controller';
import { MathController } from './controller/app.mathcontroller';
import { AppService } from './services/app.service';
import { MathService } from './services/app.mathservice';
import { NotesController } from './controller/app.notescontroller';
import { WeatherService } from './services/app.weatherservice';
import { WeatherController } from './controller/app.weathercontroller';

import { Note, NotesService } from './services/app.notesservice';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'notes.db',
      entities: [Note],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Note]),
    ConfigModule.forRoot()
  ],
  
  controllers: [AppController, MathController, NotesController, WeatherController],
  providers: [AppService, MathService, NotesService, WeatherService],
})
export class AppModule {}
