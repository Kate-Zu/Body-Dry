import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): {
    message: string;
    version: string;
    endpoints: string[];
    status: string;
  } {
    return {
      message: 'Body&Dry API',
      version: '1.0.0',
      status: 'running',
      endpoints: [
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/users/profile',
        'GET /api/foods',
        'POST /api/diary/meals',
        'GET /api/diary/entries',
        'GET /api/progress',
        'GET /api/health',
      ],
    };
  }
}
