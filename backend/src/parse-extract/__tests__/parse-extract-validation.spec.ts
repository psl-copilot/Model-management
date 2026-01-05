import { Test, TestingModule } from '@nestjs/testing';
import { ParseExtractService } from '../parse-extract.service';
import { AdminServiceClient } from '../../services/admin-service-client';

describe('ParseExtractService - AJV Validation', () => {
  let service: ParseExtractService;
  let mockAdminServiceClient: jest.Mocked<AdminServiceClient>;

  const mockSchema = {
    config: {
      type: 'object',
      properties: {
        FIToFICstmrCdtTrf: {
          type: 'object',
          properties: {
            GrpHdr: {
              type: 'object',
              properties: {
                MsgId: { type: 'string' },
                CreDtTm: { type: 'string' },
                NbOfTxs: { type: 'string' },
              },
              required: ['MsgId', 'CreDtTm'],
            },
          },
          required: ['GrpHdr'],
        },
      },
      required: ['FIToFICstmrCdtTrf'],
    },
  };

  beforeEach(async () => {
    const mockAdminService = {
      getSchemaByTxTp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParseExtractService,
        { provide: AdminServiceClient, useValue: mockAdminService },
      ],
    }).compile();

    service = module.get<ParseExtractService>(ParseExtractService);
    mockAdminServiceClient = module.get(AdminServiceClient);
  });

  describe('Payload Validation', () => {
    it('should successfully validate valid payload', async () => {
      const validPayload = {
        FIToFICstmrCdtTrf: {
          GrpHdr: {
            MsgId: 'MSG123',
            CreDtTm: '2024-01-01T00:00:00Z',
            NbOfTxs: '1',
          },
        },
      };

      mockAdminServiceClient.getSchemaByTxTp.mockResolvedValue(mockSchema);

      const result = await service.processTransactionalMessage(
        { 
          TxTp: 'pacs.008.001.10', 
          FIToFICstmrCdtTrf: validPayload.FIToFICstmrCdtTrf 
        },
        'Bearer token',
      );

      expect(result.success).toBe(true);
      expect(result.validationErrors).toBeUndefined();
      expect(result.validatedPayload).toEqual({ FIToFICstmrCdtTrf: validPayload.FIToFICstmrCdtTrf });
    });

    it('should handle invalid payload with missing required fields', async () => {
      const invalidPayload = {
        FIToFICstmrCdtTrf: {
          GrpHdr: {
            MsgId: 'MSG123',
            // Missing required CreDtTm field
          },
        },
      };

      mockAdminServiceClient.getSchemaByTxTp.mockResolvedValue(mockSchema);

      const result = await service.processTransactionalMessage(
        { TxTp: 'pacs.008.001.10', Payload: invalidPayload },
        'Bearer token',
      );

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors).toContain(
        expect.stringContaining("Missing required property 'CreDtTm'"),
      );
    });

    it('should handle payload with incorrect data types', async () => {
      const invalidPayload = {
        FIToFICstmrCdtTrf: {
          GrpHdr: {
            MsgId: 123, // Should be string
            CreDtTm: '2024-01-01T00:00:00Z',
          },
        },
      };

      mockAdminServiceClient.getSchemaByTxTp.mockResolvedValue(mockSchema);

      const result = await service.processTransactionalMessage(
        { 
          TxTp: 'pacs.008.001.10', 
          FIToFICstmrCdtTrf: invalidPayload.FIToFICstmrCdtTrf 
        },
        'Bearer token',
      );

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors).toContain(
        expect.stringContaining('Should be a string'),
      );
    });

    it('should handle missing schema configuration', async () => {
      mockAdminServiceClient.getSchemaByTxTp.mockResolvedValue(null);

      const result = await service.processTransactionalMessage(
        { TxTp: 'unknown.transaction', SomeData: {} },
        'Bearer token',
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('No schema configuration found');
    });

    it('should extract payload from request object when Payload field is not provided', async () => {
      const requestWithEmbeddedPayload = {
        TxTp: 'pacs.008.001.10',
        FIToFICstmrCdtTrf: {
          GrpHdr: {
            MsgId: 'MSG123',
            CreDtTm: '2024-01-01T00:00:00Z',
          },
        },
      };

      mockAdminServiceClient.getSchemaByTxTp.mockResolvedValue(mockSchema);

      const result = await service.processTransactionalMessage(
        requestWithEmbeddedPayload,
        'Bearer token',
      );

      expect(result.success).toBe(true);
      expect(result.validatedPayload).toEqual({
        FIToFICstmrCdtTrf: {
          GrpHdr: {
            MsgId: 'MSG123',
            CreDtTm: '2024-01-01T00:00:00Z',
          },
        },
      });
    });
  });
});