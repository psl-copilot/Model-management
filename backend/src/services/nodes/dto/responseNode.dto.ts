import { IsString, IsNotEmpty, IsOptional, IsJSON } from 'class-validator';

export class ResponseNodeDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  code_template?: string;

  @IsJSON()
  @IsOptional()
  default_data?: any;
}