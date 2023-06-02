import { Controller, Get, Body, Patch, Param, Post, Query } from '@nestjs/common';
import { MovideskService } from './movidesk.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

/**
 * Controller to handle Movidesk requests
 * @class MovideskController
 */
@Controller('movidesk/ticket')
export class MovideskController {
  /**
   * Constructor
   * @param movideskService Movidesk Service to handle requests
   */
  constructor(private readonly movideskService: MovideskService) { }

  // Get tickets from given params 
  @Post('/getAll')
  async getAllTickets(@Body() filterTicketDTO) {
    console.log(filterTicketDTO)

    return await this.movideskService.getAll(filterTicketDTO);
  }

  @Get('/by-employee/:start/:end')
  async ticketsByEmployee(@Query() filterTicketDTO) {
    
    const tickets = await this.movideskService.getTicketsByEmployee(filterTicketDTO);

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

  @Get('/incidents')
  async incidentTickets() {
    // this.movideskService.getAll()
  }

  // ---------------------
  /**
   *  Route to get a ticket from Movidesk
   * @param id Ticket ID
   * @returns Ticket
   */
  @Get('/by-id=:id')
  async getTicket(@Param('id') id: string) {
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
