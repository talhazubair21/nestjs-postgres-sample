import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
// import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // app.useLogger(app.get(Logger));
  app.use(helmet());
  await app.listen(4000);
}
bootstrap();
