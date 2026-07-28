import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'maxim' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'super-geheim-123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
