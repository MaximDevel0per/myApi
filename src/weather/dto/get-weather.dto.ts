import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class GetWeatherQueryDto {
  @ApiProperty({ example: '10115', description: 'Deutsche Postleitzahl' })
  @Matches(/^\d{5}$/, { message: 'postalcode muss aus 5 Ziffern bestehen' })
  postalcode!: string;
}
