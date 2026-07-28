import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('notes')
export class Note {
  @ApiProperty({ example: 'a3f1c2e0-5b7d-4c8a-9e11-2f6d8b0a1c34' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Einkaufsliste' })
  @Column()
  title!: string;

  @ApiProperty({ example: 'Milch, Brot, Kaffee' })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;

  //Jede Notiz gehoert genau einem User; loescht man den User, fallen seine Notizen mit weg
  @Index()
  @ManyToOne(() => User, (user) => user.notes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column()
  ownerId!: string;
}
