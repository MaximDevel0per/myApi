import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
//VERSION_NEUTRAL: der Check soll unter /health erreichbar sein, nicht unter /v1/health -
//Monitoring soll sich nicht an die API-Version binden muessen
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness-Check fuer Monitoring' })
  check(): { status: string; uptime: number } {
    return { status: 'ok', uptime: process.uptime() };
  }
}
