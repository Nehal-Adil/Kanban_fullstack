import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API Versioning
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   prefix: 'api/v',
  // })

  app.setGlobalPrefix('/api/v1');

  // Cors Configuration
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE') || 'Kanban API')
    .setDescription(
      configService.get('SWAGGER_DESCRIPTION') || 'Project Management API',
    )
    .setVersion(configService.get('SWAGGER_VERSION') || '1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Authorization',
    )
    .addTag('Auth')
    .addTag('Users')
    .addTag('Boards')
    .addTag('Columns')
    .addTag('Tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT') ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Docs available at http://localhost:${port}/docs`);
}
bootstrap();
