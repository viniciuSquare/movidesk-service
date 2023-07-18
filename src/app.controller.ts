import { Controller, Get, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller to handle requests
 * @class AppController
 */
@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Route to get a message
   * @returns Message
   * @example 'Hello World!'
   */
  @Get('/')
  getHello(): string {
    return 'Hello World!';
  }
}
