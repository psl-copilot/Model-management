import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { AdminServiceClient } from '../services/admin-service-client';
import { Rules } from './dto/rules.dto';


@Injectable()
export class RulesService {
    private readonly logger = new Logger(RulesService.name);

    constructor(private readonly adminServiceClient: AdminServiceClient,

    ) {}
    private async getRuleOrThrow(
    id: number,
    token: string,
  ): Promise<Rules> {
    try {
      return await this.adminServiceClient.getRulesById(id, token);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error finding rules by ID ${id}: ${err.message}`);
      throw error;
    }
  }
  
  
  async getAllRules(
    offset: number,
    limit: number,
    filters: Record<string, unknown>,
    token: string,
  ): Promise<Rules[]> {
    return await this.adminServiceClient.getAllRulesWithFilters(
      offset,
      limit,
      filters,
      token,
    );
  }
  async getRulesById(
    id: number,
    tenantId: string,
    token: string,
  ): Promise<Rules> {
    const rules = await this.getRuleOrThrow(id, token);
    return rules;
  }

  }