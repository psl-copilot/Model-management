import { Injectable, Logger } from '@nestjs/common';
import { AdminServiceClient } from '../admin-service-client';
import { Rules } from './dto/rules.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(private readonly adminServiceClient: AdminServiceClient) {}
  private async getRuleOrThrow(id: number, token: string): Promise<Rules> {
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

  async createRule(
    ruleData: Partial<Rules>,
    token: string,
  ): Promise<Rules> {
    try {
      return await this.adminServiceClient.createRule(ruleData, token);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error creating rule: ${err.message}`);
      throw error;
    }
  }

  async getRuleIds(token: string): Promise<any[]> {
    try {
      return await this.adminServiceClient.getRuleIds(token);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error fetching rule IDs: ${err.message}`);
      throw error;
    }
  }

  async getRuleConfiguration(ruleId: string, token: string): Promise<any> {
    try {
      return await this.adminServiceClient.getRuleConfiguration(ruleId, token);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error fetching configuration for rule ${ruleId}: ${err.message}`);
      throw error;
    }
  }

  async updateRule(
    ruleId: string,
    updateData: Partial<Rules>,
    token: string,
  ): Promise<Rules> {
    try {
      return await this.adminServiceClient.updateRule(ruleId, updateData, token);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error updating rule ${ruleId}: ${err.message}`);
      throw error;
    }
  }

  async getActiveNetworkMap(token: string): Promise<any> {
    try {
      return await this.adminServiceClient.getActiveNetworkMap(token);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error fetching active network map: ${err.message}`);
      throw error;
    }
  }

  async getRulesStatusbyRole(tokenString: string): Promise<string[]> {
    try {
      const outerDecoded = jwt.decode(tokenString) as any;
      if (!outerDecoded) {
        this.logger.error('Failed to decode outer JWT token - token is null or invalid');
        return [];
      }
      const innerDecoded = jwt.decode(outerDecoded.tokenString) as any;
      if (!innerDecoded) {
        this.logger.error('Failed to decode inner JWT token - tokenString is null or invalid');
        return [];
      }

      if (!innerDecoded.status) {
        this.logger.warn('Inner token payload does not contain status field');
        this.logger.log(`Available inner token fields: ${Object.keys(innerDecoded).join(', ')}`);
        return [];
      }

      const statusString = innerDecoded.status as string;
      const statuses = statusString
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      this.logger.log(`Extracted ${statuses.length} allowed statuses from token: ${statuses.join(', ')}`);
      return statuses;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to decode JWT token: ${err.message}`);
      return [];
    }
  }
}
