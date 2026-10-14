import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global validation pipe with transformation and stripping unknown fields
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration (including FRONTEND_URL and CORS_ORIGINS)
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '*');
  const frontendUrl = configService.get<string>('FRONTEND_URL', '').trim();

  let allowedOrigins: boolean | string[] = true;
  if (corsOrigins !== '*') {
    const list = corsOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (frontendUrl && !list.includes(frontendUrl)) {
      list.push(frontendUrl);
    }
    allowedOrigins = list;
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Documentation Setup at /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Snapbook API')
    .setDescription(
      'Production-ready REST API for income and expense tracking via Thai bank transfer slips (images) and full Auth management',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Supabase Auth Access Token (Bearer <token>)',
        in: 'header',
      },
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Bind to 0.0.0.0 and process.env.PORT for Render deployment
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://0.0.0.0:${port}`);
  logger.log(`API Documentation available at: http://0.0.0.0:${port}/docs`);
}

bootstrap();
