import { Controller, Get, HttpCode, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Note, NotesService } from '../services/app.notesservice';
import { ApiQuery } from '@nestjs/swagger';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('getNotes')
  @HttpCode(200)
  async getNotes(): Promise<Note[]> {
    return await this.notesService.getNotes();
  }


  @Post('addNote')
  @HttpCode(201)
  @ApiQuery({ name: 'title', type: String })
  @ApiQuery({ name: 'description', type: String })
  async addNote(@Query('title') title:string, @Query('description') description:string): Promise<Note> {
    return await this.notesService.addNote(title, description);
  }

  @Post('removeNote')
  @HttpCode(200)
  @ApiQuery({ name: 'index', type: Number })
  async removeNote(@Query('index', ParseIntPipe) index: number): Promise<boolean> {
    return await this.notesService.removeNote(index);
  }

}
