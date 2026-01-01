import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { AdminServiceClient } from '../services/admin-service-client';

@Module({
  imports: [HttpModule],
  controllers: [ConfigController],
  providers: [ConfigService, AdminServiceClient],
})
export class ConfigModule {}
