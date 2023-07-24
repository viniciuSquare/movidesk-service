import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Prisma, Team } from "@prisma/client";

@Injectable()
export class TicketRepository {

  private team: Team;

  constructor(
    private prismaService: PrismaService,
  ) {

  }

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

          if(!status.includes(ticket.status)) {
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

  async findOrSaveTicket(ticket: Movidesk.TicketResponse) {
    // * FIND TEAM
    const teamRegister = await this.findOrSaveTeam(ticket.ownerTeam);

    if (!teamRegister) {
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
      if (
        (ticketRegister.ticketLastUpdate.toISOString() != new Date(ticket.lastUpdate).toISOString()) || 
        (ticketRegister.status != ticket.status) ||
        ((ticket.slaSolutionDate && ticketRegister.slaSolutionDate) && (ticketRegister.slaSolutionDate?.toISOString() != new Date(ticket.slaSolutionDate).toISOString()))
      ) {
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

  async findOrSaveTeam(name: string) {
    // If the team is already saved
    if (this.team?.name == name)
      return this.team;

    this.team = await this.prismaService.team.findFirst({
      where: {
        name: {
          equals: name,
        }
      }
    })

    console.log(this.team);

    if (this.team) {
      console.log('Team saved returned');

      return this.team
    }

    console.log('Saving new team');
    return await this.prismaService.team.create({
      data: {
        name: name
      }
    })
  }

  isIncident(category: string): boolean {
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

  async findOrSaveAction(timeAppointment: Movidesk.TimeAppointment, ticketId: number) {
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
          date: new Date(timeAppointment.date).toISOString(),
          timeSpent: timeAppointment.accountedTime,
          person: timeAppointment.createdBy.businessName,
          ticketNumber: ticketId,
        }
      })
    }
    return timeRegister;
  }

  feedTicketFromResponse(response: Movidesk.TicketResponse, teamId: number) {
    return {
      ticketNumber: response.id,
      teamId: teamId,
      ownerName: response.owner?.businessName,
      category: response.category,
      status: response.status,

      ticketCreatedDate: new Date(response.createdDate).toISOString(),
      ticketLastUpdate: new Date(response.lastUpdate).toISOString(),
      ticketResolvedIn: response.resolvedIn
        ? new Date(response.resolvedIn).toISOString() : null,
      slaSolutionDate: response.slaSolutionDate
        ? new Date(response.slaSolutionDate).toISOString() : null,
      isIncident: this.isIncident(response.category)
    }
  }

} 
