import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateTransactionDto,
  QueryTransactionsDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { parseThaiDateTimeToIso } from '../extraction/utils/buddhist-year';

@Injectable()
export class TransactionsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(userId: string, query: QueryTransactionsDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    let dbQuery = this.supabase
      .getClient()
      .from('transactions')
      .select('*, category:categories(*), slip:slips(*)', { count: 'exact' })
      .eq('user_id', userId);

    if (query.type) {
      dbQuery = dbQuery.eq('type', query.type);
    }

    if (query.category_id) {
      dbQuery = dbQuery.eq('category_id', query.category_id);
    }

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.from) {
      dbQuery = dbQuery.gte('transaction_at', query.from);
    }

    if (query.to) {
      dbQuery = dbQuery.lte('transaction_at', query.to);
    }

    if (query.search && query.search.trim()) {
      const term = `%${query.search.trim()}%`;
      dbQuery = dbQuery.or(
        `counterparty_name.ilike.${term},counterparty_account.ilike.${term},note.ilike.${term},bank_name.ilike.${term},transaction_ref.ilike.${term}`,
      );
    }

    dbQuery = dbQuery
      .order('transaction_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await dbQuery;

    if (error) {
      throw new Error(`Failed to query transactions: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('transactions')
      .select('*, category:categories(*), slip:slips(*)')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('ไม่พบรายการธุรกรรมที่ต้องการ');
    }

    return data;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    // Check duplicate transaction_ref if provided
    if (dto.transaction_ref && dto.transaction_ref.trim()) {
      const normalizedRef = dto.transaction_ref.replace(/\s+/g, '').trim();
      dto.transaction_ref = normalizedRef;
      const { data: existing } = await this.supabase
        .getClient()
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .ilike('transaction_ref', normalizedRef)
        .limit(1);

      if (existing && existing.length > 0) {
        throw new ConflictException(`พบรายการธุรกรรมซ้ำในระบบ (หมายเลขทำรายการ: ${normalizedRef})`);
      }
    }

    let parsedDate = dto.transaction_at;
    try {
      parsedDate = parseThaiDateTimeToIso(dto.transaction_at);
    } catch {
      // Keep as-is if already ISO
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('transactions')
      .insert({
        user_id: userId,
        type: dto.type,
        amount: dto.amount,
        fee: dto.fee || 0,
        transaction_at: parsedDate,
        bank_name: dto.bank_name || null,
        counterparty_name: dto.counterparty_name || null,
        counterparty_account: dto.counterparty_account || null,
        transaction_ref: dto.transaction_ref || null,
        category_id: dto.category_id || null,
        note: dto.note || null,
        status: 'confirmed', // Manual entry defaults to confirmed
      })
      .select('*, category:categories(*)')
      .single();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return data;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, id);

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
      status: dto.status || 'confirmed', // Editing sets status to 'confirmed'
    };

    if (dto.type !== undefined) updatePayload.type = dto.type;
    if (dto.amount !== undefined) updatePayload.amount = dto.amount;
    if (dto.fee !== undefined) updatePayload.fee = dto.fee;
    if (dto.bank_name !== undefined) updatePayload.bank_name = dto.bank_name;
    if (dto.counterparty_name !== undefined) updatePayload.counterparty_name = dto.counterparty_name;
    if (dto.counterparty_account !== undefined) updatePayload.counterparty_account = dto.counterparty_account;
    if (dto.transaction_ref !== undefined) updatePayload.transaction_ref = dto.transaction_ref;
    if (dto.category_id !== undefined) updatePayload.category_id = dto.category_id;
    if (dto.note !== undefined) updatePayload.note = dto.note;

    if (dto.transaction_at !== undefined) {
      try {
        updatePayload.transaction_at = parseThaiDateTimeToIso(dto.transaction_at);
      } catch {
        updatePayload.transaction_at = dto.transaction_at;
      }
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('transactions')
      .update(updatePayload)
      .eq('user_id', userId)
      .eq('id', id)
      .select('*, category:categories(*), slip:slips(*)')
      .single();

    if (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return data;
  }

  async confirmBulk(userId: string, ids: string[]) {
    if (!ids || ids.length === 0) {
      return { updated_count: 0, success: true };
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('transactions')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .in('id', ids)
      .select('id');

    if (error) {
      throw new Error(`Failed to bulk confirm transactions: ${error.message}`);
    }

    return {
      updated_count: data ? data.length : 0,
      success: true,
      message: `ยืนยันรายการสำเร็จ ${data ? data.length : 0} รายการ`,
    };
  }

  async remove(userId: string, id: string) {
    const transaction = await this.findOne(userId, id);

    // If linked to a slip, also delete the slip image and slip record
    if (transaction.slip_id) {
      const { data: slip } = await this.supabase
        .getClient()
        .from('slips')
        .select('*')
        .eq('user_id', userId)
        .eq('id', transaction.slip_id)
        .maybeSingle();

      if (slip) {
        if (slip.storage_path && slip.storage_path !== 'not_stored' && slip.storage_path !== 'none') {
          await this.supabase.deleteSlipImage('slips', slip.storage_path);
        }
        await this.supabase
          .getClient()
          .from('slips')
          .delete()
          .eq('user_id', userId)
          .eq('id', transaction.slip_id);
      }
    }

    const { error } = await this.supabase
      .getClient()
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }

    return { success: true, message: 'ลบรายการธุรกรรมสำเร็จ' };
  }
}
