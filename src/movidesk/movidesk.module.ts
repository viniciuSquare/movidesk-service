import { Module } from '@nestjs/common';
import { MovideskService } from './movidesk.service';
import { MovideskController } from './movidesk.controller';
import { HttpModule } from '@nestjs/axios';
import { OpenDataProtocolService } from '../providers/openDataProtocol.service';
import { PrismaService } from 'src/prisma/prisma.servide';
import { TicketRepository } from './repository/ticket.repository';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [HttpModule.register({}), ScheduleModule.forRoot()],
  controllers: [MovideskController],
  providers: [
    MovideskService,
    OpenDataProtocolService,
    TicketRepository,
    PrismaService
  ],
})
export class MovideskModule { }
