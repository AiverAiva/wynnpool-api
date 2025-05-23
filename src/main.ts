import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { Request as ExpressRequest } from 'express';

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
    origin: process.env.FRONTEND_HOME_URL || 'http://localhost:3000',
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

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
