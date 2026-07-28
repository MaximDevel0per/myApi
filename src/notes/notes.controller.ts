import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
//import type: reine Typen duerfen bei isolatedModules nicht im Wert-Import stehen
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) //gilt fuer alle Routen dieses Controllers
@ApiResponse({ status: 401, description: 'Token fehlt oder ist ungueltig' })
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Alle eigenen Notizen auflisten' })
  @ApiResponse({ status: 200, type: [Note] })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<Note[]> {
    return this.notesService.findAllForOwner(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Eine eigene Notiz abrufen' })
  @ApiResponse({ status: 200, type: Note })
  @ApiResponse({ status: 404, description: 'Notiz existiert nicht' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Note> {
    return this.notesService.findOneForOwner(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Notiz anlegen' })
  @ApiResponse({ status: 201, type: Note })
  @ApiResponse({ status: 400, description: 'Validierung fehlgeschlagen' })
  create(
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Note> {
    return this.notesService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Notiz teilweise aktualisieren' })
  @ApiResponse({ status: 200, type: Note })
  @ApiResponse({ status: 404, description: 'Notiz existiert nicht' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Note> {
    return this.notesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Notiz loeschen' })
  @ApiResponse({ status: 204, description: 'Geloescht' })
  @ApiResponse({ status: 404, description: 'Notiz existiert nicht' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.notesService.remove(id, user.id);
  }
}
