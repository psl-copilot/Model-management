import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger-service/logger-service.module';
import { RulesModule } from './rules/rules.module';

@Module({
  imports: [AuthModule, LoggerModule, RulesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
