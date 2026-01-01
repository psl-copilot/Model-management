import { Injectable, Logger } from '@nestjs/common';
import { AdminServiceClient } from '../services/admin-service-client';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  async getTransactionTypes(token: string): Promise<string[]> {
    try {
      return await this.adminServiceClient.getTransactionTypes(token);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error fetching transaction types: ${err.message}`);
      throw error;
    }
  }
}
