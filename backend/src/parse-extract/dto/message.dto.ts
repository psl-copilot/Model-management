export interface TransactionalMessage {
  TxTp: string;
  [key: string]: any; // Allow for CstmrCdtTrfInitn, FIToFIPmtStsRpt, FIToFICstmrCdtTrf, etc.
}

export interface ParseExtractResponse {
  success: boolean;
  message: string;
  processedAt: string;
}