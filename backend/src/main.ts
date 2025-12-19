import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from '@tazama-lf/frms-coe-lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  const logger = app.get(LoggerService);
  app.useLogger(logger);
    logger.log(`Application started on port ${process.env.PORT ?? 3000} (env=${process.env.NODE_ENV})`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

}
bootstrap();
