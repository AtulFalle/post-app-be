import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Post Service API')
    .setDescription('API documentation for Post Service')
    .setVersion('1.0')
    .addTag('Posts')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors()
  await app.listen(process.env.PORT ?? 3003);

  // Attach the TCP microservice to the same instance (Avoids multiple processes)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: 3004 }, // Use a different port for TCP
  });

  await app.startAllMicroservices();
}
bootstrap();
