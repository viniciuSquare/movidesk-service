import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma, Team, Ticket } from "@prisma/client";
import * as dayjs from "dayjs";
import { TeamRepository } from "./team.repository";

@Injectable()
export class TicketRepository {

  private team: Team;

  constructor(
    private prismaService: PrismaService,
    private teamRepository: TeamRepository,
  ) { }

  async processTickets(tickets: Movidesk.TicketResponse[]) {
    const ticketsCount = tickets.length;
    let actionsCount = 0;
    let appoitmentsCount = 0;
    const status: string[] = [];

    await Promise.all(tickets.map(async ticket => {
      // * PERSIST TICKET
      await this.findOrSaveTicket(ticket)
        .then(() => {
          actionsCount += ticket.actions.length;

          console.debug("Processing time appointments from ticket ", ticket.id);

          if (!status.includes(ticket.status)) {
            status.push(ticket.status);
          }

          return Promise.all(ticket.actions.map(async action => {
            appoitmentsCount += action.timeAppointments.length;

            return await Promise.all(action.timeAppointments.map(async timeAppointment => {
              return await this.findOrSaveAction(timeAppointment, ticket.id);
            })
            )
          })
          )
        })
    }
    ))

    return {
      count: {
        tickets: ticketsCount,
        actions: actionsCount,
        appointments: appoitmentsCount,
        status
      }
    }
  }

  private async findOrSaveTicket(ticket: Movidesk.TicketResponse) {
    // * FIND TEAM
    let teamRegister: Team
    try {
      teamRegister = await this.teamRepository.findOrSaveTeam(ticket.ownerTeam);
    } catch (error) {
      throw new Error(`Team ${ticket.ownerTeam} not found!`);
    }

    let ticketRegister = await this.prismaService.ticket.findFirst({
      where: {
        ticketNumber: {
          equals: ticket.id
        }
      }
    })

    const { ticketNumber, ...ticketData } = this.feedTicketFromResponse(ticket, teamRegister.id);

    if (ticketRegister) {
      // IS TICKET UPDATED?
      const hasNewerUpdates = (
        (ticketRegister.ticketLastUpdate.toISOString() != new Date(ticket.lastUpdate).toISOString()) ||
        (ticketRegister.status != ticket.status) ||
        (
          (ticket.slaSolutionDate && ticketRegister.slaSolutionDate) &&
          (ticketRegister.slaSolutionDate?.toISOString() != new Date(ticket.slaSolutionDate).toISOString())
        )
      )

      if (hasNewerUpdates) {
        console.log(ticketRegister.ticketNumber, ' newer updates ', new Date(ticket.lastUpdate).toISOString());

        ticketRegister = await this.prismaService.ticket.update({
          where: {
            ticketNumber: ticketNumber
          },
          data: {
            ...ticketData,
          }
        })
      }
      return ticketRegister
    } else {
      // * SAVE TICKET IF NOT FOUND
      console.debug(`Saving ${ticket.id}`);

      return await this.prismaService.ticket.create({
        data: {
          ticketNumber,
          ...ticketData
        }
      })
    }
  }

  private isIncident(category: string): boolean {
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

    return incidentsCategories.includes(category);
  }

  private async findOrSaveAction(timeAppointment: Movidesk.TimeAppointment, ticketId: number) {
    const timeRegister = await this.prismaService.actionTimes.findFirst({
      where: {
        id: timeAppointment.id
      }
    })

    if (!timeRegister) {
      console.error(`Time ${timeAppointment.id} not found!`);

      return await this.prismaService.actionTimes.create({
        data: {
          id: timeAppointment.id,
          date: this.formatDate(timeAppointment.date, true),
          timeSpent: timeAppointment.accountedTime,
          person: timeAppointment.createdBy.businessName,
          ticketNumber: ticketId,
        }
      })
    }
    return timeRegister;
  }

  async deleteTicketsFromPeriod(start: string, end: string, teamsIds: number[]) {
    // TICKETS FROM THE PERIOD
    const ticketsIds = await this.prismaService.ticket.findMany({
      where: {
        AND: [
          {
            ticketCreatedDate: {
              gte: new Date(start),
              lte: new Date(end)
            }
          },
          {
            teamId: {
              in: teamsIds
            }
          }
        ]
      }
    }).then(result => result.map(ticket => ticket.ticketNumber) )

    // DELETE TICKET ACTIONS
    await this.prismaService.actionTimes.deleteMany({
      where: {
        ticketNumber: {
          in: ticketsIds
        }
      }
    })
    // DELETE TICKETS
    const deletedTickets = await this.prismaService.ticket.deleteMany({
      where: {
        ticketNumber: {
          in: ticketsIds
        }
      }
    })

    console.log(deletedTickets.count, " tickets deleted");
    
    return deletedTickets
  }

  private feedTicketFromResponse(response: Movidesk.TicketResponse, teamId: number) {
    return {
      ticketNumber: response.id,
      teamId: teamId,
      ownerName: response.owner?.businessName,
      category: response.category,
      status: response.status,

      ticketCreatedDate: this.formatDate(response.createdDate),
      ticketLastUpdate: this.formatDate(response.lastUpdate),
      ticketResolvedIn: this.formatDate(response.resolvedIn),
      slaSolutionDate: this.formatDate(response.slaSolutionDate),
      isIncident: this.isIncident(response.category),
      closedIn: this.formatDate(response.closedIn)
    }
  }

  private formatDate(dateString?: string, onlyWeekDays = false) {
    if (!dateString)
      return null

    dateString = dateString.split('T')[0];
    const date = dayjs(dateString);

    const [sunday, saturday] = [0, 6];
    const weekendDays = [sunday, saturday];

    const day = date.day();

    const isValid = !weekendDays.includes(day);

    if (!isValid && onlyWeekDays) {
      const nextValidDate = date.add(day == sunday ? 1 : 2, 'day');

      console.table([day, date.toISOString(), nextValidDate.toISOString()]);

      return nextValidDate.toISOString()

    } return date.toISOString();
  }
} 
