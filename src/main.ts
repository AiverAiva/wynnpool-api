import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as compression from 'compression';
// import { LoggingInterceptor } from './logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.use(compression());
  // app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
