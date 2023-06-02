import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { AxiosError } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';
import { IOData } from 'src/providers/interfaces/iodata';
import { CreateTicketDto } from './dto/create-ticket.dto';
// import { TicketFilterDto } from './dto/ticket-filter.dto';
/**
 * Movidesk Service
 * @class MovideskService
 */
@Injectable()
export class MovideskService {
  /**
   * Logger
   */
  protected logger = new Logger(MovideskService.name);
  /**
   * Constructor
   * @param httpService Http Service to handle requests
   */
  constructor(
    private readonly httpService: HttpService,
    @Inject('OData') private readonly oDataProvider: IOData,
  ) {}

  /**
   * Movidesk URL
   * @type {string}
   */
  http: string = process.env.MOVIDESK_URL;


  async getAll({ search }) {
    const query = await this.oDataProvider.formatNormalFieldValues(
      search?.normalFieldValues, 
    );
    
    console.log(query)
      
    const { data } = await lastValueFrom<{data: Movidesk.TicketResponse[]}>(
      this.httpService
        .get(`${this.http}?token=${process.env.MOVIDESK_TOKEN}${query}`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return {
      query,
      count: data.length,
      data
    };
  }

  async getTicketsByEmployee({ search }) {
    const filterTicketDTO = {
      search: {
        period: search?.period ? search.period : null , 
        normalFieldValues: [
          { name: "id" },
          { name: "subject" },
          { name: "owner", expand: "owner" },
          { name: "category" },
          { name: "createdDate", value: "gt 2023-05-22T00:00:00.00z" },
          { name: "createdDate", value: "lt 2023-05-30T00:00:00.00z" },
          { name: "actions" },
          { name: "ownerTeam", value: "'Infra Corporativa'" },
          { expand: "actions", value: "timeAppointments" },
        ]
      }
    }
    const query = await this.oDataProvider.formatNormalFieldValues(
      search?.normalFieldValues,
    );
    console.log(query);
    const { data } = await lastValueFrom<{data: Movidesk.TicketResponse[]}>(
      this.httpService
        .get(`${this.http}?token=${process.env.MOVIDESK_TOKEN}${query}`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return data;
  }
  
  /**
   * Get a ticket from Movidesk
   * @param id Ticket ID
   * @returns  Ticket typeof Movidesk.TicketResponse
   */
  async getTicket(id: string): Promise<Movidesk.TicketResponse> {
    const { data } = await lastValueFrom<{ data: Movidesk.TicketResponse }>(
      this.httpService.get(
        `${this.http}?token=${process.env.MOVIDESK_TOKEN}&id=${id}`,
      ),
    );

    return data;
  }

  /**
   * Update a ticket from Movidesk
   * @param id Ticket ID
   * @param updateMovideskDto Ticket typeof Movidesk.CustomFieldValue[]
   * @returns Updated ticket typeof Movidesk.TicketResponse
   */
  async updateTicket(
    id: string,
    updateMovideskDto: Movidesk.CustomFieldValue[],
  ) {
    const { data } = await lastValueFrom<{ data: Movidesk.TicketResponse }>(
      this.httpService.patch(
        `${this.http}?token=${process.env.MOVIDESK_TOKEN}&id=${id}`,
        { customFieldValues: updateMovideskDto },
        {
          headers: { Accept: 'application/json' },
        },
      ),
    );

    return data;
  }

  /**
   * Create a ticket for Movidesk
   * @param createTicketDto Json to create Ticket
   * @returns Created ticket typeof Movidesk.TicketResponse
   */
  async createTicket(
    createTicketDto: CreateTicketDto,
  ): Promise<Movidesk.TicketResponse> {
    const { data } = await lastValueFrom<{ data: Movidesk.TicketResponse }>(
      this.httpService
        .post(
          `${this.http}?token=${process.env.MOVIDESK_TOKEN}&returnAllProperties=false`,
          createTicketDto,
          {
            headers: { Accept: 'application/json' },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return data;
  }

}
