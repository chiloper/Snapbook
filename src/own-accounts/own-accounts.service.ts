import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOwnAccountDto, UpdateOwnAccountDto } from './dto/own-account.dto';

@Injectable()
export class OwnAccountsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('own_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch own accounts: ${error.message}`);
    }
    return data || [];
  }

  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('own_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('ไม่พบบัญชีผู้ใช้ที่ต้องการ');
    }
    return data;
  }

  async create(userId: string, dto: CreateOwnAccountDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('own_accounts')
      .insert({
        user_id: userId,
        bank_name: dto.bank_name,
        account_name: dto.account_name,
        account_number_last4: dto.account_number_last4,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create own account: ${error.message}`);
    }
    return data;
  }

  async update(userId: string, id: string, dto: UpdateOwnAccountDto) {
    // Check existence first
    await this.findOne(userId, id);

    const updatePayload: Record<string, any> = {};
    if (dto.bank_name !== undefined) updatePayload.bank_name = dto.bank_name;
    if (dto.account_name !== undefined) updatePayload.account_name = dto.account_name;
    if (dto.account_number_last4 !== undefined) {
      updatePayload.account_number_last4 = dto.account_number_last4;
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('own_accounts')
      .update(updatePayload)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update own account: ${error.message}`);
    }
    return data;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .getClient()
      .from('own_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete own account: ${error.message}`);
    }
    return { success: true, message: 'ลบบัญชีสำเร็จ' };
  }

  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .getClient()
      .from('own_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) return 0;
    return count || 0;
  }
}
