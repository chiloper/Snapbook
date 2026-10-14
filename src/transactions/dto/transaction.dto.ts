import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTransactionsDto {
  @ApiProperty({ required: false, description: 'Start date (YYYY-MM-DD or ISO 8601)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiProperty({ required: false, description: 'End date (YYYY-MM-DD or ISO 8601)' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiProperty({ required: false, enum: ['income', 'expense'] })
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: 'income' | 'expense';

  @ApiProperty({ required: false, description: 'Category UUID' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ required: false, enum: ['pending_review', 'confirmed'] })
  @IsOptional()
  @IsIn(['pending_review', 'confirmed'])
  status?: 'pending_review' | 'confirmed';

  @ApiProperty({ required: false, description: 'Search keyword in counterparty, note, or ref' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'expense', enum: ['income', 'expense'] })
  @IsIn(['income', 'expense'], { message: 'ประเภทต้องเป็น income หรือ expense' })
  type!: 'income' | 'expense';

  @ApiProperty({ example: 350.00, description: 'จำนวนเงิน (ต้องมากกว่า 0)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'จำนวนเงินต้องเป็นตัวเลข' })
  @IsPositive({ message: 'จำนวนเงินต้องมากกว่า 0' })
  amount!: number;

  @ApiProperty({ example: 0, description: 'ค่าธรรมเนียม', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'ค่าธรรมเนียมต้องไม่ติดลบ' })
  fee?: number = 0;

  @ApiProperty({ example: '2026-10-14T14:30:00+07:00', description: 'วันเวลาที่ทำรายการ' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุวันเวลาที่ทำรายการ' })
  transaction_at!: string;

  @ApiProperty({ example: 'KBank', required: false })
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiProperty({ example: 'ร้านส้มตำแซ่บ', required: false })
  @IsOptional()
  @IsString()
  counterparty_name?: string;

  @ApiProperty({ example: 'xxx-x-x1234', required: false })
  @IsOptional()
  @IsString()
  counterparty_account?: string;

  @ApiProperty({ example: 'REF20261014001', required: false })
  @IsOptional()
  @IsString()
  transaction_ref?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: 'อาหารกลางวันกับทีมงาน', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateTransactionDto {
  @ApiProperty({ example: 'expense', enum: ['income', 'expense'], required: false })
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: 'income' | 'expense';

  @ApiProperty({ example: 350.00, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fee?: number;

  @ApiProperty({ example: '2026-10-14T14:30:00+07:00', required: false })
  @IsOptional()
  @IsString()
  transaction_at?: string;

  @ApiProperty({ example: 'KBank', required: false })
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiProperty({ example: 'ร้านส้มตำแซ่บ', required: false })
  @IsOptional()
  @IsString()
  counterparty_name?: string;

  @ApiProperty({ example: 'xxx-x-x1234', required: false })
  @IsOptional()
  @IsString()
  counterparty_account?: string;

  @ApiProperty({ example: 'REF20261014001', required: false })
  @IsOptional()
  @IsString()
  transaction_ref?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: 'อาหารกลางวันกับทีมงาน', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 'confirmed', enum: ['pending_review', 'confirmed'], required: false })
  @IsOptional()
  @IsIn(['pending_review', 'confirmed'])
  status?: 'pending_review' | 'confirmed';
}

export class BulkConfirmTransactionsDto {
  @ApiProperty({ example: ['b62dd0da-04d3-466d-978d-ff85ad6385f0'], description: 'รายการ Transaction IDs ที่ต้องการยืนยัน' })
  @IsArray({ message: 'ids ต้องเป็น Array ของ Transaction UUIDs' })
  @IsUUID('4', { each: true, message: 'แต่ละ id ต้องเป็น UUID ที่ถูกต้อง' })
  ids!: string[];
}
