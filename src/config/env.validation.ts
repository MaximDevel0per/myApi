import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

/**
 * Wird beim Start ausgefuehrt. Fehlt eine Variable, stirbt die App sofort
 * mit klarer Meldung - statt erst beim ersten Request in einen Fehler zu laufen.
 */
class EnvironmentVariables {
  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsString()
  @MinLength(32, { message: 'JWT_SECRET muss mindestens 32 Zeichen lang sein' })
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  DATABASE_PATH?: string;

  @IsString()
  OPENWEATHER_API_KEY!: string;

  @IsString()
  GEOCODING_API_KEY!: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(`Ungueltige Umgebungsvariablen:\n  - ${details}`);
  }

  return validated;
}
