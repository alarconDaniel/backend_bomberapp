import { Injectable } from '@nestjs/common';

/**
 * Application-level service providing basic operations
 * used by the root controller.
 */
@Injectable()
export class AppService {
  /**
   * Returns a simple greeting message.
   * Typically used as a basic health or sanity check endpoint.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
