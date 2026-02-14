import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Global prefix
  app.setGlobalPrefix('api');

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

  // Compression for responses
  app.use(compression());
  
  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();
  
  const port = process.env.PORT || 3000;
  const host = '0.0.0.0'; // Listen on all interfaces for mobile device access
  await app.listen(port, host);
  
  logger.log(`🚀 Body&Dry API running on http://${host}:${port}/api`);
  logger.log(`📊 Health check: http://localhost:${port}/api/health`);
  logger.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
