import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { LoggerService } from '@tazama-lf/frms-coe-lib';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ message: string; token: string; expiresIn: number | null }> {
    const authUrl = process.env.TAZAMA_AUTH_URL;
    if (!authUrl) {
      this.loggerService.error(
        'TAZAMA_AUTH_URL is not set in environment variables',
      );
      throw new ServiceUnavailableException(
        'Authentication service unavailable',
      );
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${authUrl}/login`, { username, password }),
      );
      if (!response.data) {
        this.loggerService.error(
          'Auth service did not return a valid response',
          AuthService.name,
        );
        throw new ServiceUnavailableException(
          'Authentication service unavailable',
        );
      }
      this.loggerService.log('Auth service responded', AuthService.name);

      const token =
        typeof response.data === 'string'
          ? response.data
          : (response.data?.token ??
            response.data?.access_token ??
            response.data?.jwt ??
            response.data?.user?.token);
      return {
        message: 'Login successful',
        token,
        expiresIn: response.data?.expires_in ?? response.data?.expiresIn,
      };
    } catch (error) {
      if (error.response?.status === 429) {
        const errorMessage = 'Account temporarily locked due to too many failed login attempts.';
        this.loggerService.warn(`Account locked (${error.response?.status}): ${errorMessage}`);
        throw new UnauthorizedException(errorMessage);
      }
      if (error.response?.status === 401) {
        const errorMessage = 'Invalid credentials';
        this.loggerService.warn(`Authentication failed: ${errorMessage}`);
        throw new UnauthorizedException(errorMessage);
      }
      this.loggerService.error(
        `Auth service error during login: ${error.message}`,
      );
      throw new ServiceUnavailableException(
        'Authentication service unavailable',
      );
    }
  }
}
