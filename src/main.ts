import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Bootstrap the application
 * @returns Promise
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));
  app.setViewEngine('ejs');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50051',
      package: 'movidesk',
      // protoPath: join(__dirname, 'movidesk/proto/movidesk.proto'),
      protoPath: '/Users/square/Documents/Quiver/projects/movidesk_microservice/src/movidesk/proto/movidesk.proto'
    },
  });

  console.log(__dirname);

  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
