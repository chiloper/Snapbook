import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
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

    for (const file of files) {
      const fileName = file.originalname || 'slip.jpg';

      try {
        // 1. Determine storage path
        const ext = this.getFileExtension(file.mimetype, fileName);
        const fileUuid = randomUUID();
        const storagePath = `${userId}/${fileUuid}.${ext}`;

        // 2. Insert initial slip record with status 'processing'
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

        // 3. Upload to Supabase Storage private bucket 'slips'
        const { error: uploadError } = await this.supabase.uploadSlipImage(
          'slips',
          storagePath,
          file.buffer,
          file.mimetype,
        );

        if (uploadError) {
          this.logger.error(`Upload to storage failed for slip ${slipId} (${fileName}): ${uploadError}`);
          const isBucketNotFound =
            uploadError.toLowerCase().includes('bucket not found') ||
            uploadError.toLowerCase().includes('not found');

          const failMsg = isBucketNotFound
            ? 'ไม่พบบัคเก็ต "slips" ใน Supabase Storage (กรุณาสร้าง Bucket ชื่อ slips ใน Supabase Dashboard หรือรันคำสั่ง SQL)'
            : `ไม่สามารถอัปโหลดรูปภาพไปยังที่จัดเก็บข้อมูลได้ (${uploadError})`;

          await this.markSlipFailed(userId, slipId, failMsg);
          results.push({
            file_name: fileName,
            result: 'failed',
            slip_id: slipId,
            message: failMsg,
          });
          continue;
        }

        // 4. Send image to Template slip extractor
        const extraction = await this.slipExtractor.extractFromImage(
          file.buffer,
          file.mimetype,
        );

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

        // 9. Check duplicate transaction_ref (per user)
        if (extraction.transaction_ref) {
          const { data: duplicateTx } = await this.supabase
            .getClient()
            .from('transactions')
            .select('id, transaction_ref')
            .eq('user_id', userId)
            .eq('transaction_ref', extraction.transaction_ref)
            .maybeSingle();

          if (duplicateTx) {
            // Update slip as duplicate/extracted
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
              slip_id: slipId,
              message: 'สลิปนี้ถูกบันทึกในระบบแล้ว (รหัสอ้างอิงตรงกัน)',
            });
            continue;
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
            transaction_ref: extraction.transaction_ref || null,
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
              slip_id: slipId,
              message: 'สลิปนี้ถูกบันทึกในระบบแล้ว (รหัสอ้างอิงตรงกัน)',
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
