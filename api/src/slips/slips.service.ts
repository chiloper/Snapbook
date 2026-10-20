import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ISlipExtractor,
  SLIP_EXTRACTOR_TOKEN,
} from '../extraction/interfaces/slip-extractor.interface';
import { OwnAccountsService } from '../own-accounts/own-accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { determineTransactionType } from '../extraction/utils/account-matcher';
import { suggestCategoryName } from '../extraction/rules/category-rules';

export interface SlipProcessingItemResult {
  file_name: string;
  result: 'created' | 'duplicate' | 'failed';
  transaction?: any;
  transaction_ref?: string;
  slip_id?: string;
  message?: string;
  needs_type_review?: boolean;
}

@Injectable()
export class SlipsService {
  private readonly logger = new Logger(SlipsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    @Inject(SLIP_EXTRACTOR_TOKEN)
    private readonly slipExtractor: ISlipExtractor,
    private readonly ownAccountsService: OwnAccountsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async processSlips(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<SlipProcessingItemResult[]> {
    const results: SlipProcessingItemResult[] = [];
    const ownAccounts = await this.ownAccountsService.findAll(userId);
    const seenRefsInBatch = new Set<string>();
    const seenHashesInBatch = new Set<string>();

    for (const file of files) {
      const fileName = file.originalname || 'slip.jpg';

      try {
        const fileHash = createHash('sha256').update(file.buffer).digest('hex');

        // Fast check: exact same image file uploaded multiple times in the same request batch
        if (seenHashesInBatch.has(fileHash)) {
          results.push({
            file_name: fileName,
            result: 'duplicate',
            message: 'ไฟล์สลิปนี้ซ้ำกับไฟล์อื่นในรอบอัปโหลดเดียวกัน',
          });
          continue;
        }

        // 1. Insert initial slip record with status 'processing'
        // Note: Do not upload slip images to Supabase Storage to prevent upload failures
        // and reduce system load. We process in-memory and save raw_extraction and transactions.
        const storagePath = 'not_stored';
        const { data: slipRecord, error: slipInsertErr } = await this.supabase
          .getClient()
          .from('slips')
          .insert({
            user_id: userId,
            storage_path: storagePath,
            status: 'processing',
          })
          .select()
          .single();

        if (slipInsertErr || !slipRecord) {
          results.push({
            file_name: fileName,
            result: 'failed',
            message: 'ไม่สามารถบันทึกข้อมูลสลิปลงฐานข้อมูลได้',
          });
          continue;
        }

        const slipId = slipRecord.id;

        // 2. Send image buffer directly to Template slip extractor (in-memory)
        const extraction = await this.slipExtractor.extractFromImage(
          file.buffer,
          file.mimetype,
        );

        const normalizedRef = extraction.transaction_ref
          ? extraction.transaction_ref.replace(/\s+/g, '').trim()
          : '';
        extraction.transaction_ref = normalizedRef;
        (extraction as any).file_hash = fileHash;

        // 5. Validation check: extraction errors, is_bank_slip & amount
        if (extraction.error) {
          const failReason = `การสแกนสลิปไม่สำเร็จ (${extraction.error})`;
          await this.markSlipFailed(userId, slipId, failReason, extraction);
          results.push({
            file_name: fileName,
            result: 'failed',
            slip_id: slipId,
            message: failReason,
          });
          continue;
        }

        const amountNum = Number(extraction.amount);
        if (!extraction.is_bank_slip || isNaN(amountNum) || amountNum <= 0) {
          const failReason = !extraction.is_bank_slip
            ? 'รูปภาพไม่ใช่สลิปโอนเงินของธนาคาร'
            : 'ไม่พบจำนวนเงินที่ถูกต้องในสลิป';

          await this.markSlipFailed(userId, slipId, failReason, extraction);
          results.push({
            file_name: fileName,
            result: 'failed',
            slip_id: slipId,
            message: failReason,
          });
          continue;
        }

        // 6. Determine transaction type (income / expense)
        const typeDetection = determineTransactionType(
          { name: extraction.sender_name, account: extraction.sender_account },
          { name: extraction.receiver_name, account: extraction.receiver_account },
          ownAccounts,
        );

        // 7. Counterparty details based on type
        const isExpense = typeDetection.type === 'expense';
        const counterpartyName = isExpense
          ? extraction.receiver_name
          : extraction.sender_name;
        const counterpartyAccount = isExpense
          ? extraction.receiver_account
          : extraction.sender_account;

        // 8. Suggest category using keyword rules
        let categoryId: string | null = null;
        const suggestedCatName = suggestCategoryName(
          counterpartyName,
          extraction.memo,
          typeDetection.type,
        );

        if (suggestedCatName) {
          const matchedCategory = await this.categoriesService.findByName(
            userId,
            suggestedCatName,
            typeDetection.type,
          );
          if (matchedCategory) {
            categoryId = matchedCategory.id;
          }
        }

        // 9. Check duplicate slip (by transaction_ref / หมายเลขทำรายการ, batch, or file_hash)
        if (normalizedRef && seenRefsInBatch.has(normalizedRef.toUpperCase())) {
          await this.supabase
            .getClient()
            .from('slips')
            .update({
              status: 'extracted',
              raw_extraction: extraction,
            })
            .eq('user_id', userId)
            .eq('id', slipId);

          results.push({
            file_name: fileName,
            result: 'duplicate',
            transaction_ref: normalizedRef,
            slip_id: slipId,
            message: `สลิปซ้ำในรอบอัปโหลดเดียวกัน (หมายเลขทำรายการ: ${normalizedRef})`,
          });
          continue;
        }

        if (normalizedRef) {
          const { data: duplicateTxs } = await this.supabase
            .getClient()
            .from('transactions')
            .select('id, transaction_ref, amount, bank_name, counterparty_name, transaction_at')
            .eq('user_id', userId)
            .ilike('transaction_ref', normalizedRef)
            .limit(1);

          if (duplicateTxs && duplicateTxs.length > 0) {
            await this.supabase
              .getClient()
              .from('slips')
              .update({
                status: 'extracted',
                raw_extraction: extraction,
              })
              .eq('user_id', userId)
              .eq('id', slipId);

            results.push({
              file_name: fileName,
              result: 'duplicate',
              transaction: duplicateTxs[0],
              transaction_ref: normalizedRef,
              slip_id: slipId,
              message: `สลิปนี้ถูกบันทึกในระบบแล้ว (หมายเลขทำรายการ: ${normalizedRef})`,
            });
            continue;
          }
        } else {
          // Fallback when OCR could not read transaction_ref: check if identical image file_hash was already saved
          const { data: prevSlips } = await this.supabase
            .getClient()
            .from('slips')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'extracted')
            .neq('id', slipId)
            .contains('raw_extraction', { file_hash: fileHash })
            .limit(1);

          if (prevSlips && prevSlips.length > 0) {
            const { data: linkedTxs } = await this.supabase
              .getClient()
              .from('transactions')
              .select('id, transaction_ref, amount, bank_name, counterparty_name, transaction_at')
              .eq('user_id', userId)
              .eq('slip_id', prevSlips[0].id)
              .limit(1);

            if (linkedTxs && linkedTxs.length > 0) {
              await this.supabase
                .getClient()
                .from('slips')
                .update({
                  status: 'extracted',
                  raw_extraction: extraction,
                })
                .eq('user_id', userId)
                .eq('id', slipId);

              results.push({
                file_name: fileName,
                result: 'duplicate',
                transaction: linkedTxs[0],
                slip_id: slipId,
                message: 'สลิปนี้ถูกบันทึกในระบบแล้ว (ตรวจพบไฟล์ภาพสลิปเดียวกัน)',
              });
              continue;
            }
          }
        }

        // 10. Insert transaction with status 'pending_review'
        const { data: newTx, error: txError } = await this.supabase
          .getClient()
          .from('transactions')
          .insert({
            user_id: userId,
            slip_id: slipId,
            type: typeDetection.type,
            amount: amountNum,
            fee: Number(extraction.fee) || 0,
            transaction_at: extraction.transaction_datetime,
            bank_name: extraction.bank_name || null,
            counterparty_name: counterpartyName || null,
            counterparty_account: counterpartyAccount || null,
            transaction_ref: normalizedRef || null,
            category_id: categoryId,
            note: extraction.memo || null,
            status: 'pending_review',
          })
          .select('*, category:categories(*)')
          .single();

        if (txError) {
          // Handle potential race condition unique constraint conflict
          if (txError.code === '23505') {
            results.push({
              file_name: fileName,
              result: 'duplicate',
              transaction_ref: normalizedRef || undefined,
              slip_id: slipId,
              message: `สลิปนี้ถูกบันทึกในระบบแล้ว${normalizedRef ? ` (หมายเลขทำรายการ: ${normalizedRef})` : ' (รหัสอ้างอิงตรงกัน)'}`,
            });
            continue;
          }

          await this.markSlipFailed(userId, slipId, `บันทึกรายการไม่สำเร็จ: ${txError.message}`);
          results.push({
            file_name: fileName,
            result: 'failed',
            slip_id: slipId,
            message: 'ไม่สามารถบันทึกรายการธุรกรรมได้',
          });
          continue;
        }

        seenHashesInBatch.add(fileHash);
        if (normalizedRef) {
          seenRefsInBatch.add(normalizedRef.toUpperCase());
        }

        // 11. Mark slip as extracted successfully
        await this.supabase
          .getClient()
          .from('slips')
          .update({
            status: 'extracted',
            raw_extraction: extraction,
          })
          .eq('user_id', userId)
          .eq('id', slipId);

        results.push({
          file_name: fileName,
          result: 'created',
          transaction: newTx,
          transaction_ref: normalizedRef || undefined,
          slip_id: slipId,
          needs_type_review: typeDetection.needs_type_review,
        });
      } catch (err: any) {
        this.logger.error(`Error processing slip ${fileName}: ${err.message}`);
        results.push({
          file_name: fileName,
          result: 'failed',
          message: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์สลิป',
        });
      }
    }

    return results;
  }

  async getSlipImageUrl(userId: string, id: string) {
    const { data: slip, error } = await this.supabase
      .getClient()
      .from('slips')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error || !slip) {
      throw new NotFoundException('ไม่พบข้อมูลสลิปที่ต้องการ');
    }

    if (!slip.storage_path || slip.storage_path === 'not_stored' || slip.storage_path === 'none') {
      throw new NotFoundException('สลิปนี้ไม่ได้ถูกจัดเก็บรูปภาพไว้ในคลาวด์ (จัดเก็บเฉพาะข้อมูลดิบเพื่อความเป็นส่วนตัวและลดภาระระบบ)');
    }

    const { signedUrl, error: signError } = await this.supabase.createSignedUrl(
      'slips',
      slip.storage_path,
      600, // 10 minutes
    );

    if (signError || !signedUrl) {
      throw new NotFoundException(signError || 'ไม่สามารถสร้างลิงก์สำหรับเปิดดูรูปภาพได้');
    }

    return {
      signed_url: signedUrl,
      expires_in: 600,
    };
  }

  private async markSlipFailed(
    userId: string,
    slipId: string,
    errorMessage: string,
    rawExtraction?: any,
  ) {
    await this.supabase
      .getClient()
      .from('slips')
      .update({
        status: 'failed',
        error: errorMessage,
        raw_extraction: rawExtraction || null,
      })
      .eq('user_id', userId)
      .eq('id', slipId);
  }

  private getFileExtension(mimeType: string, filename: string): string {
    if (mimeType === 'image/png') return 'png';
    if (mimeType === 'image/webp') return 'webp';
    if (mimeType === 'image/jpeg') return 'jpg';

    const match = filename.match(/\.([a-zA-Z0-9]+)$/);
    if (match) return match[1].toLowerCase();
    return 'jpg';
  }
}
