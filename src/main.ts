import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: errors.map((err) => ({
            field: err.property,
            errors: Object.values(err.constraints),
          })),
        });
      },
    }),
  );

  const port = configService.get<number>('PORT');
  await app.listen(port);
}
bootstrap();
