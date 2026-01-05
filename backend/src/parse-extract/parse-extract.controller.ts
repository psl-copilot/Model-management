import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TazamaAuthGuard } from '../auth/tazama-auth.guard';
import { User } from '../auth/user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { TazamaClaims, RequireAnyClaims } from '../auth/auth.decorator';
import { ParseExtractService } from './parse-extract.service';
import type { TransactionalMessage, ParseExtractResponse } from './dto/message.dto';

@Controller('parse')
@UseGuards(TazamaAuthGuard)
export class ParseExtractController {
  constructor(private readonly parseExtractService: ParseExtractService) {}

  @Post('/api/process-message')
  @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
  @HttpCode(HttpStatus.OK)
  async processTransactionalMessage(
    @Body() request: TransactionalMessage,
    @User() user: AuthenticatedUser,
  ): Promise<ParseExtractResponse> {
    return await this.parseExtractService.processTransactionalMessage(request);
  }
}