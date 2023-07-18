import { Controller, Get, Body, Patch, Param, Post, Query } from '@nestjs/common';
import { MovideskService } from './movidesk.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PrismaService } from 'src/prisma/prisma.servide';
import { TicketRepository } from './repository/ticket.repository';
import { Cron } from '@nestjs/schedule';

/**
 * Controller to handle Movidesk requests
 * @class MovideskController
 */
@Controller('movidesk/ticket')
export class MovideskController {

  defaultSearch = {
    search: {
      normalFieldValues: [
        { name: "id" },
        { name: "subject" },
        { name: "owner" },
        { name: "category" },
        { name: "createdDate", value: " gt 2023-05-22" },
        { name: "ownerTeam", value: "'Infra de Produção'" },
        { expand: "actions", value: "timeAppointments", select: 'status, createdDate' }
      ]
    }
  }
  /**
   * Constructor
   * @param movideskService Movidesk Service to handle requests
   */
  constructor(
    private readonly movideskService: MovideskService,
    private prismaService: PrismaService,
    private ticketRepository: TicketRepository
  ) { }

  @Post('/process-period')
  async processMetricsFromPeriod(@Body() { period }) {
    console.log(period)

    const { start, end, teams } = period;
    
    const formattedTeams = teams 
      ? teams.split(',').map(team => `ownerTeam eq '${team}'`).join(' or ')
      : undefined;

    return this.movideskService
      .processMetricsFromPeriod(
        start, 
        end, 
        formattedTeams
      )
  }

  @Post('/raw')
  async rawQuery(@Body() filter) {
    const { query } = filter;

    const tickets = await this.movideskService.rawQuery(query);

    return {
      count: {
        tickets: tickets.length
      },
      tickets
    };
  }

  // Get tickets from given params 
  @Post('/getAll')
  async getAllTickets(@Body() filterTicketDTO) {
    console.log(filterTicketDTO)

    return await this.movideskService.getAll(filterTicketDTO);
  }

  @Get('/incidents/:start/:end')
  async incidentTickets(@Param('start') start: string, @Param('end') end: string) {
    return await this.movideskService.getIncidents({ start, end });
  }

  @Get('/by-employee/:start/:end')
  async ticketsByEmployees(
    @Param('start') start: string,
    @Param('end') end: string
  ) {
    const { data: tickets } = await this.movideskService.getAll(
      {
        ...this.defaultSearch,
        period: {
          start,
          end
        }
      }
    );

    const ticketByOwner: any[] = [];

    tickets.forEach((ticket) => {
      const owner = ticket.owner.businessName;

      let ownerTickets = ticketByOwner.find((t) => t.owner === owner);

      if (!ownerTickets) {
        ownerTickets = { owner, tickets: [], count: 0 };

        ticketByOwner.push(ownerTickets);
      }

      ownerTickets.tickets.push(ticket);
      ownerTickets.count += 1;
    });

    console.log(ticketByOwner);

    return ticketByOwner;

  }

  @Get('/teams/:start/:end')
  async getTeams(@Param('start') start: string, @Param('end') end: string) {
    const filter = {
      period: {
        start,
        end
      },
      search: {
        normalFieldValues: [
          { name: "id" },
          { name: "subject" },
          { name: "owner" },
          { name: "category" },
          { name: "createdDate", value: "ge " + new Date(start).toISOString() },
          { name: "ownerTeam" },
          { expand: "actions", value: "timeAppointments", select: 'status, createdDate' }
        ]
      }
    }

    const { data: tickets } = await this.movideskService.getAll(filter);

    const ticketByTeam: any[] = [];

    tickets.forEach((ticket) => {
      const ownerTeam = ticket.ownerTeam;

      let teamTickets = ticketByTeam.find((t) => t.ownerTeam === ownerTeam);

      if (!teamTickets) {
        teamTickets = { ownerTeam, tickets: [], count: 0 };

        ticketByTeam.push(teamTickets);
      }

      teamTickets.tickets.push(ticket);
      teamTickets.count += 1;
    });

    console.log(ticketByTeam);

    return ticketByTeam;
  }

  // ---------------------
  /**
   *  Route to get a ticket from Movidesk
   * @param id Ticket ID
   * @returns Ticket
   */
  @Get('/by-id')
  async getTicket(@Query('id') id: string) {
    console.log(id)
    return await this.movideskService.getTicket(id);
  }


  /**
   * Route to update a ticket from Movidesk
   * @param id Ticket ID
   * @param updateMovideskDto Ticket data to update
   * @returns Updated ticket
   */
  @Patch(':id')
  async updateTicket(
    @Param('id') id: string,
    @Body() updateMovideskDto: Movidesk.CustomFieldValue[],
  ) {
    return await this.movideskService.updateTicket(id, updateMovideskDto);
  }

  /**
   * Route to create a ticket for Movidesk
   * @param createTicketDto Ticket data to create
   * @returns Created ticket
   */
  @Post('/ticket')
  postTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.movideskService.createTicket(createTicketDto);
  }
}
