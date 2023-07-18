import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MovideskService } from './movidesk/movidesk.service';

/**
 * App Service
 * @class AppService
 */
@Injectable()
export class AppService {
  /**
   * Get a message
   * @returns Message
   */
  getHello(): string {
    return 'Hello World!';
  }
}
