import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SummaryService {
  constructor(private readonly supabase: SupabaseService) {}

  async getMonthlySummary(userId: string, monthParam?: string) {
    const targetMonth = monthParam || this.getCurrentMonthBangkok();

    // Invoke Postgres function computed directly in SQL
    const { data, error } = await this.supabase
      .getClient()
      .rpc('get_monthly_summary', {
        p_user_id: userId,
        p_month: targetMonth,
      });

    if (error) {
      throw new BadRequestException(
        `ไม่สามารถคำนวณข้อมูลสรุปได้: ${error.message}`,
      );
    }

    return data;
  }

  private getCurrentMonthBangkok(): string {
    const now = new Date();
    // Offset +7 hours for Asia/Bangkok
    const bangkokTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const year = bangkokTime.getUTCFullYear();
    const month = String(bangkokTime.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
