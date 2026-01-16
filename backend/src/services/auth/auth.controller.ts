import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ServiceUnavailableException,
  InternalServerErrorException,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoggerService } from '@tazama-lf/frms-coe-lib';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'User login', 
    description: 'Authenticate user and return JWT token for API access. **Note: This endpoint is available at http://10.10.80.37:3005/auth/login**' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful', 
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        expiresIn: { type: 'number', example: 3600 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 503, description: 'Auth service unavailable' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: LoginDto,
  ): Promise<{ message: string; token: string; expiresIn?: number }> {
    try {
      const result = await this.authService.login(body.username, body.password);

      const response: { token: string; message: string; expiresIn?: number } = {
        message: 'Login successful',
        token: result.token,
      };
      if (result.expiresIn) {
        response.expiresIn = result.expiresIn;
      }
      return response;
    } catch (error) {
      this.handleLoginError(error, body.username);
    }
  }

  private handleLoginError(error: unknown, username: string): never {
    if (error instanceof UnauthorizedException) {
      this.logger.warn(
        `Authentication failed for user ${username}`,
        AuthController.name,
      );
      throw error;
    }
    
    if (error instanceof ServiceUnavailableException) {
      this.logger.error(
        'Auth service unavailable during login attempt',
        AuthController.name,
      );
      throw error;
    }
    
    const err = error as Error;
    this.logger.error(
      `Unexpected error during login: ${err.message}`,
      AuthController.name,
    );
    throw new InternalServerErrorException(
      'An unexpected error occurred during login',
    );
  }
}
