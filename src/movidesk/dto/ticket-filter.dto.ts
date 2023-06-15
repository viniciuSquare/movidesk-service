import { IsObject } from "class-validator";

export class TicketFilterDto {
  @IsObject()
  search: Ticket.Search;

  @IsObject()
  period?: Ticket.Period;
}