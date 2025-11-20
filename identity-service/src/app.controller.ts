import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Root controller exposing the default application endpoint.
 * Typically used for a simple greeting or basic health-style response.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a greeting message provided by AppService.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
