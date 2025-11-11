import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersClientService } from './users-client.service';

@Module({
  imports: [ConfigModule],
  providers: [UsersClientService],
  exports: [UsersClientService],
})
export class UsersClientModule {}
