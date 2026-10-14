import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class QuerySummaryDto {
  @ApiProperty({
    example: '2026-10',
    description: 'Year and month (YYYY-MM)',
    required: false,
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'กรุณาระบุรูปแบบเดือนเป็น YYYY-MM เช่น 2026-10',
  })
  month?: string;
}
