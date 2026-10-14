import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'อาหารและเครื่องดื่ม', description: 'ชื่อหมวดหมู่' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อหมวดหมู่' })
  name!: string;

  @ApiProperty({ example: 'expense', enum: ['income', 'expense'], description: 'ประเภทรายรับ/รายจ่าย' })
  @IsIn(['income', 'expense'], { message: 'ประเภทต้องเป็น income หรือ expense' })
  type!: 'income' | 'expense';

  @ApiProperty({ example: 'utensils', description: 'ไอคอนหมวดหมู่', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#EF4444', description: 'รหัสสี HEX', required: false })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'อาหารและเครื่องดื่ม', description: 'ชื่อหมวดหมู่', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'expense', enum: ['income', 'expense'], description: 'ประเภทรายรับ/รายจ่าย', required: false })
  @IsOptional()
  @IsIn(['income', 'expense'], { message: 'ประเภทต้องเป็น income หรือ expense' })
  type?: 'income' | 'expense';

  @ApiProperty({ example: 'utensils', description: 'ไอคอนหมวดหมู่', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: '#EF4444', description: 'รหัสสี HEX', required: false })
  @IsOptional()
  @IsString()
  color?: string;
}
