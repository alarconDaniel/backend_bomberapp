import { Module } from '@nestjs/common';
import { LogroController } from './logro.controller';
import { LogroService } from './logro.service';

@Module({
  controllers: [LogroController],
  providers: [LogroService]
})
export class LogroModule {}
