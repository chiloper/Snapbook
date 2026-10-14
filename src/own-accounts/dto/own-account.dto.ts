import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateOwnAccountDto {
  @ApiProperty({ example: 'KBank', description: 'ชื่อธนาคารหรือผู้ให้บริการ' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อธนาคาร' })
  bank_name!: string;

  @ApiProperty({ example: 'นายสมชาย ใจดี', description: 'ชื่อบัญชี' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อบัญชี' })
  account_name!: string;

  @ApiProperty({ example: '1234', description: 'เลขบัญชี 4 หลักสุดท้าย' })
  @IsString()
  @Length(4, 4, { message: 'เลขบัญชีต้องเป็น 4 หลักสุดท้าย' })
  @Matches(/^\d{4}$/, { message: 'เลขบัญชี 4 หลักสุดท้ายต้องเป็นตัวเลขเท่านั้น' })
  account_number_last4!: string;
}

export class UpdateOwnAccountDto {
  @ApiProperty({ example: 'KBank', description: 'ชื่อธนาคารหรือผู้ให้บริการ', required: false })
  @IsString()
  bank_name?: string;

  @ApiProperty({ example: 'นายสมชาย ใจดี', description: 'ชื่อบัญชี', required: false })
  @IsString()
  account_name?: string;

  @ApiProperty({ example: '5678', description: 'เลขบัญชี 4 หลักสุดท้าย', required: false })
  @IsString()
  @Length(4, 4, { message: 'เลขบัญชีต้องเป็น 4 หลักสุดท้าย' })
  @Matches(/^\d{4}$/, { message: 'เลขบัญชี 4 หลักสุดท้ายต้องเป็นตัวเลขเท่านั้น' })
  account_number_last4?: string;
}
