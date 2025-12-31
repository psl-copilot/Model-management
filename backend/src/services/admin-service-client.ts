import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Rules } from '../rules/dto/rules.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdminServiceClient {
  private readonly logger = new Logger(AdminServiceClient.name);
  private readonly adminServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.adminServiceUrl =
      process.env.ADMIN_SERVICE_URL ?? 'http://localhost:3100';
    this.logger.log(`Admin Service URL configured as: ${this.adminServiceUrl}`);
  }

  private async executeHttpRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<{ data: unknown; status: number }> {
    switch (method) {
      case 'GET':
        return await firstValueFrom(this.httpService.get(url, { headers }));
      case 'POST':
        return await firstValueFrom(
          this.httpService.post(url, body, { headers }),
        );
      case 'PUT':
        return await firstValueFrom(
          this.httpService.put(url, body, { headers }),
        );
      case 'DELETE':
        return await firstValueFrom(
          this.httpService.delete(url, { headers, data: body }),
        );
      case 'PATCH':
        return await firstValueFrom(
          this.httpService.patch(url, body, { headers }),
        );
    }
  }

  async forwardRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<unknown> {
    const url = `${this.adminServiceUrl}${path}`;
    this.logger.log(`Making ${method} request to: ${url}`);
    if (body) {
      this.logger.debug(
        `Request body: ${JSON.stringify(body).substring(0, 200)}...`,
      );
    }
    if (headers) {
      this.logger.debug(`Request headers: ${JSON.stringify(headers)}`);
    }

    try {
      const response = await this.executeHttpRequest(
        method,
        url,
        body,
        headers,
      );

      this.logger.log(`${method} ${path} - Success (${response.status})`);
      this.logger.debug(
        `Response data: ${JSON.stringify(response.data).substring(0, 200)}...`,
      );

      return response.data;
    } catch (error) {
      const err = error as {
        response?: { status: number; data: unknown };
        request?: unknown;
        message: string;
      };
      this.logger.error(`${method} ${path} - Failed: ${err.message}`);

      if (err.response) {
        const { status, data } = err.response;
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
      } else if (err.request) {
        this.logger.error(`No response from admin-service: ${err.message}`);
        throw new HttpException(
          'Admin service is unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        this.logger.error(`Request setup error: ${err.message}`);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private handleError(error: unknown, operation: string): never {
    const err = error as {
      response?: { status: number; data: unknown };
      request?: unknown;
      message: string;
    };
    if (err.response) {
      const { status, data } = err.response;
      this.logger.error(
        `${operation} failed with status ${status}: ${JSON.stringify(data)}`,
      );

      const message =
        data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof data.message === 'string'
          ? data.message
          : 'Admin service returned an error response';

      throw new HttpException(message, status);
    } else if (err.request) {
      this.logger.error(
        `${operation} - No response from admin-service: ${err.message}`,
      );
      throw new HttpException(
        'Admin service is unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      this.logger.error(`${operation} - Error: ${err.message}`);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllRulesWithFilters(
    offset: number,
    limit: number,
    filters: Record<string, unknown>,
    token: string,
  ): Promise<Rules[]> {
    return (await this.forwardRequest(
      'POST',
      `/v1/admin/trs/rules/${offset}/${limit}`,
      filters,
      {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    )) as Rules[];
  }
  async getRulesById(id: number, token: string): Promise<Rules> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.adminServiceUrl}/v1/admin/trs/rules/${id}`,
          {
            headers: {
              Authorization: token.startsWith('Bearer ')
                ? token
                : `Bearer ${token}`,
            },
          },
        ),
      );

      if (!response.data?.rules) {
        this.logger.warn(`Rules ${id} not found in admin-service response`);
        throw new NotFoundException(`Rules with id ${id} not found`);
      }

      return response.data.rules;
    } catch (error) {
      return this.handleError(error, 'getRulesById');
    }
  }

  async createRule(ruleData: Partial<Rules>, token: string): Promise<Rules> {
    try {
      const response = await this.forwardRequest(
        'POST',
        '/v1/admin/trs/rule',
        ruleData, 
        {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
      );

      console.log("the response from admin service client is", response);

      if (!response || typeof response !== 'object' || !('rule' in response)) {
        this.logger.error('Invalid response from admin-service createRule');
        throw new HttpException(
          'Invalid response from admin service',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return (response as { rule: Rules }).rule;
    } catch (error) {
      return this.handleError(error, 'createRule');
    }
  }

  async getRuleIds(token: string): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.adminServiceUrl}/v1/admin/trs/rule-ids`,
          {
            headers: {
              Authorization: token.startsWith('Bearer ')
                ? token
                : `Bearer ${token}`,
            },
          },
        ),
      );

      if (!response.data?.ruleIds) {
        this.logger.warn('No rule IDs found in admin-service response');
        return [];
      }

      return response.data.ruleIds;
    } catch (error) {
      return this.handleError(error, 'getRuleIds');
    }
  }
}
