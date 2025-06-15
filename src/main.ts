import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { Request as ExpressRequest } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

declare module 'express' {
  interface Request {
    user?: any;
    logout?: (callback: (err: any) => void) => void;
    isAuthenticated?: () => boolean;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      process.env.FRONTEND_HOME_URL || 'http://localhost:3000',
      'https://wynnpool.weikuwu.me',
      'https://weight.wynnpool.com',
      'https://www.wynnpool.com',
      'https://wynnpool.com'
    ],
    credentials: true,
  });
  app.use(
    session({
      secret: process.env.JWT_SECRET || 'changeme',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Fix for session cookie domain in dev
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Wynnpool API')
    .setDescription(':3')
    .setVersion('1.0')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
