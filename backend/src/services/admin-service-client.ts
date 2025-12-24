import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdminServiceClient {
  private readonly logger = new Logger(AdminServiceClient.name);
  private readonly adminServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.adminServiceUrl =
      process.env.ADMIN_SERVICE_URL ?? 'http://localhost:3100';
  }

  async forwardRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const url = `${this.adminServiceUrl}${path}`;
    if (body) {
      this.logger.debug(
        `Request body: ${JSON.stringify(body).substring(0, 200)}...`,
      );
    }
    if (headers) {
      this.logger.debug(`Request headers: ${JSON.stringify(headers)}`);
    }

    try {
      let response;

      switch (method) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get(url, { headers }),
          );
          break;

        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(url, body, { headers }),
          );
          break;

        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(url, body, { headers }),
          );
          break;

        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(url, { headers, data: body }),
          );
          break;

        case 'PATCH':
          response = await firstValueFrom(
            this.httpService.patch(url, body, { headers }),
          );
          break;
      }

      this.logger.log(`${method} ${path} - Success (${response.status})`);
      this.logger.debug(
        `Response data: ${JSON.stringify(response.data).substring(0, 200)}...`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`${method} ${path} - Failed: ${error.message}`);

      if (error.response) {
        const { status, data } = error.response;
        this.logger.error(
          `Admin-service error (${status}): ${JSON.stringify(data)}`,
        );

        const message =
          data &&
          typeof data === 'object' &&
          'message' in data &&
          typeof data.message === 'string'
            ? data.message
            : typeof data === 'string'
              ? data
              : 'Request failed';

        throw new HttpException(message, status);
      } else if (error.request) {
        this.logger.error(`No response from admin-service: ${error.message}`);
        throw new HttpException(
          'Admin service is unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        this.logger.error(`Request setup error: ${error.message}`);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
