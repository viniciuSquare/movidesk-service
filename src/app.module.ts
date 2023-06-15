import { OpenDataProtocolService } from './providers/openDataProtocol.service';
import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExceptionFilterHttp } from './core/filter/exception_http.filter';
import { MovideskModule } from './movidesk/movidesk.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.servide';

@Module({
  imports: [
    MovideskModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],

  controllers: [AppController],
  providers: [
    OpenDataProtocolService,
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilterHttp,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
