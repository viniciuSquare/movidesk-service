import { Module } from '@nestjs/common';
import { MovideskService } from './movidesk.service';
import { MovideskController } from './movidesk.controller';
import { HttpModule } from '@nestjs/axios';
import { OpenDataProtocolService } from '../providers/openDataProtocol.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketRepository } from './repository/ticket.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { TeamRepository } from './repository/team.repository';

@Module({
  imports: [HttpModule.register({}), ScheduleModule.forRoot()],
  controllers: [MovideskController],
  providers: [
    MovideskService,
    OpenDataProtocolService,
    TicketRepository,
    TeamRepository,
    PrismaService
  ],
})
export class MovideskModule { }
