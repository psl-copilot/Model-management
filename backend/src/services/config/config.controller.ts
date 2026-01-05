import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { TazamaAuthGuard } from '../../guards/tazama-auth.guard';
import { RequireAnyClaims, TazamaClaims } from '../../decorators/auth.decorator';
import { User } from '../../decorators/user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';

@Controller('config')
@UseGuards(TazamaAuthGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('/api/transaction-types')
  @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
  async getTransactionTypes(
    @User() user: AuthenticatedUser,
  ): Promise<string[]> {
    return await this.configService.getTransactionTypes(
      user.token.tokenString,
    );
  }

  @Get('/api/payload/:transactionType')
  @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
  async getPayloadByTransactionType(
    @Param('transactionType') transactionType: string,
    @User() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.configService.getPayloadByTransactionType(
      transactionType,
      user.token.tokenString,
    );
  }
}
