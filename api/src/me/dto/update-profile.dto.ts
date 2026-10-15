import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'สมชาย ใจดี', description: 'User display name' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อที่แสดง' })
  @MaxLength(100, { message: 'ชื่อที่แสดงต้องไม่เกิน 100 ตัวอักษร' })
  display_name!: string;
}
