import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  getHealth(): any {
    console.log('health called');
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}
