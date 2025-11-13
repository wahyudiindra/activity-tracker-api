import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ApiKeyMiddleware } from './common/middleware/api-key.middleware';
import { CommonModule } from './common/common.module';
import { UsagesModule } from './usages/usages.module';
import { CachesModule } from './caches/caches.module';

@Module({
    imports: [
        CachesModule,
        CommonModule,
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        ClientsModule,
        UsagesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ApiKeyMiddleware).forRoutes({
            path: 'api/logs',
            method: RequestMethod.POST,
        });
    }
}
