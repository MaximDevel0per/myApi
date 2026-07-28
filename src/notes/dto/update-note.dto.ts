import { PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';

//PartialType macht alle Felder optional und uebernimmt Validierung + Swagger-Metadaten
export class UpdateNoteDto extends PartialType(CreateNoteDto) {}
