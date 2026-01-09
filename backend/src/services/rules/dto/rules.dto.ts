import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class Rules {
  @IsString()
  @IsNotEmpty()
  rule_name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  txtp: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsOptional()
  @IsString()
  txtpVersion?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  publishing_status?: string;

  @IsOptional()
  @IsString()
  rule_type?: string;

  @IsOptional()
  @IsString()
  rule_config_id?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: Date;

  @IsOptional()
  @IsDateString()
  created_at?: Date;
}

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  rule_id: string;

  @IsString()
  @IsNotEmpty()
  rule_name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  txtp: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsOptional()
  @IsString()
  txtpVersion?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  publishing_status?: string;

  @IsString()
  @IsNotEmpty()
  updated_by: string;

  @IsString()
  @IsNotEmpty()
  rule_type: string;

  @IsOptional()
  @IsString()
  rule_config_id?: string;
}

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  rule_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  txtp?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  txtpVersion?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  publishing_status?: string;

  @IsOptional()
  @IsString()
  rule_type?: string;

  @IsOptional()
  @IsString()
  rule_config_id?: string;
}

export class RuleIdDto {
  @IsString()
  @IsNotEmpty()
  ruleId: string;

  @IsString()
  @IsNotEmpty()
  ruleCfg: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

export class RuleConfigurationDto {
  @IsString()
  @IsNotEmpty()
  ruleId: string;

  @IsNotEmpty()
  configuration: any;
}
