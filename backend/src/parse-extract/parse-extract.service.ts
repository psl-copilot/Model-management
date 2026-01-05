import { Injectable, Logger } from '@nestjs/common';
import { TransactionalMessage, ParseExtractResponse } from './dto/message.dto';

@Injectable()
export class ParseExtractService {
  private readonly logger = new Logger(ParseExtractService.name);

  async processTransactionalMessage(
    request: TransactionalMessage,
  ): Promise<ParseExtractResponse> {
    try {
      // const { messageType, transactionData, messageId, timestamp, metadata } = request;
      
      // Log the received message details
      this.logger.log(`Processing transactional message for ${request.TxTp}`);
     
      // Create response
      const response: ParseExtractResponse = {
        success: true,
        message: `Successfully processed ${request.TxTp} message`,
        processedAt: new Date().toISOString(),
      };

      this.logger.log(`Message processing completed successfully for type`);
      
      return response;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error processing transactional message: ${err.message}`);
      
      return {
        success: false,
        message: `Failed to process message: ${err.message}`,
        processedAt: new Date().toISOString(),
      };
    }
  }

 
}