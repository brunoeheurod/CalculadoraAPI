import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://template-sozonome-git-test-languages-brunodeye.vercel.app/',
      'https://deye-calculadora.deyeinversores.com.br',
      'https://calculadora.app.deyeinversores.com.br',
      'https://calculadora-eosin-chi.vercel.app',
      'https://main--imaginative-praline-c53240.netlify.app',
      'https://calculadora-deye.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
