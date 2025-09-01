import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleToken } from 'src/models/google-token/google-token';
import { GoogleDriveOAuthService } from './google-drive-oauth.service';
import { GoogleDriveOAuthController } from './google-drive-oauth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GoogleToken])],
  controllers: [GoogleDriveOAuthController],
  providers: [GoogleDriveOAuthService],
  exports: [GoogleDriveOAuthService],
})
export class GoogleDriveOAuthModule {}
