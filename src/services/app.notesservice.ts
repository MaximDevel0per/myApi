import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Note {

  @PrimaryGeneratedColumn() //auto increment automatisch gesetzt
  public id: number;

  @Column()
  public title: string;
  
  @Column()
  public description: string;

  //Entfällt, durch SQL-Lite
  // constructor(id: number, title: string, description: string) {
  //   this.id = id;
  //   this.title = title;
  //   this.description = description;
  // }
}


@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
  ) {}

  async getNotes(): Promise<Note[]> {
    return await this.notesRepository.find();
  }

  async addNote(title: string, description: string): Promise<Note> {
    const note = await this.notesRepository.create({ title, description });
    return this.notesRepository.save(note);
  }

  async removeNote(id: number): Promise<boolean> {
    const result = await this.notesRepository.delete(id);
    return result.affected !== 0;
  }

  async updateNode(id:number, newTitle:string, newDescription:string) {
    return await this.notesRepository.update(id, {title: newTitle,description: newDescription});
  }

}


