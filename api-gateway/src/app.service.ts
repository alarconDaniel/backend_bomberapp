import { Injectable } from '@nestjs/common';

const DEFAULT_GREETING_MESSAGE = 'Hello World!';

@Injectable()
export class AppService {
  /**
   * Returns the default greeting message used by the application.
   */
  getHello(): string {
    return DEFAULT_GREETING_MESSAGE;
  }
}
