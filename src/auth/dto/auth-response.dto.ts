import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'a3f1c2e0-5b7d-4c8a-9e11-2f6d8b0a1c34' })
  id!: string;

  @ApiProperty({ example: 'maxim' })
  username!: string;

  @ApiProperty({
    description: 'JWT, als `Authorization: Bearer <token>` senden',
  })
  accessToken!: string;
}
