import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

import { catchError, lastValueFrom } from 'rxjs';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { OpenDataProtocolService } from 'src/providers/openDataProtocol.service';

import { TicketRepository } from './repository/ticket.repository';
import { TeamRepository } from './repository/team.repository';

import { TicketFilterDto } from './dto/ticket-filter.dto';

/**
 * @class MovideskService
 * Communication with ModiDesk API
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
    private readonly ticketRepository: TicketRepository,
    private readonly teamRepository: TeamRepository,

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

  // @Cron('0 */2 * * * *')
  async handleScheduledTask() {
    let count = 0
    const today = new Date().toISOString().split('T')[0];
    
    const [ year, month, day ] = today.split('-');
    const yesterday = `${year}-${month}-${Number(day)-1}`;


    console.log("HELLO WORLD ⚡️ ", count++, today, yesterday) 
    // Perform data processing here
    await this.processTicketsFromPeriod(today, yesterday);

  }

  async processTicketsFromPeriod(
    start: string, 
    end: string, 
    teams = `ownerTeam eq 'Infra de Produção' or ownerTeam eq 'Infra Corporativa' ` 
  ) {
    const queryBase = `&$select=status,closedIn,slaSolutionDate,resolvedIn,lastUpdate,ownerTeam,createdDate,category,owner,subject,id&$expand=actions($expand=timeAppointments($expand=createdBy)),actions($select=status, createdDate),owner($select=businessName)`
    const filter = `&$filter=((createdDate ge ${start} and createdDate le ${end}) or (resolvedIn ge ${start} and resolvedIn le ${end}) or (lastUpdate ge ${start} and lastUpdate le ${end}))`

    const teamFilter = `${ teams }`

    const query = queryBase + filter + ` and (${teamFilter})`
    
    console.log(query, 'query');

    const allTickets: Movidesk.TicketResponse[] = [];

    let skip = 0;
    let responseCount = 0;

    do {
      const response = await this.rawQuery(query + `&$skip=${skip}`);
      const tickets: Movidesk.TicketResponse[] = response;
      allTickets.push(...tickets);

      responseCount = tickets.length;
      skip += responseCount;

      // Break the loop if responseCount is less than 1000
    } while (responseCount === 1000);

    const processedTicketsCount = await this.ticketRepository.processTickets(allTickets);
    console.log("Passou aqui")
    // Formatting to return
    const ticketByTeam: any[] = [];

    allTickets.forEach((ticket) => {
      const ownerTeam = ticket.ownerTeam;

      let teamTickets = ticketByTeam.find((t) => t.ownerTeam === ownerTeam);

      if (!teamTickets) {
        teamTickets = { ownerTeam, tickets: [], count: 0 };

        ticketByTeam.push(teamTickets);
      }

      teamTickets.tickets.push(ticket);
      teamTickets.count += 1;
    });

    return {
      query,
      data: {
        ...processedTicketsCount,
        tickets: ticketByTeam
      }
    };
  }

  async deleteTickets( 
    start: string, 
    end: string,
    teams = ['Infra de Produção', 'Infra Corporativa']
  ) {
    const teamsIds = await this.teamRepository.getTeamsIds(teams);
    
    return await this.ticketRepository.deleteTicketsFromPeriod(start, end, teamsIds);
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

  // * CRUD TICKET ON MOVIDESK

  /**
   * Get a ticket from Movidesk
   * @param id Ticket ID
   * @returns  Ticket typeof Movidesk.TicketResponse
   */
  async getTicket(id: string): Promise<Movidesk.TicketResponse> {
    console.log("To fetch data");

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
