import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { CognitoGuard } from './guards/cognito.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(new CognitoGuard(reflector));

  app.enableCors({
    maxAge: 3600,
    methods: ['GET', 'POST'],
  });
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
