import { Injectable, Logger } from '@nestjs/common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { randomUUID } from 'node:crypto';
import { TransactionalMessage, ParseExtractResponse, RuleRequest, NetworkMap, DataCache, MetaData } from './dto/message.dto';
import { AdminServiceClient } from '../services/admin-service-client';
import { formatValidationErrors } from '../utils/validation.utils';

@Injectable()
export class ParseExtractService {
  private readonly logger = new Logger(ParseExtractService.name);
  private readonly ajv: Ajv;

  constructor(private readonly adminServiceClient: AdminServiceClient) {
    // Initialize AJV with same configuration as DEMS
    this.ajv = new Ajv({ allErrors: true, logger: false });
    addFormats(this.ajv);
  }

  async processTransactionalMessage(
    request: TransactionalMessage,
    token: string,
  ): Promise<ParseExtractResponse> {
    const correlationId = randomUUID();
    
    try {
      this.logger.log(`Processing transactional message for ${request.TxTp} [${correlationId}]`);
      
      // Fetch schema from database via Admin Service
      const schema = await this.adminServiceClient.getSchemaByTxTp(
        request.TxTp,
        token,
      );
      
      if (!schema || !schema.config) {
        const errorMsg = `No schema configuration found for transaction type: ${request.TxTp}`;
        this.logger.warn(errorMsg);
        
        return {
          success: false,
          message: errorMsg,
          processedAt: new Date().toISOString(),
          transactionType: request.TxTp,
          correlationId,
        };
      }

      this.logger.log(`Found schema configuration for: ${request.TxTp}`);

      // Extract payload to validate - exclude TxTp and TenantId from request
      const payloadToValidate = this.extractPayloadFromRequest(request);
      
      if (!payloadToValidate) {
        return {
          success: false,
          message: 'No payload found to validate',
          processedAt: new Date().toISOString(),
          transactionType: request.TxTp,
          correlationId,
        };
      }

      // Validate payload against schema
      const validationResult = await this.validatePayload(
        payloadToValidate,
        schema.config,
        request.TxTp,
        correlationId,
      );

      if (!validationResult.isValid) {
        return {
          success: false,
          message: 'Payload validation failed',
          processedAt: new Date().toISOString(),
          transactionType: request.TxTp,
          correlationId,
          validationErrors: validationResult.differences,
          configPayload: schema,
        };
      }

      // we create the RuleRequest object here
      const ruleRequest: RuleRequest = this.createRuleRequest(
        payloadToValidate,
        request,
        correlationId,
      );

      // we then finally make and return the response
      const response: ParseExtractResponse = {
        success: true,
        message: `Successfully validated and processed ${request.TxTp} message`,
        processedAt: new Date().toISOString(),
        configPayload: schema,
        transactionType: request.TxTp,
        correlationId,
        validatedPayload: payloadToValidate,
        ruleRequest, 
      };

      this.logger.log(`Message processing completed successfully for type: ${request.TxTp} [${correlationId}]`);
      this.logger.log(`RuleRequest created with transaction type: ${ruleRequest.metaData?.transactionType}`);
      
      return response;

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error processing transactional message [${correlationId}]: ${err.message}`, err.stack);
      
      return {
        success: false,
        message: `Failed to process message: ${err.message}`,
        processedAt: new Date().toISOString(),
        transactionType: request.TxTp,
        correlationId,
      };
    }
  }

  /**
   * Validates payload against the configured schema using AJV
   * @param payload The payload to validate
   * @param configuredSchema The schema to validate against
   * @param transactionType The transaction type for error tracking
   * @param correlationId Correlation ID for tracking
   * @returns Validation result with isValid flag and formatted errors
   */
  private async validatePayload(
    payload: any,
    configuredSchema: any,
    transactionType: string,
    correlationId: string,
  ): Promise<{ isValid: boolean; differences?: string[] }> {
    let isValid: boolean;
    
    try {
      isValid = this.ajv.validate(configuredSchema, payload);
    } catch (error) {
      this.logger.error(`AJV validation error for ${transactionType} [${correlationId}]: ${String(error)}`);
      
      return {
        isValid: false,
        differences: [`AJV Validation Error: ${String(error)}`],
      };
    }

    if (!isValid) {
      const differences: string[] = formatValidationErrors(this.ajv.errors);
      
      this.logger.warn(`Schema validation failed for ${transactionType} [${correlationId}]:`);
      differences.forEach((difference, index) => {
        this.logger.warn(`  ${index + 1}. ${difference}`);
      });

      return { isValid: false, differences };
    }

    this.logger.log(`Payload validation successful for ${transactionType} [${correlationId}]`);
    return { isValid: true };
  }

  /**
   * Extracts payload from request object, excluding TxTp and TenantId
   * @param request The transactional message request
   * @returns Extracted payload object
   */
  private extractPayloadFromRequest(request: TransactionalMessage): any {
    const { TxTp, TenantId, ...payloadData } = request;
    
    // If there's meaningful data after excluding metadata fields, return it
    if (Object.keys(payloadData).length > 0) {
      return payloadData;
    }
    
    return null;
  }

  /**
   * Creates a RuleRequest object for fraud detection rules
   * @param transaction The validated payload to be analyzed
   * @param originalRequest The original request for metadata
   * @param correlationId Correlation ID for tracking
   * @returns RuleRequest object ready for rule processing
   */
  private createRuleRequest(
    transaction: any,
    originalRequest: TransactionalMessage,
    correlationId: string,
  ): RuleRequest {
    // Create empty NetworkMap (to be populated later)
    const networkMap: NetworkMap = {};

    // Create empty DataCache (to be populated later) 
    const dataCache: DataCache = {};

    // Create metadata with context information
    const metaData: MetaData = {
      correlationId,
      timestamp: new Date().toISOString(),
      tenantId: originalRequest.TenantId,
      transactionType: originalRequest.TxTp,
    };

    const ruleRequest: RuleRequest = {
      transaction,
      networkMap,
      DataCache: dataCache,
      metaData,
    };

    this.logger.log(`Created RuleRequest for ${originalRequest.TxTp} with correlation ID: ${correlationId}`);

    return ruleRequest;
  }
}