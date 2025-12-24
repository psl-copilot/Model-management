import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../../src/auth/auth.service';
import { LoggerService } from '@tazama-lf/frms-coe-lib';
import {
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpService: HttpService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },

        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Ensure the env var is set by default for tests that rely on it
    process.env.TAZAMA_AUTH_URL = 'http://localhost:3001/auth';
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.TAZAMA_AUTH_URL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const username = 'test@example.com';
    const password = 'password123';
    const authUrl = 'http://localhost:3001/auth';

    it('should throw ServiceUnavailableException when TAZAMA_AUTH_URL is not set', async () => {
      // remove the env var for this scenario
      delete process.env.TAZAMA_AUTH_URL;

      try {
        await service.login(username, password);
        fail('Expected ServiceUnavailableException to be thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ServiceUnavailableException);
        expect(err.message).toContain('Authentication service unavailable');
      }

      expect(loggerService.error).toHaveBeenCalledWith(
        'TAZAMA_AUTH_URL is not set in environment variables',
      );
    });

    it('should successfully login with token as string response', async () => {
      const mockToken = 'mock-jwt-token-string';
      (httpService.post as jest.Mock).mockReturnValue(
        of({ data: mockToken }) as any,
      );

      const result = await service.login(username, password);

      expect(result).toEqual({
        message: 'Login successful',
        token: mockToken,
        expiresIn: undefined,
      });
      expect(httpService.post).toHaveBeenCalledWith(`${authUrl}/login`, {
        username,
        password,
      });
      expect(loggerService.log).toHaveBeenCalledWith(
        'Auth service responded',
        'AuthService',
      );
    });

    it('should successfully login with token in data.token field', async () => {
      const mockToken = 'mock-jwt-token';
      (httpService.post as jest.Mock).mockReturnValue(
        of({ data: { token: mockToken, expires_in: 3600 } }) as any,
      );

      const result = await service.login(username, password);

      expect(result).toEqual({
        message: 'Login successful',
        token: mockToken,
        expiresIn: 3600,
      });
      expect(loggerService.log).toHaveBeenCalledWith(
        'Auth service responded',
        'AuthService',
      );
    });

    it('should successfully login with token in data.access_token field', async () => {
      const mockToken = 'mock-access-token';
      (httpService.post as jest.Mock).mockReturnValue(
        of({ data: { access_token: mockToken, expiresIn: 7200 } }) as any,
      );

      const result = await service.login(username, password);

      expect(result).toEqual({
        message: 'Login successful',
        token: mockToken,
        expiresIn: 7200,
      });
    });

    it('should successfully login with token in data.jwt field', async () => {
      const mockToken = 'mock-jwt';
      (httpService.post as jest.Mock).mockReturnValue(
        of({ data: { jwt: mockToken } }) as any,
      );

      const result = await service.login(username, password);

      expect(result).toEqual({
        message: 'Login successful',
        token: mockToken,
        expiresIn: undefined,
      });
    });

    it('should successfully login with token in data.user.token field', async () => {
      const mockToken = 'mock-user-token';
      (httpService.post as jest.Mock).mockReturnValue(
        of({ data: { user: { token: mockToken } } }) as any,
      );

      const result = await service.login(username, password);

      expect(result).toEqual({
        message: 'Login successful',
        token: mockToken,
        expiresIn: undefined,
      });
    });

    it('should throw ServiceUnavailableException when response data is invalid', async () => {
      (httpService.post as jest.Mock).mockReturnValue(of({}) as any);

      await expect(service.login(username, password)).rejects.toThrow(
        ServiceUnavailableException,
      );

      expect(loggerService.error).toHaveBeenCalledWith(
        'Auth service did not return a valid response',
        'AuthService',
      );
    });

    it('should throw UnauthorizedException for 401 status code', async () => {
      const error = {
        response: { status: 401 },
        message: 'Unauthorized',
      };
      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => error) as any,
      );

      try {
        await service.login(username, password);
        fail('Expected UnauthorizedException to be thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toContain('Invalid credentials');
      }

      expect(loggerService.warn).toHaveBeenCalledWith(
        `Invalid credentials for user ${username}`,
      );
    });

    it('should throw ServiceUnavailableException for network errors', async () => {
      const error = new Error('Network error');
      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => error) as any,
      );

      await expect(service.login(username, password)).rejects.toThrow(
        ServiceUnavailableException,
      );

      expect(loggerService.error).toHaveBeenCalledWith(
        'Auth service error during login: Network error',
      );
    });

    it('should throw ServiceUnavailableException for 500 server errors', async () => {
      const error = {
        response: { status: 500 },
        message: 'Internal Server Error',
      };
      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => error) as any,
      );

      await expect(service.login(username, password)).rejects.toThrow(
        ServiceUnavailableException,
      );

      expect(loggerService.error).toHaveBeenCalledWith(
        'Auth service error during login: Internal Server Error',
      );
    });
  });
});
