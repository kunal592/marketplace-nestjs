import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // ── Global Prefix ──
  app.setGlobalPrefix('api');

  // ── CORS ──
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ── Global Validation Pipe ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip non-DTO properties
      forbidNonWhitelisted: true, // Throw if unknown properties sent
      transform: true,           // Auto-transform payloads to DTO classes
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global Exception Filter ──
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global Response Interceptor ──
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Start Server ──
  const port = configService.get<number>('port', 5000);
  await app.listen(port);
  logger.log(`🚀 Marketplace API running on http://localhost:${port}/api`);
}

bootstrap();
