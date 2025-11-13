import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionsFilter } from './common/filters/exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
    );

    app.useGlobalFilters(new ExceptionsFilter());

    const options = new DocumentBuilder()
        .setTitle('Activity Tracker API')
        .setVersion('1.0')
        .addBearerAuth()
        .setExternalDoc('Activity Tracker API - Collection', '/docs-json')
        .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, options));

    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 3000;
    await app.listen(port as number, host);
    console.info(`Server running on ${host}:${port}`);
}
bootstrap();
