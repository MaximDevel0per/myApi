import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
  ) {}

  findAllForOwner(ownerId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { ownerId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * ownerId ist Teil der Bedingung, nicht nur eine nachgelagerte Pruefung:
   * eine fremde Notiz sieht damit aus wie eine nicht existierende (404 statt 403).
   * So verraet die API nicht, welche Ids es ueberhaupt gibt.
   */
  async findOneForOwner(id: string, ownerId: string): Promise<Note> {
    const note = await this.notesRepository.findOne({ where: { id, ownerId } });
    if (!note) {
      throw new NotFoundException(`Notiz ${id} nicht gefunden`);
    }
    return note;
  }

  create(dto: CreateNoteDto, ownerId: string): Promise<Note> {
    const note = this.notesRepository.create({ ...dto, ownerId });
    return this.notesRepository.save(note);
  }

  async update(id: string, dto: UpdateNoteDto, ownerId: string): Promise<Note> {
    const note = await this.findOneForOwner(id, ownerId);
    Object.assign(note, dto);
    return this.notesRepository.save(note);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const result = await this.notesRepository.delete({ id, ownerId });
    if (result.affected === 0) {
      throw new NotFoundException(`Notiz ${id} nicht gefunden`);
    }
  }
}
