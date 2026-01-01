import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Get,
  Query,
  Put,
} from '@nestjs/common';
import { TazamaAuthGuard } from '../auth/tazama-auth.guard';
import { User } from '../auth/user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { TazamaClaims, RequireAnyClaims } from '../auth/auth.decorator';
import { RulesService } from './rules.service';
import { Rules } from './dto/rules.dto';

@Controller('rules')
@UseGuards(TazamaAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}


  @Post('/api/all')
  @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
  async getAllRules(
    @Query('offset') offset: string,
    @Query('limit') limit: string,
    @User() user: AuthenticatedUser,
    @Body() filters?: Record<string, unknown>,
  ): Promise<Rules[]> {
    return await this.rulesService.getAllRules(
      parseInt(offset, 10),
      parseInt(limit, 10),
      filters ?? {},
      user.token.tokenString,
    );
  }


  @Get('/api/:id')
  @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
  async getRulesById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: AuthenticatedUser,
  ): Promise<Rules> {
    return await this.rulesService.getRulesById(
      id,
      user.tenantId,
      user.token.tokenString,
    );
  }

  @Post('/api')
  @RequireAnyClaims(TazamaClaims.EDITOR)
  async createRule(
    @Body() ruleData: Partial<Rules>,
    @User() user: AuthenticatedUser,
  ): Promise<Rules> {
    console.log('Creating rule with data:', ruleData);
    console.log('User info:', user.validated);
    return await this.rulesService.createRule(
      ruleData,
      user.token.tokenString,
    );
  }

  @Get('/api/ids')
  @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
  async getRuleIds(
    @User() user: AuthenticatedUser,
  ): Promise<any[]> {
    return await this.rulesService.getRuleIds(
      user.token.tokenString,
    );
  }

  @Get('/api/configuration/:ruleId')
  @RequireAnyClaims(
    TazamaClaims.EDITOR,
    TazamaClaims.APPROVER,
    TazamaClaims.PUBLISHER,
  )
  async getRuleConfiguration(
    @Param('ruleId') ruleId: string,
    @User() user: AuthenticatedUser,
  ): Promise<any> {
    return await this.rulesService.getRuleConfiguration(
      ruleId,
      user.token.tokenString,
    );
  }

  @Put('/api/:ruleId')
  @RequireAnyClaims(TazamaClaims.EDITOR)
  async updateRule(
    @Param('ruleId') ruleId: string,
    @Body() updateData: Partial<Rules>,
    @User() user: AuthenticatedUser,
  ): Promise<Rules> {
    return await this.rulesService.updateRule(
      ruleId,
      updateData,
      user.token.tokenString,
    );
  }
}
