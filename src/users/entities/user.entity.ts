import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Note } from '../../notes/entities/note.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  //select: false -> der Hash landet nie versehentlich in einer API-Antwort
  @Column({ select: false })
  passwordHash!: string;

  @OneToMany(() => Note, (note) => note.owner)
  notes!: Note[];
}
