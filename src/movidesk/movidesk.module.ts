import { Module } from '@nestjs/common';
import { MovideskService } from './movidesk.service';
import { MovideskController } from './movidesk.controller';
import { HttpModule } from '@nestjs/axios';
import { MovideskGrpcServerController } from './movidesk-grpc-server/movidesk-grpc-server.controller';
import { OpenDataProtocolService } from '../providers/openDataProtocol.service';
import { PrismaService } from 'src/prisma/prisma.servide';
import { TicketRepository } from './repository/ticket.repository';

@Module({
  imports: [HttpModule.register({})],
  controllers: [MovideskController, MovideskGrpcServerController],
  providers: [
    MovideskService,
    OpenDataProtocolService,
    PrismaService, TicketRepository
  ],
})
export class MovideskModule {}
