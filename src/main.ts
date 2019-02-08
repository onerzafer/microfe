import { FastifyAdapter, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
// import * as csurf from 'csurf';
import * as rateLimit from 'fastify-rate-limit';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, new FastifyAdapter(), {cors: true});
    app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute'
    });
    app.use(helmet());
    // app.use(csurf());
    await app.listen(3000);
}
bootstrap();
