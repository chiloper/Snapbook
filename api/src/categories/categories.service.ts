import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(userId: string) {
    // Return both system categories (user_id IS NULL) and the user's custom categories
    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
  }

  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .single();

    if (error || !data) {
      throw new NotFoundException('ไม่พบหมวดหมู่ที่ต้องการ');
    }

    return data;
  }

  async findByName(userId: string, name: string, type?: 'income' | 'expense') {
    let query = this.supabase
      .getClient()
      .from('categories')
      .select('*')
      .eq('name', name)
      .or(`user_id.is.null,user_id.eq.${userId}`);

    if (type) {
      query = query.eq('type', type);
    }

    const { data } = await query.limit(1);
    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .insert({
        user_id: userId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon || '',
        color: dto.color || '#64748B',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    // Verify target category exists and belongs to the user
    const existing = await this.findOne(userId, id);
    if (!existing.user_id) {
      throw new ForbiddenException('ไม่สามารถแก้ไขหมวดหมู่เริ่มต้นของระบบได้');
    }
    if (existing.user_id !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขหมวดหมู่นี้');
    }

    const payload: Record<string, any> = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.type !== undefined) payload.type = dto.type;
    if (dto.icon !== undefined) payload.icon = dto.icon;
    if (dto.color !== undefined) payload.color = dto.color;

    const { data, error } = await this.supabase
      .getClient()
      .from('categories')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return data;
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);
    if (!existing.user_id) {
      throw new ForbiddenException('ไม่สามารถลบหมวดหมู่เริ่มต้นของระบบได้');
    }
    if (existing.user_id !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์ลบหมวดหมู่นี้');
    }

    const { error } = await this.supabase
      .getClient()
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    return { success: true, message: 'ลบหมวดหมู่สำเร็จ' };
  }
}
