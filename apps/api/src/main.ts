import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Gestão de TCC - FT Unicamp')
    .setDescription('Documentação das rotas do sistema de orientação')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  logger.log('Swagger UI disponível em /api/docs');

<<<<<<< HEAD
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
=======
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(new ValidationPipe());
>>>>>>> 0b4299032dd50b96ab1a81f3b9aa43c99ee3b03f

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
