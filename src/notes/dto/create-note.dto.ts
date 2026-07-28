import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ example: 'Einkaufsliste', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Milch, Brot, Kaffee', maxLength: 10000 })
  @IsString()
  @MaxLength(10000)
  description!: string;
}
