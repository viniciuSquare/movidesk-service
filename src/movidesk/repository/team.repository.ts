import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Team } from "@prisma/client";

@Injectable()
export class TeamRepository {

  private team: Team;

  constructor(
    private prismaService: PrismaService,
  ) { }

  async findOrSaveTeam(name: string) {
    const team = await this.findTeamByName(name);

    console.log(team, team ? " Exists" : " Doesn't exists");

    if (team) {
      console.log('Team saved returned');

      return team
    }

    console.log('Saving new team');

    return await this.prismaService.team.create({
      data: {
        name: name
      }
    })
  }

  async findTeamByName(teamName: string): Promise<Team> {
    try {
      const team = await this.prismaService.team
        .findFirst({
          where: {
            name: {
              contains: teamName
            }
          }
        });

      return team
    } catch (error) {
      console.error(error);
    }
  }

  async getTeamsIds(teamNames: string[]) {
    return await Promise
      .all(teamNames
        .map(async teamName => (await this.findTeamByName(teamName)).id)
      );
  }
} 
