import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'maxim', minLength: 3, maxLength: 32 })
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'username darf nur Buchstaben, Ziffern, Punkt, Bindestrich und Unterstrich enthalten',
  })
  username!: string;

  @ApiProperty({ example: 'super-geheim-123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  //bcrypt schneidet ab 72 Bytes ab - laengere Passwoerter waeren truegerisch
  @MaxLength(72)
  password!: string;
}
