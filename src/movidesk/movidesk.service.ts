import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { OpenDataProtocolService } from 'src/providers/openDataProtocol.service';
import { TicketRepository } from './repository/ticket.repository';
import { TicketFilterDto } from './dto/ticket-filter.dto';
import { OpenDataProtocolService } from 'src/providers/openDataProtocol.service';
import { TicketRepository } from './repository/ticket.repository';
import { TicketFilterDto } from './dto/ticket-filter.dto';
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
    private readonly oDataProvider: OpenDataProtocolService,
    private readonly repository: TicketRepository,

    // @Inject('OData') private readonly oDataProvider: IOData,
  ) { }

  /**
   * Movidesk URL
   * @type {string}
   */
  http: string = process.env.MOVIDESK_URL;

  async rawQuery(query: string) {
    const { data } = await lastValueFrom<{ data: Movidesk.TicketResponse[] }>(
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

  async getAll(filter: TicketFilterDto) {
    const query = await this.oDataProvider.formatNormalFieldValues(
      filter.search?.normalFieldValues,
    );
    console.log(query)

    const data = await this.rawQuery(query);

    return {
      query,
      count: data.length,
      data
    };
  }

  // METRICS QUERY

  async getTicketsByEmployee(search, period = { start: '', end: '' }) {
    const query = await this.oDataProvider.formatNormalFieldValues(
      search?.normalFieldValues,
    );

    const periodQuery = this.oDataProvider.formatPeriod(period);

    console.log(query);
    const { data } = await lastValueFrom<{ data: Movidesk.TicketResponse[] }>(
      this.httpService
        .get(`${this.http}?token=${process.env.MOVIDESK_TOKEN}${query} and ${periodQuery}`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return data;
  }

  // Incidentes
  async getIncidents(period = { start: '', end: '' }, teamFilter?) {
    const incidentsCategories = [
      "Incidente configuração",
      "Incidente externo",
      "Incidente HML/DEV - Manutenção de Ambientes",
      "Incidente HML/DEV - On-premises",
      "Incidente Infra",
      "Incidente PRD - Manutenção de Ambientes",
      "Incidente PRD - On-premises",
      "Incidente Produto"
    ]

    const formattedPeriodQuery = this.oDataProvider
      .formatPeriod(period, ['resolvedIn', 'createdDate']);
    const categoriesFilter = this.oDataProvider
      .formatGroupOperation('or', { property: "category", params: incidentsCategories });

    const URL = `${this.http}?token=${process.env.MOVIDESK_TOKEN}&$select=${this.oDataProvider.$select}&$filter=(${categoriesFilter}) and (${formattedPeriodQuery.replace(/date/g, 'createdDate')} or ${formattedPeriodQuery.replace(/date/g, 'resolvedIn')})&orderBy=createdDate desc`

    console.log(URL);

    const { data: incidents } = await lastValueFrom<{ data: Movidesk.TicketResponse[] }>(
      this.httpService
        .get(URL)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    const groupedByDay = incidents.reduce((acc, incident) => {
      const createdDate = incident.createdDate.split('T')[0]; // Extract the date part

      if (!acc[createdDate]) {
        acc[createdDate] = { count: 0, incidents: [] };
      }

      acc[createdDate].incidents.push(incident);
      acc[createdDate].count += 1;

      return acc;
    }, {});

    return { incidentsByDay: groupedByDay };
  }

  async processTickets(tickets: Movidesk.TicketResponse[], period = { start: '', end: '' }  ) {
    console.log(this.oDataProvider.formatPeriod(period));
    
    return await this.repository.processTickets(tickets);
  }

  // * CRUD TICKET ON MOVIDESK

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
