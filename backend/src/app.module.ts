import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './services/auth/auth.module';
import { LoggerModule } from './logger-service/logger-service.module';
import { RulesModule } from './services/rules/rules.module';
import { ConfigModule } from './services/config/config.module';

@Module({
  imports: [AuthModule, LoggerModule, RulesModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
